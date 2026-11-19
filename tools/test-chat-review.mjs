import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFigureChatRequestBody, getFigureChatHealthPayload, isFigureChatApiResponse, applyFigureChatCors } from '../api/_lib/figure-chat.js';

test('JSON primitives cannot crash the request handler', async () => {
  for (const value of ['null', 'false', '0', '"text"', '[]']) {
    assert.deepEqual(parseFigureChatRequestBody(value), {});
  }
  const { default: handler } = await import('../api/chat.ts');
  let status;
  const res = { setHeader() {}, status(code) { status = code; return this; }, json() {} };
  await handler({ method: 'POST', headers: {}, body: 'null' }, res);
  assert.equal(status, 400);
});

test('health checks never claim to consume quota', () => {
  assert.equal(getFigureChatHealthPayload(true).shouldConsume, false);
});

test('non-JSON or malformed health responses cannot imply a working model', () => {
  for (const value of [null, '<html>preview</html>', {}, { mode: 'api' }, { mode: 'api', status: 'api', reply: 1 }]) {
    assert.equal(isFigureChatApiResponse(value), false);
  }
  assert.equal(isFigureChatApiResponse(getFigureChatHealthPayload(true)), true);
});

test('only explicitly allowed origins can receive credentialed chat responses', () => {
  const headers = {};
  const res = { setHeader(key, value) { headers[key] = value; } };
  const origins = new Set(['https://trusted.test']);
  applyFigureChatCors({ headers: { origin: 'https://trusted.test' } }, res, origins);
  assert.equal(headers['Access-Control-Allow-Credentials'], 'true');
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://trusted.test');
  delete headers['Access-Control-Allow-Credentials'];
  applyFigureChatCors({ headers: { origin: 'https://unknown.test' } }, res, origins);
  assert.equal(headers['Access-Control-Allow-Credentials'], undefined);
});

test('pausing login by default disables both direct and legacy endpoints with existing provider settings', async (t) => {
  const providerSettings = {
    DAEN_CONNECT_URL: 'https://login-provider.invalid/connect.php',
    DAEN_APP_ID: 'test-id',
    DAEN_APP_KEY: 'test-key',
    DAEN_AUTH_CALLBACK_URL: 'https://site.invalid/api/auth/callback',
    DAEN_ENABLED_TYPES: 'qq,baidu',
    AUTH_SESSION_SECRET: 'test-session-secret-longer-than-32-characters'
  };
  const savedEnv = Object.fromEntries([...Object.keys(providerSettings), 'AUTH_LOGIN_ENABLED'].map(key => [key, process.env[key]]));
  const savedFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  Object.assign(process.env, providerSettings);
  delete process.env.AUTH_LOGIN_ENABLED;

  let providerRequests = 0;
  globalThis.fetch = async (input) => {
    assert.equal(new URL(input).origin, 'https://login-provider.invalid');
    providerRequests++;
    return Response.json({ code: 0, url: 'https://login-provider.invalid/authorize' });
  };
  const { default: login } = await import('../api/auth/login.js');
  const { default: callback } = await import('../api/auth/callback.js');
  const { default: logout } = await import('../api/auth/logout.js');
  const { default: me } = await import('../api/auth/me.js');
  const { default: legacy } = await import('../api/daen.ts');
  async function invoke(handler, query = {}) {
    const result = { status: 0, headers: {}, body: null };
    const res = {
      setHeader(key, value) { result.headers[key] = value; },
      status(code) { result.status = code; return this; },
      json(body) { result.body = body; },
      end() {}
    };
    await handler({ method: 'GET', headers: {}, query }, res);
    return result;
  }
  for (const handler of [login, callback, logout]) {
    const response = await invoke(handler, { type: 'qq' });
    assert.equal(response.status, 503);
    assert.equal(response.body.error, 'login_disabled');
    assert.equal(response.headers.Location, undefined);
  }
  for (const route of ['login', 'callback', 'logout']) {
    assert.equal((await invoke(legacy, { route, type: 'qq' })).body.error, 'login_disabled');
  }
  const state = await invoke(me);
  assert.equal(state.status, 200);
  assert.equal(state.body.loginEnabled, false);
  assert.equal(state.body.loginReady, false);
  assert.equal(state.body.authenticated, false);
  assert.deepEqual(state.body.loginProviders, []);
  assert.equal(providerRequests, 0);

  process.env.AUTH_LOGIN_ENABLED = 'true';
  const enabled = await invoke(me);
  assert.equal(enabled.body.loginEnabled, true);
  assert.equal(enabled.body.loginReady, true);
  assert.deepEqual(enabled.body.loginProviders.map(provider => provider.type), ['qq', 'baidu']);
  assert.equal((await invoke(login, { type: 'qq' })).status, 302);
  assert.equal(providerRequests, 1);
});

