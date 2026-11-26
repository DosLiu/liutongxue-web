import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDigitalHumanKnowledge } from '../api/_lib/digital-human-skill.js';

test('digital human loads only the agreed files, refreshes atomically, and fails safely', async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  const envKeys = ['OPENAI_API_KEY', 'DIGITAL_HUMAN_GITHUB_TOKEN', 'OPENAI_BASE_URL', 'AUTH_LOGIN_ENABLED', 'AUTH_SESSION_SECRET', 'AUTH_KV_ENABLED', 'AUTH_DAILY_LIMIT', 'KV_REST_API_URL', 'KV_REST_API_TOKEN'];
  const oldEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const token = 'local-test-token';
  let expectedGitHubToken = token;
  const paths = ['SKILL.md', 'references/profile.md', 'references/evidence.md'];
  let now = 1000000;
  let sha = 'a'.repeat(40);
  let version = 'first';
  let failure = '';
  const githubRequests = [];
  let modelRequest;
  let accountUsage = 0;

  Date.now = () => now;
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    if (url.hostname === 'api.github.com') {
      assert.equal(options.headers.Authorization, `Bearer ${expectedGitHubToken}`);
      githubRequests.push(url);
      if (failure === 'denied' || failure === 'temporary') {
        return new Response('', { status: failure === 'denied' ? 403 : 500 });
      }
      if (url.pathname.endsWith('/commits/main')) return Response.json({ sha });
      const path = decodeURIComponent(url.pathname.split('/contents/')[1] || '');
      assert.ok(paths.includes(path), `unexpected path: ${path}`);
      assert.equal(url.searchParams.get('ref'), sha);
      if (failure === 'partial-update' && path === paths[2]) return new Response('', { status: 500 });
      const contents = Buffer.from(`${version}: ${path}`);
      return Response.json({ type: 'file', encoding: 'base64', content: contents.toString('base64'), size: contents.length });
    }
    if (url.hostname === 'kv.example.test') {
      const commands = JSON.parse(options.body);
      return Response.json(commands.map(([command]) => ({ result: command === 'INCR' ? ++accountUsage : command === 'DECR' ? --accountUsage : command === 'GET' ? accountUsage : 1 })));
    }
    assert.equal(url.href, 'https://example.test/v1/chat/completions');
    modelRequest = JSON.parse(options.body);
    return Response.json({ choices: [{ message: { content: '这是一条测试回复。' } }] });
  };

  try {
    await assert.rejects(loadDigitalHumanKnowledge(''));
    const [first, concurrent] = await Promise.all([loadDigitalHumanKnowledge(token), loadDigitalHumanKnowledge(token)]);
    assert.equal(first.sha, sha);
    assert.deepEqual(first, concurrent);
    assert.deepEqual(first.documents.map((document) => document.path), paths);
    assert.equal(githubRequests.length, 4);

    now += 60000;
    await loadDigitalHumanKnowledge(token);
    assert.equal(githubRequests.length, 4, 'a fresh cache should not refetch');

    now += 240001;
    const [verified, concurrentVerification] = await Promise.all([loadDigitalHumanKnowledge(token), loadDigitalHumanKnowledge(token)]);
    assert.equal(verified, concurrentVerification);
    assert.equal(verified.documents, first.documents);
    assert.equal(githubRequests.length, 5, 'concurrent refreshes of an unchanged commit make one request');
    assert.ok(githubRequests.at(-1).pathname.endsWith('/commits/main'));

    now += 60000;
    assert.equal(await loadDigitalHumanKnowledge(token), verified);
    assert.equal(githubRequests.length, 5, 'confirming the SHA starts a new cache window');

    now += 300001;
    sha = 'b'.repeat(40);
    version = 'second';
    failure = 'partial-update';
    const partialUpdate = await loadDigitalHumanKnowledge(token);
    assert.equal(partialUpdate.sha, first.sha);
    assert.equal(partialUpdate.documents, first.documents, 'a failed download keeps the entire previous version');
    assert.equal(partialUpdate.stale, true);

    now += 300001;
    failure = '';
    const beforeUpdate = githubRequests.length;
    const updated = await loadDigitalHumanKnowledge(token);
    assert.equal(updated.sha, sha);
    assert.ok(updated.documents.every((document) => document.content.startsWith('second:')));
    assert.equal(githubRequests.length - beforeUpdate, 4, 'a new commit downloads all three documents');

    now += 300001;
    failure = 'temporary';
    const stale = await loadDigitalHumanKnowledge(token);
    assert.equal(stale.sha, sha);
    assert.equal(stale.stale, true);

    now += 300001;
    failure = '';
    const beforeRecovery = githubRequests.length;
    const recovered = await loadDigitalHumanKnowledge(token);
    assert.equal(recovered.documents, updated.documents);
    assert.equal(recovered.stale, undefined, 'a verified commit clears the stale status');
    assert.equal(githubRequests.length - beforeRecovery, 1);

    now += 300001;
    failure = 'denied';
    await assert.rejects(loadDigitalHumanKnowledge(token), 'revoked access must not reuse cached documents');

    failure = '';
    const beforeReload = githubRequests.length;
    await loadDigitalHumanKnowledge(token);
    assert.equal(githubRequests.length - beforeReload, 4, 'permission denial discards the previous snapshot');
    now += 300001;
    failure = 'temporary';
    assert.equal((await loadDigitalHumanKnowledge(token)).stale, true);
    now += 24 * 60 * 60 * 1000;
    await assert.rejects(loadDigitalHumanKnowledge(token), 'stale documents must eventually expire');
    failure = '';
    await loadDigitalHumanKnowledge(token);

    expectedGitHubToken = 'other-local-test-token';
    const beforeTokenChange = githubRequests.length;
    await loadDigitalHumanKnowledge(expectedGitHubToken);
    assert.equal(githubRequests.length - beforeTokenChange, 4, 'a different token must retrieve its own complete snapshot');
    expectedGitHubToken = token;
    await loadDigitalHumanKnowledge(token);

    process.env.OPENAI_API_KEY = 'local-test-model-key';
    process.env.DIGITAL_HUMAN_GITHUB_TOKEN = token;
    process.env.OPENAI_BASE_URL = 'https://example.test/v1';
    process.env.AUTH_LOGIN_ENABLED = 'true';
    process.env.AUTH_SESSION_SECRET = 'local-test-session-secret-long-enough';
    process.env.AUTH_KV_ENABLED = 'true';
    process.env.KV_REST_API_URL = 'https://kv.example.test';
    process.env.KV_REST_API_TOKEN = 'local-test-kv-token';
    const { buildSessionCookie } = await import('../api/_lib/auth.js');
    const initialCookie = await buildSessionCookie({ subject: 'initial-test-user', expiresAt: new Date(now + 3600000).toISOString() }, { headers: {} });
    const { default: handler } = await import('../api/chat.ts');
    const result = { statusCode: 0, body: null };
    const response = {
      setHeader() {},
      status(code) { result.statusCode = code; return this; },
      json(body) { result.body = body; return this; },
      end() { return this; }
    };
    await handler({ method: 'POST', headers: { cookie: initialCookie }, body: { figureId: 'liu-dongsheng', messages: [{ role: 'user', content: '你好' }] } }, response);
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.mode, 'api');
    assert.equal(result.body.reply, '这是一条测试回复。');
    assert.ok(paths.every((path) => modelRequest.messages[0].content.includes(`second: ${path}`)));
    assert.ok(!JSON.stringify(result.body).includes(token));
    assert.ok(!JSON.stringify(result.body).includes('second: references/'));

    await handler({ method: 'GET', headers: { cookie: initialCookie }, query: { figureId: 'liu-dongsheng' } }, response);
    assert.equal(result.body.status, 'api');
    delete process.env.DIGITAL_HUMAN_GITHUB_TOKEN;
    await handler({ method: 'GET', headers: {}, query: { figureId: 'liu-dongsheng' } }, response);
    assert.equal(result.body.status, 'offline');
    await handler({ method: 'POST', headers: {}, body: { figureId: 'liu-dongsheng', messages: [{ role: 'user', content: '你好' }] } }, response);
    assert.equal(result.body.status, 'offline');
    assert.equal(result.body.shouldConsume, false);

    process.env.DIGITAL_HUMAN_GITHUB_TOKEN = token;
    process.env.AUTH_SESSION_SECRET = 'local-test-session-secret-long-enough';
    process.env.AUTH_KV_ENABLED = 'true';
    process.env.AUTH_DAILY_LIMIT = '10';
    process.env.KV_REST_API_URL = 'https://kv.example.test';
    process.env.KV_REST_API_TOKEN = 'local-test-kv-token';
    const cookie = await buildSessionCookie({ subject: 'test-user', expiresAt: new Date(now + 3600000).toISOString() }, { headers: {} });
    const accountRequest = { method: 'POST', headers: { cookie }, body: { figureId: 'liu-dongsheng', messages: [{ role: 'user', content: '你好' }] } };
    accountUsage = 9;
    await handler(accountRequest, response);
    assert.equal(result.statusCode, 200, 'the tenth reserved request must still receive a reply');
    assert.equal(result.body.mode, 'api');
    assert.equal(result.body.quota.remaining, 0);
    await handler(accountRequest, response);
    assert.equal(result.statusCode, 429, 'requests after the quota must be rejected');
    assert.equal(accountUsage, 10);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    for (const [key, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
