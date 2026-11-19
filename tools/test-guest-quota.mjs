import test from 'node:test';
import assert from 'node:assert/strict';
import { requestFigureChat } from '../src/features/figure-chat/request.ts';
import { reserveGuestQuotaSlot, rollbackGuestQuotaSlot, readOrCreateGuestIdentity } from '../api/_lib/guest-quota.js';

test('guest quota is enforced before model calls and remains separate from account quota', async (t) => {
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
  let providerMode = 'ok';
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
        const [script, keyCount, key, first, second, ttl] = args;
        assert.equal(keyCount, 1);
        const hash = hashes.get(key) || new Map();
        let used = Number(hash.get('used') || 0);
        if (script.startsWith('-- guest-reserve-v1')) {
          if (used >= first) return { result: [0, used] };
          assert.ok(ttl > 0);
          hash.set('used', ++used); hash.set(second, '1'); hashes.set(key, hash);
          return { result: [1, used] };
        }
        assert.ok(script.startsWith('-- guest-rollback-v1'));
        if (hash.delete(first)) hash.set('used', used = Math.max(0, used - 1));
        return { result: used };
      });
      return Response.json(results);
    }
    assert.equal(url.href, 'https://model.invalid/v1/chat/completions');
    modelCalls++;
    if (providerMode === 'error') return new Response('private provider error', { status: 500 });
    if (providerMode === 'timeout') throw Object.assign(new Error('timeout'), { name: 'AbortError' });
    return Response.json({ choices: [{ message: { content: providerMode === 'empty' ? '' : '模拟模型回复' } }] });
  };

  for (let i = 0; i < 7; i++) assert.equal((await invoke('POST')).status, 428);
  assert.equal(modelCalls, 0, 'requests that discard the guest cookie cannot call the model');

  const cookie = await guestCookie();
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
  assert.equal(concurrent.filter(result => result.status === 429).length, 15);
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
  assert.equal(reserved.quota.remaining, 4);
  await rollbackGuestQuotaSlot(reserved.reservation);
  assert.equal((await rollbackGuestQuotaSlot(reserved.reservation)).remaining, 5, 'refund is idempotent');

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
});