test('provider error bodies cannot be reflected to visitors', async (t) => {
  const savedFetch = globalThis.fetch;
  const keys = ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'AUTH_LOGIN_ENABLED', 'AUTH_SESSION_SECRET', 'AUTH_KV_ENABLED', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  const savedEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.OPENAI_BASE_URL = 'https://provider.invalid/v1';
  process.env.AUTH_LOGIN_ENABLED = 'true';
  process.env.AUTH_SESSION_SECRET = 'test-session-secret-longer-than-32-characters';
  process.env.AUTH_KV_ENABLED = 'true';
  process.env.KV_REST_API_URL = 'https://kv.invalid';
  process.env.KV_REST_API_TOKEN = 'test-token';
  let modelCalls = 0;
  globalThis.fetch = async (input, options) => {
    if (new URL(input).hostname === 'kv.invalid') {
      return Response.json(JSON.parse(options.body).map(([command]) => ({ result: command === 'DECR' || command === 'GET' ? 0 : 1 })));
    }
    modelCalls++;
    return new Response('provider-private-error-canary', { status: 500 });
  };
  const { default: handler } = await import('../api/chat.ts');
  const { buildSessionCookie } = await import('../api/_lib/auth.js');
  const cookie = await buildSessionCookie({ subject: 'review-account', expiresAt: new Date(Date.now() + 3600000).toISOString() }, { headers: {} });
  let payload;
  const res = { setHeader() {}, status() { return this; }, json(body) { payload = body; } };
  await handler({ method: 'POST', headers: { cookie }, body: { figureId: 'steve-jobs', messages: [{ role: 'user', content: '测试问题' }] } }, res);
  assert.equal(payload.shouldConsume, false);
  assert.equal(modelCalls, 1);
  assert.ok(!JSON.stringify(payload).includes('provider-private-error-canary'));
});

test('GitHub rate limits keep a complete previous snapshot without masking revoked access', async (t) => {
  const savedFetch = globalThis.fetch;
  const savedNow = Date.now;
  t.after(() => { globalThis.fetch = savedFetch; Date.now = savedNow; });
  let now = savedNow();
  Date.now = () => now;
  let failure = '';
  const sha = 'c'.repeat(40);
  globalThis.fetch = async (input) => {
    if (failure === 'rate-limit') return new Response('', { status: 403, headers: { 'x-ratelimit-remaining': '0' } });
    if (failure === 'denied') return new Response('', { status: 403 });
    const url = new URL(input);
    if (url.pathname.endsWith('/commits/main')) return Response.json({ sha });
    const bytes = Buffer.from('complete test document');
    return Response.json({ type: 'file', encoding: 'base64', size: bytes.length, content: bytes.toString('base64') });
  };
  const { loadDigitalHumanKnowledge } = await import('../api/_lib/digital-human-skill.js?review-rate-limit');
  await loadDigitalHumanKnowledge('test-token');
  now += 300001;
  failure = 'rate-limit';
  const snapshot = await loadDigitalHumanKnowledge('test-token');
  assert.equal(snapshot.sha, sha);
  assert.equal(snapshot.documents.length, 3);
  assert.equal(snapshot.stale, true);
  now += 300001;
  failure = 'denied';
  await assert.rejects(loadDigitalHumanKnowledge('test-token'));
});

test('a failed request from the previous day cannot refund the current day', async (t) => {
  const savedFetch = globalThis.fetch;
  const keys = ['AUTH_KV_ENABLED', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  const savedEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.AUTH_KV_ENABLED = 'true';
  process.env.KV_REST_API_URL = 'https://kv.invalid';
  process.env.KV_REST_API_TOKEN = 'test-token';
  const commands = [];
  globalThis.fetch = async (_url, options) => {
    const batch = JSON.parse(options.body);
    commands.push(...batch);
    return Response.json(batch.map(() => ({ result: 2 })));
  };
  const { rollbackAccountQuotaSlot } = await import('../api/_lib/quota.js');
  const snapshot = await rollbackAccountQuotaSlot('test-user', new Date(Date.now() - 2 * 86400000));
  assert.equal(commands.length, 1);
  assert.equal(commands[0][0], 'GET');
  assert.equal(snapshot.used, 2);
});

test('an unresponsive quota service is bounded by a timeout', async (t) => {
  const savedFetch = globalThis.fetch;
  const keys = ['AUTH_KV_ENABLED', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  const savedEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.AUTH_KV_ENABLED = 'true';
  process.env.KV_REST_API_URL = 'https://kv.invalid';
  process.env.KV_REST_API_TOKEN = 'test-token';
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let bounded = false;
  globalThis.fetch = async (_url, options) => {
    bounded = Boolean(options.signal);
    if (!options.signal) throw new Error('missing timeout signal');
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  };
  const { getAccountQuotaSnapshot } = await import('../api/_lib/quota.js');
  const pending = getAccountQuotaSnapshot('test-user');
  t.mock.timers.tick(4001);
  const snapshot = await pending;
  assert.equal(bounded, true);
  assert.equal(snapshot.mode, 'unavailable');
});
