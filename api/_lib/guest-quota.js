import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { getAuthConfig } from './auth.js';
import { buildSetCookie, getCookieHeader, isSecureRequest, parseCookies } from './http.js';
import { getQuotaRuntime, runKvPipeline } from './quota.js';

const COOKIE_NAME = 'liutongxue_guest';
const IDENTITY_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;
const GUEST_LIMIT = 5;
const env = globalThis.process?.env ?? {};

// One hash holds the usage and reservation tickets. Each script is atomic.
const RESERVE_SCRIPT = `-- guest-reserve-v1
local used = tonumber(redis.call('HGET', KEYS[1], 'used') or '0')
if used >= tonumber(ARGV[1]) then return {0, used} end
used = used + 1
redis.call('HSET', KEYS[1], 'used', used, ARGV[2], '1')
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
return {1, used}`;

const ROLLBACK_SCRIPT = `-- guest-rollback-v1
local used = tonumber(redis.call('HGET', KEYS[1], 'used') or '0')
if redis.call('HDEL', KEYS[1], ARGV[1]) == 1 then
  used = math.max(0, used - 1)
  redis.call('HSET', KEYS[1], 'used', used)
end
return used`;

const keyFor = (identity) => `liutongxue:figure-chat:guest:${identity.id}`;
const signatureFor = (id, expiresAt, secret) => createHmac('sha256', secret).update(`guest:${id}:${expiresAt}`).digest('hex');
const getSecret = () => env.AUTH_SESSION_SECRET?.trim() || '';
const parseUsed = (value) => {
  if (value === null) return 0;
  const number = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid guest usage');
  return number;
};

export const getUnavailableGuestQuota = () => ({
  scope: 'device', mode: 'unavailable', limit: GUEST_LIMIT, remaining: null,
  exhausted: false, enforced: false, reason: '游客体验次数暂时无法校验，请稍后重试。'
});

const snapshotFromUsed = (used) => ({
  scope: 'device', mode: 'device', limit: GUEST_LIMIT,
  remaining: Math.max(0, GUEST_LIMIT - used), exhausted: used >= GUEST_LIMIT, enforced: true,
  reason: used >= GUEST_LIMIT
    ? `游客的 5 次体验已用完。${getAuthConfig().isLoginReady ? '请登录后继续对话。' : ''}`
    : '游客体验次数由服务端校验。'
});

export function readOrCreateGuestIdentity(req, res) {
  const secret = getSecret();
  if (secret.length < 32 || !getQuotaRuntime().kv.enforced) return { identity: null, created: false };
  const raw = parseCookies(getCookieHeader(req))[COOKIE_NAME];
  if (raw && raw.length < 256) {
    const parts = raw.split('.');
    const [id, expiry, signature] = parts;
    const expiresAt = Number(expiry);
    if (parts.length === 3 && /^[a-f0-9-]{36}$/.test(id || '') && /^[a-f0-9]{64}$/.test(signature || '') &&
        Number.isSafeInteger(expiresAt) && expiresAt > Date.now() && expiresAt <= Date.now() + IDENTITY_LIFETIME_MS) {
      const expected = Buffer.from(signatureFor(id, expiresAt, secret), 'hex');
      if (timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return { identity: { id, expiresAt }, created: false };
    }
  }
  const identity = { id: randomUUID(), expiresAt: Date.now() + IDENTITY_LIFETIME_MS };
  const cookieValue = `${identity.id}.${identity.expiresAt}.${signatureFor(identity.id, identity.expiresAt, secret)}`;
  res.setHeader('Set-Cookie', buildSetCookie(COOKIE_NAME, cookieValue, {
    httpOnly: true, secure: isSecureRequest(req), sameSite: 'Lax', path: '/', maxAge: IDENTITY_LIFETIME_MS / 1000
  }));
  return { identity, created: true };
}

export async function getGuestQuotaSnapshot(identity) {
  if (!identity || identity.expiresAt <= Date.now()) return getUnavailableGuestQuota();
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return getUnavailableGuestQuota();
  try {
    const [result] = await runKvPipeline(runtime, [['HGET', keyFor(identity), 'used']]);
    return snapshotFromUsed(parseUsed(result.result));
  } catch {
    return getUnavailableGuestQuota();
  }
}

export async function reserveGuestQuotaSlot(identity) {
  const unavailable = () => ({ allowed: false, quota: getUnavailableGuestQuota() });
  if (!identity || identity.expiresAt <= Date.now()) return unavailable();
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return unavailable();
  const ticket = randomUUID();
  const ttl = Math.max(1, Math.ceil((identity.expiresAt - Date.now()) / 1000));
  try {
    const [response] = await runKvPipeline(runtime, [['EVAL', RESERVE_SCRIPT, 1, keyFor(identity), GUEST_LIMIT, ticket, ttl]]);
    if (!Array.isArray(response.result) || response.result.length !== 2 || ![0, 1].includes(response.result[0])) throw new Error('Invalid reservation');
    const [allowed, used] = response.result;
    const count = parseUsed(used);
    if ((allowed === 1 && (count < 1 || count > GUEST_LIMIT)) || (allowed === 0 && count < GUEST_LIMIT)) throw new Error('Invalid reservation count');
    const quota = snapshotFromUsed(count);
    return { allowed: allowed === 1, quota, reservation: allowed === 1 ? { identity, ticket } : undefined };
  } catch {
    // The write may have succeeded before the connection failed; never call the model when uncertain.
    return unavailable();
  }
}

export async function rollbackGuestQuotaSlot(reservation) {
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return getUnavailableGuestQuota();
  try {
    const [response] = await runKvPipeline(runtime, [['EVAL', ROLLBACK_SCRIPT, 1, keyFor(reservation.identity), reservation.ticket]]);
    return snapshotFromUsed(parseUsed(response.result));
  } catch {
    return getUnavailableGuestQuota();
  }
}
