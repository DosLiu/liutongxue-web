const env = globalThis.process?.env ?? {};

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

const normalizeEnvValue = (value) => value?.trim() ?? '';
const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const padNumber = (value) => String(value).padStart(2, '0');

const getShanghaiCalendarParts = (date = new Date()) => {
  const shanghaiDate = new Date(date.getTime() + SHANGHAI_OFFSET_MS);

  return {
    year: shanghaiDate.getUTCFullYear(),
    month: shanghaiDate.getUTCMonth() + 1,
    day: shanghaiDate.getUTCDate()
  };
};

const getQuotaDateKey = (date = new Date()) => {
  const { year, month, day } = getShanghaiCalendarParts(date);
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
};

const getNextResetAt = (date = new Date()) => {
  const { year, month, day } = getShanghaiCalendarParts(date);
  return new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0) - SHANGHAI_OFFSET_MS).toISOString();
};

const getSecondsUntilReset = (resetAt) => Math.max(60, Math.ceil((new Date(resetAt).getTime() - Date.now()) / 1000));

const parseUsageCount = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  return 0;
};

const buildQuotaReason = (mode) => {
  if (mode === 'degraded') {
    return '已登录，今日次数暂时无法确认，本次不会误扣。';
  }

  if (mode === 'disabled') {
    return '已登录，今日次数暂未接通校验，可先继续体验。';
  }

  return '已登录账号按今日次数生效。';
};

const buildUnavailableAccountQuota = (runtime) => ({
  scope: 'account',
  mode: 'unavailable',
  limit: runtime.dailyLimit,
  remaining: null,
  used: null,
  resetAt: null,
  exhausted: false,
  enforced: false,
  reason: buildQuotaReason(runtime.kv.mode)
});

const buildAccountQuotaSnapshotFromUsed = (runtime, used, resetAt) => {
  const normalizedUsed = Math.max(0, used);
  const remaining = Math.max(0, runtime.dailyLimit - normalizedUsed);

  return {
    scope: 'account',
    mode: 'daily',
    limit: runtime.dailyLimit,
    remaining,
    used: normalizedUsed,
    resetAt,
    exhausted: remaining <= 0,
    enforced: true,
    reason: remaining <= 0 ? '当前账号今日次数已用完。' : '已登录账号按今日次数生效。'
  };
};

const buildKvHeaders = (runtime) => ({
  Authorization: `Bearer ${runtime.kv.kvRestApiToken}`,
  'Content-Type': 'application/json'
});

const buildKvPipelineUrl = (runtime) => `${trimTrailingSlash(runtime.kv.kvRestApiUrl)}/pipeline`;

const runKvPipeline = async (runtime, commands) => {
  const response = await fetch(buildKvPipelineUrl(runtime), {
    method: 'POST',
    headers: buildKvHeaders(runtime),
    body: JSON.stringify(commands)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`kv_http_${response.status}${errorText ? `:${errorText.slice(0, 160)}` : ''}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('kv_invalid_payload');
  }

  payload.forEach((item) => {
    if (item?.error) {
      throw new Error(`kv_command_error:${item.error}`);
    }
  });

  return payload;
};

const buildQuotaKey = (subject, date = new Date()) => `liutongxue:figure-chat:quota:${getQuotaDateKey(date)}:${subject}`;

export const getQuotaRuntime = () => {
  const dailyLimit = toInt(normalizeEnvValue(env.AUTH_DAILY_LIMIT), 10);
  const enabled = normalizeEnvValue(env.AUTH_KV_ENABLED).toLowerCase() === 'true';
  const kvRestApiUrl = normalizeEnvValue(env.KV_REST_API_URL);
  const kvRestApiToken = normalizeEnvValue(env.KV_REST_API_TOKEN);
  const configured = Boolean(kvRestApiUrl && kvRestApiToken);
  const enforced = enabled && configured;

  return {
    dailyLimit,
    kv: {
      enabled,
      configured,
      enforced,
      kvRestApiToken,
      kvRestApiUrl,
      mode: enforced ? 'enforced' : enabled ? 'degraded' : 'disabled'
    }
  };
};

export const getAccountQuotaSnapshot = async (subject) => {
  const runtime = getQuotaRuntime();

  if (!subject || !runtime.kv.enforced) {
    return buildUnavailableAccountQuota(runtime);
  }

  const resetAt = getNextResetAt();
  const key = buildQuotaKey(subject);

  try {
    const [usageResult] = await runKvPipeline(runtime, [['GET', key]]);
    return buildAccountQuotaSnapshotFromUsed(runtime, parseUsageCount(usageResult?.result), resetAt);
  } catch {
    return buildUnavailableAccountQuota({
      ...runtime,
      kv: {
        ...runtime.kv,
        mode: 'degraded'
      }
    });
  }
};

export const reserveAccountQuotaSlot = async (subject) => {
  const runtime = getQuotaRuntime();

  if (!subject || !runtime.kv.enforced) {
    return {
      allowed: true,
      reserved: false,
      quota: buildUnavailableAccountQuota(runtime)
    };
  }

  const resetAt = getNextResetAt();
  const ttlSeconds = getSecondsUntilReset(resetAt);
  const key = buildQuotaKey(subject);

  try {
    const [usageResult] = await runKvPipeline(runtime, [
      ['INCR', key],
      ['EXPIRE', key, ttlSeconds]
    ]);
    const used = parseUsageCount(usageResult?.result);

    if (used > runtime.dailyLimit) {
      await runKvPipeline(runtime, [
        ['DECR', key],
        ['EXPIRE', key, ttlSeconds]
      ]).catch(() => undefined);

      return {
        allowed: false,
        reserved: false,
        quota: buildAccountQuotaSnapshotFromUsed(runtime, runtime.dailyLimit, resetAt)
      };
    }

    return {
      allowed: true,
      reserved: true,
      quota: buildAccountQuotaSnapshotFromUsed(runtime, used, resetAt)
    };
  } catch {
    return {
      allowed: true,
      reserved: false,
      quota: buildUnavailableAccountQuota({
        ...runtime,
        kv: {
          ...runtime.kv,
          mode: 'degraded'
        }
      })
    };
  }
};

export const rollbackAccountQuotaSlot = async (subject) => {
  const runtime = getQuotaRuntime();

  if (!subject || !runtime.kv.enforced) {
    return buildUnavailableAccountQuota(runtime);
  }

  const resetAt = getNextResetAt();
  const ttlSeconds = getSecondsUntilReset(resetAt);
  const key = buildQuotaKey(subject);

  try {
    const [usageResult] = await runKvPipeline(runtime, [
      ['DECR', key],
      ['EXPIRE', key, ttlSeconds]
    ]);
    return buildAccountQuotaSnapshotFromUsed(runtime, parseUsageCount(usageResult?.result), resetAt);
  } catch {
    return buildUnavailableAccountQuota({
      ...runtime,
      kv: {
        ...runtime.kv,
        mode: 'degraded'
      }
    });
  }
};
