import test from 'node:test';
import assert from 'node:assert/strict';

test('account quota blocks paid calls when storage is unavailable and preserves the daily limit', async (t) => {
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
    AUTH_LOGIN_ENABLED: 'true', AUTH_SESSION_SECRET: 'test-account-secret-at-least-32-characters', AUTH_KV_ENABLED: 'true',
    KV_REST_API_URL: 'https://kv.invalid', KV_REST_API_TOKEN: 'test-token', AUTH_DAILY_LIMIT: '10'
  });
  let failure = '';
  let used = 0;
  let modelCalls = 0;
  let providerFailure = false;
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input);
    if (url.hostname === 'kv.invalid') {
      if (failure === 'network') throw new Error('simulated network failure');
      if (failure === 'timeout') return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
      if (failure === 'http') return new Response('', { status: 401 });
      if (failure === 'json') return new Response('not json');
      const commands = JSON.parse(options.body);
      return Response.json(commands.map(([command]) => {
        if (failure === 'invalid-count') return { result: 'not-a-count' };
        if (failure === 'null-count' && command === 'INCR') return { result: null };
        if (failure === 'command') return { error: 'storage error' };
        return { result: command === 'INCR' ? ++used : command === 'DECR' ? --used : command === 'GET' ? used : 1 };
      }));
    }
    assert.equal(url.href, 'https://model.invalid/v1/chat/completions');
    modelCalls++;
    return providerFailure ? new Response('', { status: 500 }) : Response.json({ choices: [{ message: { content: '测试回复' } }] });
  };
  const { default: handler } = await import('../api/chat.ts');
  const { buildSessionCookie } = await import('../api/_lib/auth.js');
  const cookie = await buildSessionCookie({ subject: 'quota-account', expiresAt: new Date(Date.now() + 3600000).toISOString() }, { headers: {} });
  async function invoke(method = 'POST') {
    const result = { status: 0, body: null };
    const res = { setHeader() {}, status(code) { result.status = code; return this; }, json(body) { result.body = body; } };
    await handler({ method, headers: { cookie }, body: { figureId: 'steve-jobs', messages: [{ role: 'user', content: '测试问题' }] } }, res);
    return result;
  }
  async function assertBlocked(label) {
    const before = modelCalls;
    const response = await invoke();
    assert.equal(response.status, 503, label);
    assert.equal(response.body.error, 'quota_unavailable', label);
    assert.equal(response.body.quota.mode, 'unavailable', label);
    assert.equal(response.body.status, 'offline', label);
    assert.equal(response.body.shouldConsume, false, label);
    assert.equal(modelCalls, before, label);
  }
  process.env.AUTH_KV_ENABLED = 'false';
  await assertBlocked('quota disabled');
  process.env.AUTH_KV_ENABLED = 'true';
  process.env.KV_REST_API_TOKEN = '';
  await assertBlocked('token missing');
  process.env.KV_REST_API_TOKEN = 'test-token';
  for (failure of ['network', 'http', 'json', 'command', 'invalid-count', 'null-count']) await assertBlocked(failure);
  failure = 'network';
  const health = await invoke('GET');
  assert.equal(health.body.status, 'offline');
  assert.equal(health.body.quota.mode, 'unavailable');

  failure = 'timeout';
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { reserveAccountQuotaSlot } = await import('../api/_lib/quota.js');
  const pending = reserveAccountQuotaSlot('quota-account');
  t.mock.timers.tick(4001);
  assert.equal((await pending).allowed, false);
  t.mock.timers.reset();

  failure = '';
  used = 0;
  for (let count = 1; count <= 10; count++) {
    const response = await invoke();
    assert.equal(response.status, 200);
    assert.equal(response.body.quota.remaining, 10 - count);
    assert.equal(response.body.reply, '测试回复');
  }
  assert.equal(modelCalls, 10);
  assert.equal((await invoke()).status, 429);
  assert.equal(modelCalls, 10);

  used = 0;
  providerFailure = true;
  const failedModel = await invoke();
  assert.equal(failedModel.body.shouldConsume, false);
  assert.equal(used, 0, 'failed model calls refund the reservation');
  delete process.env.OPENAI_API_KEY;
  failure = 'network';
  const demo = await invoke();
  assert.equal(demo.status, 200, 'free demo replies can remain available');
  assert.equal(demo.body.mode, 'mock');
  assert.equal(demo.body.shouldConsume, false);
});
