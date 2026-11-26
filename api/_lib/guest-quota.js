import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { getAuthConfig } from './auth.js';
import { buildSetCookie, getCookieHeader, isSecureRequest, parseCookies } from './http.js';
import { getNextResetAt, getQuotaDateKey, getQuotaRuntime, getSecondsUntilReset, runKvPipeline } from './quota.js';

const COOKIE_NAME = 'liutongxue_guest';
const IDENTITY_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;
const GUEST_LIMIT = 5;
// Covers the model timeout and the quota writes around it.
const RESERVATION_LIFETIME_MS = 40000;
const env = globalThis.process?.env ?? {};

// The daily hash keeps confirmed usage separate from in-flight reservations.
const RESERVE_SCRIPT = `-- guest-reserve-v2
local key = KEYS[1]
local limit, ticket, ttl, now, deadline = tonumber(ARGV[1]), ARGV[2], tonumber(ARGV[3]), tonumber(ARGV[4]), tonumber(ARGV[5])
local used = tonumber(redis.call('HGET', key, 'used') or '0')
if used >= limit then return {0, used} end

local pending = 0
local entries = redis.call('HGETALL', key)
for index = 1, #entries, 2 do
  local field = entries[index]
  if string.sub(field, 1, 8) == 'pending:' then
    if tonumber(entries[index + 1]) > now then
      pending = pending + 1
    else
      redis.call('HDEL', key, field)
    end
  end
end
if used + pending >= limit then return {2, used} end

redis.call('HSET', key, 'pending:' .. ticket, deadline)
redis.call('EXPIRE', key, ttl)
return {1, used}`;

const SETTLE_SCRIPT = `-- guest-settle-v2
local key = KEYS[1]
local ticket, action, now, limit = ARGV[1], ARGV[2], tonumber(ARGV[3]), tonumber(ARGV[4])
local pendingField = 'pending:' .. ticket
local used = tonumber(redis.call('HGET', key, 'used') or '0')
local confirmed = redis.call('HGET', key, ticket) == '1'
if action == 'rollback' then
  redis.call('HDEL', key, pendingField)
  if confirmed then
    redis.call('HDEL', key, ticket)
    used = math.max(0, used - 1)
    redis.call('HSET', key, 'used', used)
  end
  return used
end

if confirmed then return used end
local deadline = tonumber(redis.call('HGET', key, pendingField) or '0')
if deadline <= now or used >= limit then return nil end
redis.call('HSET', key, 'used', used + 1, ticket, '1')
redis.call('HDEL', key, pendingField)
return used + 1`;

const keyFor = (identity, date) => `liutongxue:figure-chat:guest:${getQuotaDateKey(date)}:${identity.id}`;
const signatureFor = (id, expiresAt, secret) => createHmac('sha256', secret).update(`guest:${id}:${expiresAt}`).digest('hex');
const getSecret = () => env.AUTH_SESSION_SECRET?.trim() || '';
const parseUsed = (value) => {
  if (value === null) return 0;
  const number = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid guest usage');
  return number;
};

export const getUnavailableGuestQuota = () => ({
  scope: 'device', mode: 'unavailable', limit: GUEST_LIMIT, remaining: null, resetAt: null,
  exhausted: false, enforced: false, reason: '游客体验次数暂时无法校验，请稍后重试。'
});

const snapshotFromUsed = (used, resetAt) => ({
  scope: 'device', mode: 'daily', limit: GUEST_LIMIT, resetAt,
  remaining: Math.max(0, GUEST_LIMIT - used), exhausted: used >= GUEST_LIMIT, enforced: true,
  reason: used >= GUEST_LIMIT
    ? `游客今日的 ${GUEST_LIMIT} 次体验已用完，北京时间 0 点恢复。${getAuthConfig().isLoginReady ? '请登录后继续对话。' : ''}`
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
  const date = new Date();
  if (!identity || identity.expiresAt <= date.getTime()) return getUnavailableGuestQuota();
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return getUnavailableGuestQuota();
  try {
    const [result] = await runKvPipeline(runtime, [['HGET', keyFor(identity, date), 'used']]);
    return snapshotFromUsed(parseUsed(result.result), getNextResetAt(date));
  } catch {
    return getUnavailableGuestQuota();
  }
}

export async function reserveGuestQuotaSlot(identity) {
  const unavailable = () => ({ allowed: false, quota: getUnavailableGuestQuota() });
  const date = new Date();
  if (!identity || identity.expiresAt <= date.getTime()) return unavailable();
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return unavailable();
  const reservation = { identity, ticket: randomUUID(), key: keyFor(identity, date), resetAt: getNextResetAt(date) };
  const { key, ticket, resetAt } = reservation;
  const ttl = getSecondsUntilReset(resetAt);
  const now = date.getTime();
  try {
    const [response] = await runKvPipeline(runtime, [['EVAL', RESERVE_SCRIPT, 1, key, GUEST_LIMIT, ticket, ttl, now, now + RESERVATION_LIFETIME_MS]]);
    if (!Array.isArray(response.result) || response.result.length !== 2 || ![0, 1, 2].includes(response.result[0])) throw new Error('Invalid reservation');
    const [state, used] = response.result;
    const count = parseUsed(used);
    if (used === null || (state === 0 ? count < GUEST_LIMIT : count >= GUEST_LIMIT)) throw new Error('Invalid reservation count');
    if (state === 2) return unavailable();
    const quota = snapshotFromUsed(count, resetAt);
    return { allowed: state === 1, quota, reservation: state === 1 ? reservation : undefined };
  } catch {
    // A lost response can leave a temporary hold. If the cancellation also fails,
    // it will expire automatically and never appear as confirmed usage.
    await settleGuestQuotaSlot(reservation, 'rollback');
    return unavailable();
  }
}

async function settleGuestQuotaSlot(reservation, action) {
  const runtime = getQuotaRuntime();
  if (!runtime.kv.enforced) return getUnavailableGuestQuota();
  const { key, resetAt, ticket } = reservation;
  const attempts = action === 'commit' ? 2 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const [response] = await runKvPipeline(runtime, [['EVAL', SETTLE_SCRIPT, 1, key, ticket, action, Date.now(), GUEST_LIMIT]]);
      if (response.result === null) return getUnavailableGuestQuota();
      return snapshotFromUsed(parseUsed(response.result), resetAt);
    } catch {
      // Repeating the same ticket is safe if a commit succeeded before the response was lost.
    }
  }
  return getUnavailableGuestQuota();
}

export const commitGuestQuotaSlot = (reservation) => settleGuestQuotaSlot(reservation, 'commit');

export async function rollbackGuestQuotaSlot(reservation) {
  const quota = await settleGuestQuotaSlot(reservation, 'rollback');
  return Date.parse(reservation.resetAt) <= Date.now() ? getGuestQuotaSnapshot(reservation.identity) : quota;
}
