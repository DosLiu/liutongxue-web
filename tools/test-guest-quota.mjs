import test from 'node:test';
import assert from 'node:assert/strict';
import { requestFigureChat } from '../src/features/figure-chat/request.ts';
import { commitGuestQuotaSlot, reserveGuestQuotaSlot, rollbackGuestQuotaSlot, readOrCreateGuestIdentity } from '../api/_lib/guest-quota.js';

test('guest quota is enforced before model calls and remains separate from account quota', async (t) => {
  const midnight = new Date('2026-01-31T16:00:00.000Z');
  const nextMidnight = '2026-02-01T16:00:00.000Z';
  t.mock.timers.enable({ apis: ['Date'], now: midnight.getTime() - 120000 });
  const savedFetch = globalThis.fetch;
  const keys = ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'AUTH_LOGIN_ENABLED', 'AUTH_SESSION_SECRET', 'AUTH_KV_ENABLED', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'AUTH_DAILY_LIMIT'];
  const savedEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  Object.assign(process.env, {
    OPENAI_API_KEY: 'test-model-key', OPENAI_BASE_URL: 'https://model.invalid/v1',
    AUTH_SESSION_SECRET: 'test-secret-with-at-least-32-characters', AUTH_KV_ENABLED: 'true',
    KV_REST_API_URL: 'https://kv.invalid', KV_REST_API_TOKEN: 'test-kv-token', AUTH_DAILY_LIMIT: '10'
  });
  delete process.env.AUTH_LOGIN_ENABLED;
  const { default: handler } = await import('../api/chat.ts');
  const invoke = async (method, cookie = '', extraBody = {}) => {
    const result = { status: 0, headers: {}, body: null };
    const res = {
      setHeader(key, value) { result.headers[key] = value; },
      status(code) { result.status = code; return this; }, json(body) { result.body = body; return this; }
    };
    await handler({ method, headers: { cookie, 'x-forwarded-proto': 'https' }, body: {
      figureId: 'steve-jobs', messages: [{ role: 'user', content: '普通测试问题' }], ...extraBody
    } }, res);
    return result;
  };
  const guestCookie = async () => {
    const health = await invoke('GET');
    assert.equal(health.body.quota.remaining, 5);
    assert.match(health.headers['Set-Cookie'], /HttpOnly/);
    assert.match(health.headers['Set-Cookie'], /Secure/);
    return health.headers['Set-Cookie'].split(';')[0];
  };
  const hashes = new Map();
  const accountCounts = new Map();
  let storageFailure = false;
  let lostReserveReplies = 0;
  let lostCommitReplies = 0;
  let rollbackUnavailable = false;
  let providerMode = 'ok';
  let modelReplyTime = null;
  let modelCalls = 0;
  let browserCookie = '';
  let browserCalls = 0;
  let cookiesEnabled = true;
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    if (url.hostname === 'site.invalid') {
      browserCalls++;
      assert.equal(options.credentials, 'include');
      const result = await invoke('POST', cookiesEnabled ? browserCookie : '', JSON.parse(options.body));
      if (cookiesEnabled && result.headers['Set-Cookie']) browserCookie = result.headers['Set-Cookie'].split(';')[0];
      return Response.json(result.body, { status: result.status });
    }
    if (url.hostname === 'kv.invalid') {
      if (storageFailure) throw new Error('simulated storage outage');
      const commands = JSON.parse(options.body);
      const results = commands.map(([command, ...args]) => {
        if (command === 'HGET') return { result: hashes.get(args[0])?.get(args[1]) ?? null };
        if (command === 'INCR') { const next = (accountCounts.get(args[0]) || 0) + 1; accountCounts.set(args[0], next); return { result: next }; }
        if (command === 'EXPIRE') return { result: 1 };
        assert.equal(command, 'EVAL');
        const [script, keyCount, key, ...parameters] = args;
        assert.equal(keyCount, 1);
        const hash = hashes.get(key) || new Map();
        let used = Number(hash.get('used') || 0);
        if (script.startsWith('-- guest-reserve-v2')) {
          const [limit, ticket, ttl, now, deadline] = parameters;
          if (used >= limit) return { result: [0, used] };
          let pending = 0;
          for (const [field, expiresAt] of hash) {
            if (!field.startsWith('pending:')) continue;
            if (expiresAt > now) pending++;
            else hash.delete(field);
          }
          if (used + pending >= limit) return { result: [2, used] };
          assert.ok(ttl > 0 && ttl <= 86400, 'daily usage records expire within one day');
          hash.set(`pending:${ticket}`, deadline);
          hashes.set(key, hash);
          if (lostReserveReplies > 0) {
            lostReserveReplies--;
            throw new Error('lost reservation response after Redis wrote the reservation');
          }
          return { result: [1, used] };
        }
        assert.ok(script.startsWith('-- guest-settle-v2'));
        const [ticket, action, now, limit] = parameters;
        const pendingField = `pending:${ticket}`;
        if (action === 'rollback') {
          if (rollbackUnavailable) throw new Error('Redis unavailable during rollback');
          hash.delete(pendingField);
          if (hash.delete(ticket)) hash.set('used', used = Math.max(0, used - 1));
          return { result: used };
        }
        if (!hash.has(ticket)) {
          if ((hash.get(pendingField) || 0) <= now || used >= limit) return { result: null };
          hash.delete(pendingField);
          hash.set(ticket, '1');
          hash.set('used', ++used);
        }
        if (lostCommitReplies > 0) {
          lostCommitReplies--;
          throw new Error('lost commit response after Redis confirmed the use');
        }
        return { result: used };
      });
      return Response.json(results);
    }
    assert.equal(url.href, 'https://model.invalid/v1/chat/completions');
    modelCalls++;
    if (modelReplyTime !== null) t.mock.timers.setTime(modelReplyTime);
    if (providerMode === 'error') return new Response('private provider error', { status: 500 });
    if (providerMode === 'timeout') throw Object.assign(new Error('timeout'), { name: 'AbortError' });
    return Response.json({ choices: [{ message: { content: providerMode === 'empty' ? '' : '模拟模型回复' } }] });
  };

  for (let i = 0; i < 7; i++) assert.equal((await invoke('POST')).status, 428);
  assert.equal(modelCalls, 0, 'requests that discard the guest cookie cannot call the model');

  const cookie = await guestCookie();
  const guest = readOrCreateGuestIdentity({ headers: { cookie } }, { setHeader() {} }).identity;
  hashes.set(`liutongxue:figure-chat:guest:${guest.id}`, new Map([['used', 5]]));
  const firstDailyQuota = (await invoke('GET', cookie)).body.quota;
  assert.equal(firstDailyQuota.remaining, 5, 'existing guests start with the new daily allowance');
  assert.equal(firstDailyQuota.mode, 'daily');
  assert.equal(firstDailyQuota.resetAt, midnight.toISOString());
  for (let i = 0; i < 5; i++) {
    const result = await invoke('POST', cookie);
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, 'api');
    assert.equal(result.body.quota.remaining, 4 - i);
  }
  assert.equal(modelCalls, 5);
  assert.equal((await invoke('POST', cookie, { remaining: 999, guestId: 'forged-browser-data' })).status, 429);
  assert.equal((await invoke('GET', cookie)).body.quota.remaining, 0);
  assert.equal((await invoke('POST', cookie, { figureId: 'customer-service' })).status, 429, 'all figures share the same guest allowance');
  const separator = cookie.lastIndexOf('.');
  const forgedCookie = `${cookie.slice(0, separator + 1)}${'0'.repeat(64)}`;
  assert.equal((await invoke('POST', forgedCookie)).status, 428, 'tampering with the identity cannot authorize a model call');
  assert.equal(modelCalls, 5, 'changing client-side data cannot bypass the server count');

  const concurrentCookie = await guestCookie();
  const beforeConcurrent = modelCalls;
  const concurrent = await Promise.all(Array.from({ length: 20 }, () => invoke('POST', concurrentCookie)));
  assert.equal(concurrent.filter(result => result.status === 200).length, 5);
  assert.equal(concurrent.filter(result => [429, 503].includes(result.status)).length, 15);
  assert.equal(modelCalls - beforeConcurrent, 5);

  const retryCookie = await guestCookie();
  for (const mode of ['error', 'timeout', 'empty']) {
    providerMode = mode;
    const failed = await invoke('POST', retryCookie);
    assert.equal(failed.body.shouldConsume, false);
    assert.equal(failed.body.quota.remaining, 5, 'a failed model call restores its reservation');
  }
  providerMode = 'ok';
  const identity = readOrCreateGuestIdentity({ headers: { cookie: retryCookie } }, { setHeader() {} }).identity;
  const reserved = await reserveGuestQuotaSlot(identity);
  assert.equal(reserved.quota.remaining, 5, 'a reservation is not a charge');
  assert.equal((await commitGuestQuotaSlot(reserved.reservation)).remaining, 4);
  assert.equal((await commitGuestQuotaSlot(reserved.reservation)).remaining, 4, 'confirming the same reply twice only charges once');
  await rollbackGuestQuotaSlot(reserved.reservation);
  assert.equal((await rollbackGuestQuotaSlot(reserved.reservation)).remaining, 5, 'refund is idempotent');

  const beforeLostReserve = modelCalls;
  lostReserveReplies = 1;
  assert.equal((await invoke('POST', retryCookie)).status, 503);
  assert.equal((await invoke('GET', retryCookie)).body.quota.remaining, 5);
  assert.equal(hashes.get(reserved.reservation.key).size, 1, 'cancellation removes the original pending ticket');
  assert.equal(modelCalls, beforeLostReserve, 'an unconfirmed reservation never calls the model');

  const pendingCookie = await guestCookie();
  lostReserveReplies = 5;
  rollbackUnavailable = true;
  for (let i = 0; i < 5; i++) assert.equal((await invoke('POST', pendingCookie)).status, 503);
  rollbackUnavailable = false;
  assert.equal((await invoke('GET', pendingCookie)).body.quota.remaining, 5, 'lost holds do not look like spent attempts');
  assert.equal((await invoke('POST', pendingCookie)).status, 503, 'active holds are counted when admitting model calls');
  assert.equal(modelCalls, beforeLostReserve);
  t.mock.timers.setTime(Date.now() + 41000);
  lostCommitReplies = 1;
  const afterExpiry = await invoke('POST', pendingCookie);
  assert.equal(afterExpiry.status, 200, 'unreachable cancellations expire on the same day');
  assert.equal(afterExpiry.body.quota.remaining, 4, 'retrying an ambiguous commit preserves a single charge');
  assert.equal(modelCalls, beforeLostReserve + 1);

  const existingCookie = await guestCookie();
  const { identity: existingGuest } = readOrCreateGuestIdentity({ headers: { cookie: existingCookie } }, { setHeader() {} });
  const existingKey = `liutongxue:figure-chat:guest:2026-01-31:${existingGuest.id}`;
  hashes.set(existingKey, new Map([['used', 2], ['old-ticket-a', '1'], ['old-ticket-b', '1']]));
  assert.equal((await invoke('GET', existingCookie)).body.quota.remaining, 3);
  assert.equal((await invoke('POST', existingCookie)).body.quota.remaining, 2, 'existing daily charges still apply after deployment');

  const beforeHandshake = modelCalls;
  const handshaken = await requestFigureChat('https://site.invalid/api/chat', { messages: [{ role: 'user', content: '首次访问' }] }, new AbortController().signal);
  assert.equal(handshaken.response.status, 200);
  assert.equal(browserCalls, 2);
  assert.equal(modelCalls - beforeHandshake, 1, 'the handshake retry only calls the model once');
  cookiesEnabled = false; browserCalls = 0;
  const disabled = await requestFigureChat('https://site.invalid/api/chat', {}, new AbortController().signal);
  assert.equal(disabled.response.status, 428);
  assert.equal(browserCalls, 2, 'blocked cookies cannot create an infinite retry loop');
  assert.equal(modelCalls - beforeHandshake, 1);

  const beforeOutage = modelCalls;
  storageFailure = true;
  assert.equal((await invoke('POST', retryCookie)).status, 503);
  storageFailure = false;
  process.env.AUTH_KV_ENABLED = 'false';
  assert.equal((await invoke('POST', retryCookie)).status, 503);
  process.env.AUTH_KV_ENABLED = 'true';
  const secret = process.env.AUTH_SESSION_SECRET;
  process.env.AUTH_SESSION_SECRET = '';
  assert.equal((await invoke('POST', retryCookie)).status, 503);
  process.env.AUTH_SESSION_SECRET = secret;
  assert.equal(modelCalls, beforeOutage, 'an unverifiable guest quota must not call the model');

  const { buildSessionCookie } = await import('../api/_lib/auth.js');
  const accountCookie = await buildSessionCookie({ subject: 'account-test', expiresAt: new Date(Date.now() + 3600000).toISOString() }, { headers: {} });
  const stillGuest = await invoke('POST', `${cookie}; ${accountCookie}`);
  assert.equal(stillGuest.status, 429, 'old account cookies do not take precedence while login is paused');
  assert.equal(stillGuest.body.quota.scope, 'device');
  assert.doesNotMatch(stillGuest.body.reason, /登录/);
  assert.equal(modelCalls, beforeOutage);

  process.env.AUTH_LOGIN_ENABLED = 'true';
  const signedIn = await invoke('POST', `${cookie}; ${accountCookie}`);
  assert.equal(signedIn.status, 200, 'logging in switches an exhausted guest to its account quota');
  assert.equal(signedIn.body.quota.scope, 'account');
  assert.equal(signedIn.body.quota.remaining, 9);

  t.mock.timers.setTime(midnight.getTime() - 1000);
  const crossingCookie = await guestCookie();
  const crossingIdentity = readOrCreateGuestIdentity({ headers: { cookie: crossingCookie } }, { setHeader() {} }).identity;
  const priorDayReservation = await reserveGuestQuotaSlot(crossingIdentity);
  assert.equal(priorDayReservation.quota.remaining, 5);

  modelReplyTime = midnight.getTime();
  const crossingReply = await invoke('POST', crossingCookie);
  modelReplyTime = null;
  assert.equal(crossingReply.body.shouldConsume, true);
  assert.equal(crossingReply.body.quota.remaining, 5, 'a reply after midnight reports the new day’s balance');
  assert.equal(crossingReply.body.quota.resetAt, nextMidnight);

  const newDay = await invoke('GET', cookie);
  assert.equal(newDay.body.quota.remaining, 5, 'the exhausted guest gets five new attempts at midnight');
  assert.equal(newDay.body.quota.resetAt, nextMidnight);
  assert.equal(newDay.headers['Set-Cookie'], undefined, 'the same guest identity continues into the new day');
  const newDayReply = await invoke('POST', crossingCookie, { figureId: 'customer-service' });
  assert.equal(newDayReply.body.quota.remaining, 4);
  const refundAfterMidnight = await rollbackGuestQuotaSlot(priorDayReservation.reservation);
  assert.equal(refundAfterMidnight.remaining, 4, 'refunding a prior day’s reservation does not increase the new day’s balance');
  assert.equal(refundAfterMidnight.resetAt, nextMidnight);
  assert.equal(hashes.get(priorDayReservation.reservation.key).get('used'), 1, 'the refund is applied to its original day');
});
