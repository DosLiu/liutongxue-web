import { request as httpsRequest } from 'node:https';
import { getAccountQuotaSnapshot } from './_lib/quota.js';

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type ApiResponse = {
  end: () => void;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ApiResponse;
};

type AuthStatus = 'disabled' | 'signed_out' | 'authenticated';

type AuthSession = {
  avatarUrl?: string;
  displayName?: string;
  expiresAt: string;
  issuedAt: string;
  loginType: string;
  provider: 'daen';
  socialUid: string;
  storage: 'cookie';
  subject: string;
};

type SignedStatePayload = {
  expiresAt: string;
  issuedAt: string;
  loginType: string;
  nonce: string;
  returnTo?: string;
};

type DaenLoginResult = {
  code: number;
  msg: string;
  qrcode?: string;
  type?: string;
  url?: string;
};

type DaenCallbackResult = {
  access_token?: string;
  code: number;
  faceimg?: string;
  gender?: string;
  ip?: string;
  location?: string;
  msg: string;
  nickname?: string;
  social_uid?: string;
  type?: string;
};

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
const textEncoder = new TextEncoder();
const bufferCtor = (globalThis as {
  Buffer?: { from: (value: string, encoding?: string) => { toString: (encoding?: string) => string } };
}).Buffer;

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.liutongxue.com.cn',
  'https://liutongxue.com.cn',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const normalizeHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : typeof value === 'string' ? value : undefined;

const normalizeEnvValue = (value: string | undefined) => value?.trim() ?? '';
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const toIsoString = (date: Date) => date.toISOString();
const now = () => new Date();

const parseAllowedOrigins = () => {
  const configured = env.ALLOWED_ORIGINS?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
};

const isAllowedOrigin = (origin: string | undefined, allowedOrigins: Set<string>) => {
  if (!origin) {
    return false;
  }

  return allowedOrigins.has(trimTrailingSlash(origin));
};

const applyCors = (req: ApiRequest, res: ApiResponse, methods = 'GET, POST, OPTIONS') => {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = normalizeHeaderValue(req.headers?.origin);
  const normalizedOrigin = requestOrigin ? trimTrailingSlash(requestOrigin) : undefined;
  const allowOrigin = isAllowedOrigin(normalizedOrigin, allowedOrigins)
    ? normalizedOrigin ?? DEFAULT_ALLOWED_ORIGINS[0]
    : DEFAULT_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

const noStore = (res: ApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
};

const json = (res: ApiResponse, statusCode: number, payload: unknown) => {
  noStore(res);
  res.status(statusCode).json(payload);
};

const redirect = (res: ApiResponse, statusCode: number, location: string, cookies?: string[]) => {
  noStore(res);
  if (cookies?.length) {
    res.setHeader('Set-Cookie', cookies);
  }
  res.setHeader('Location', location);
  res.status(statusCode).end();
};

const methodNotAllowed = (res: ApiResponse) => {
  json(res, 405, { error: 'Method not allowed.' });
};

const handleOptionsRequest = (res: ApiResponse) => {
  res.status(204).end();
};

const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex <= 0) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = value;
      return cookies;
    }, {});
};

const buildSetCookie = (
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'Lax' | 'Strict' | 'None';
    secure?: boolean;
  } = {}
) => {
  const parts = [`${name}=${value}`];

  parts.push(`Path=${options.path ?? '/'}`);

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

const getCookieHeader = (req: ApiRequest) => normalizeHeaderValue(req.headers?.cookie);
const getRequestOrigin = (req: ApiRequest) => normalizeHeaderValue(req.headers?.origin);

const isSecureRequest = (req: ApiRequest) => {
  const forwardedProto = normalizeHeaderValue(req.headers?.['x-forwarded-proto'])?.toLowerCase();
  const origin = getRequestOrigin(req)?.toLowerCase();
  return forwardedProto === 'https' || origin?.startsWith('https://') || env.NODE_ENV === 'production';
};

const encodeBase64Url = (value: string) => {
  const base64 = bufferCtor
    ? bufferCtor.from(value, 'utf8').toString('base64')
    : btoa(unescape(encodeURIComponent(value)));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return bufferCtor ? bufferCtor.from(base64, 'base64').toString('utf8') : decodeURIComponent(escape(atob(base64)));
};

const toInt = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createNonce = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const getQueryValue = (req: ApiRequest, key: string) => {
  const directValue = req.query?.[key];

  if (typeof directValue === 'string') {
    return directValue;
  }

  if (Array.isArray(directValue) && typeof directValue[0] === 'string') {
    return directValue[0];
  }

  if (typeof req.url === 'string') {
    try {
      return new URL(req.url, 'http://localhost').searchParams.get(key) ?? undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const collectMissingEnv = (fields: Array<{ key: string; value: string }>) =>
  fields.filter((field) => !field.value).map((field) => field.key);

const signValue = async (value: string, secret: string) => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(value));
  const signatureText = Array.from(new Uint8Array(signature), (byte) => String.fromCharCode(byte)).join('');

  return encodeBase64Url(signatureText);
};

const verifySignedValue = async (value: string, signature: string, secret: string) => {
  const expected = await signValue(value, secret);
  return expected === signature;
};

const serializeSignedPayload = async <T extends object>(payload: T, secret: string) => {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

const parseSignedPayload = async <T extends { expiresAt: string }>(rawValue: string | undefined, secret: string) => {
  if (!rawValue) {
    return null;
  }

  const [encodedPayload, signature] = rawValue.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const isValid = await verifySignedValue(encodedPayload, signature, secret);
  if (!isValid) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as T;
    if (!payload?.expiresAt) {
      return null;
    }

    if (new Date(payload.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const sanitizeReturnTo = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return undefined;
  }

  return trimmed;
};

const parseEnabledTypes = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const parseJsonText = <T>(text: string) => {
  if (!text) {
    throw new Error('empty_response');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('invalid_json_response');
  }
};

const requestJson = <T>(url: string) =>
  new Promise<T>((resolve, reject) => {
    const target = new URL(url);
    const req = httpsRequest(
      target,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'liutongxue-web/1.0'
        },
        method: 'GET'
      },
      (res) => {
        const chunks: Uint8Array[] = [];

        res.on('data', (chunk: Uint8Array) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const text = Buffer.concat(chunks as Buffer[]).toString('utf8');
          if ((res.statusCode ?? 500) < 200 || (res.statusCode ?? 500) >= 300) {
            reject(new Error(`upstream_http_${res.statusCode ?? 500}:${text.slice(0, 200)}`));
            return;
          }

          try {
            resolve(parseJsonText<T>(text));
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy(new Error('upstream_timeout'));
    });

    req.end();
  });

const getCurrentOrigin = (req: ApiRequest) => {
  const forwardedProto = normalizeHeaderValue(req.headers?.['x-forwarded-proto']) || 'https';
  const forwardedHost = normalizeHeaderValue(req.headers?.['x-forwarded-host']) || normalizeHeaderValue(req.headers?.host);
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return 'https://www.liutongxue.com.cn';
};

const getAuthConfig = (req?: ApiRequest) => {
  const connectUrl = normalizeEnvValue(env.DAEN_CONNECT_URL) || 'https://u.daenwl.com/connect.php';
  const appId = normalizeEnvValue(env.DAEN_APP_ID);
  const appKey = normalizeEnvValue(env.DAEN_APP_KEY);
  const configuredCallbackUrl = normalizeEnvValue(env.DAEN_AUTH_CALLBACK_URL);
  const enabledTypes = parseEnabledTypes(normalizeEnvValue(env.DAEN_ENABLED_TYPES) || 'qq,baidu');
  const loginSuccessUrl = normalizeEnvValue(env.AUTH_LOGIN_SUCCESS_URL) || '/figures/';
  const logoutRedirectUrl = normalizeEnvValue(env.AUTH_LOGOUT_REDIRECT_URL) || '/figures/';
  const sessionCookieName = normalizeEnvValue(env.AUTH_SESSION_COOKIE_NAME) || 'liutongxue_session';
  const stateCookieName = normalizeEnvValue(env.AUTH_STATE_COOKIE_NAME) || 'liutongxue_auth_state';
  const sessionSecret = normalizeEnvValue(env.AUTH_SESSION_SECRET);
  const sessionTtlSeconds = toInt(normalizeEnvValue(env.AUTH_SESSION_TTL_SECONDS), 60 * 60 * 24 * 7);
  const dailyLimit = toInt(normalizeEnvValue(env.AUTH_DAILY_LIMIT), 10);
  const kvEnabled = normalizeEnvValue(env.AUTH_KV_ENABLED).toLowerCase() === 'true';
  const kvRestApiUrl = normalizeEnvValue(env.KV_REST_API_URL);
  const kvRestApiToken = normalizeEnvValue(env.KV_REST_API_TOKEN);
  const kvUrl = normalizeEnvValue(env.KV_URL);
  const isKvConfigured = Boolean(kvRestApiUrl && kvRestApiToken);
  const kvMode = kvEnabled ? (isKvConfigured ? 'enforced' : 'degraded') : 'disabled';

  const callbackOrigin = configuredCallbackUrl
    ? new URL(configuredCallbackUrl).origin
    : getCurrentOrigin(req ?? { headers: {} });
  const callbackUrl = `${callbackOrigin}/api/daen?route=callback`;

  const missingLoginEnv = collectMissingEnv([
    { key: 'DAEN_CONNECT_URL', value: connectUrl },
    { key: 'DAEN_APP_ID', value: appId },
    { key: 'DAEN_APP_KEY', value: appKey },
    { key: 'AUTH_SESSION_SECRET', value: sessionSecret }
  ]);

  return {
    appId,
    appKey,
    callbackUrl,
    connectUrl,
    dailyLimit,
    enabledTypes,
    isCallbackReady: missingLoginEnv.length === 0,
    isKvConfigured,
    isLoginReady: missingLoginEnv.length === 0,
    kv: {
      enabled: kvEnabled,
      kvRestApiToken,
      kvRestApiUrl,
      kvUrl,
      mode: kvMode
    },
    loginSuccessUrl,
    logoutRedirectUrl,
    missingLoginEnv,
    sessionCookieName,
    sessionSecret,
    sessionTtlSeconds,
    stateCookieName
  };
};

const buildConfigErrorMessage = (missingEnv: string[]) =>
  missingEnv.length ? `缺少环境变量：${missingEnv.join(', ')}` : '认证配置未完成。';

const resolveLoginType = (req: ApiRequest) => {
  const rawType = getQueryValue(req, 'type')?.trim().toLowerCase();
  const config = getAuthConfig(req);

  if (!rawType) {
    return {
      allowedTypes: config.enabledTypes,
      isSupported: false,
      loginType: '',
      reason: '缺少登录方式 type 参数。'
    };
  }

  if (!config.enabledTypes.includes(rawType)) {
    return {
      allowedTypes: config.enabledTypes,
      isSupported: false,
      loginType: rawType,
      reason: `当前只开放：${config.enabledTypes.join('、')}`
    };
  }

  return {
    allowedTypes: config.enabledTypes,
    isSupported: true,
    loginType: rawType,
    reason: ''
  };
};

const buildDaenLoginRequest = (req: ApiRequest, loginType: string, returnTo?: string) => {
  const config = getAuthConfig(req);
  if (!config.isLoginReady) {
    throw new Error(buildConfigErrorMessage(config.missingLoginEnv));
  }

  const nonce = createNonce();
  const redirectUrl = new URL(config.callbackUrl);
  redirectUrl.searchParams.set('lc_state', nonce);

  const safeReturnTo = sanitizeReturnTo(returnTo);
  if (safeReturnTo) {
    redirectUrl.searchParams.set('return_to', safeReturnTo);
  }

  const requestUrl = new URL(config.connectUrl);
  requestUrl.searchParams.set('act', 'login');
  requestUrl.searchParams.set('appid', config.appId);
  requestUrl.searchParams.set('appkey', config.appKey);
  requestUrl.searchParams.set('type', loginType);
  requestUrl.searchParams.set('redirect_uri', redirectUrl.toString());

  return {
    loginRequestUrl: requestUrl.toString(),
    statePayload: {
      expiresAt: toIsoString(new Date(Date.now() + 10 * 60 * 1000)),
      issuedAt: toIsoString(now()),
      loginType,
      nonce,
      returnTo: safeReturnTo
    } satisfies SignedStatePayload
  };
};

const requestDaenLoginUrl = async (req: ApiRequest, loginType: string, returnTo?: string) => {
  const { loginRequestUrl, statePayload } = buildDaenLoginRequest(req, loginType, returnTo);
  const payload = await requestJson<DaenLoginResult>(loginRequestUrl);
  if (payload.code !== 0 || !payload.url) {
    throw new Error(payload.msg || 'daen_login_failed');
  }
  return { payload, statePayload };
};

const exchangeDaenCallback = async (req: ApiRequest, loginType: string, code: string) => {
  const config = getAuthConfig(req);
  if (!config.isCallbackReady) {
    throw new Error(buildConfigErrorMessage(config.missingLoginEnv));
  }

  const requestUrl = new URL(config.connectUrl);
  requestUrl.searchParams.set('act', 'callback');
  requestUrl.searchParams.set('appid', config.appId);
  requestUrl.searchParams.set('appkey', config.appKey);
  requestUrl.searchParams.set('type', loginType);
  requestUrl.searchParams.set('code', code);

  const payload = await requestJson<DaenCallbackResult>(requestUrl.toString());
  if (payload.code !== 0 || !payload.social_uid) {
    throw new Error(payload.msg || 'daen_callback_failed');
  }
  return payload;
};

const buildSessionFromDaenProfile = (req: ApiRequest, profile: DaenCallbackResult): AuthSession => {
  const config = getAuthConfig(req);
  const issuedAt = now();
  const expiresAt = new Date(issuedAt.getTime() + config.sessionTtlSeconds * 1000);
  const loginType = profile.type?.trim().toLowerCase() || 'unknown';
  const socialUid = profile.social_uid?.trim() || '';

  return {
    avatarUrl: profile.faceimg,
    displayName: profile.nickname || socialUid || '已登录用户',
    expiresAt: toIsoString(expiresAt),
    issuedAt: toIsoString(issuedAt),
    loginType,
    provider: 'daen',
    socialUid,
    storage: 'cookie',
    subject: `${loginType}:${socialUid}`
  };
};

const buildStateCookie = async (req: ApiRequest, payload: SignedStatePayload) => {
  const config = getAuthConfig(req);
  const value = await serializeSignedPayload(payload, config.sessionSecret);
  return buildSetCookie(config.stateCookieName, value, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

const buildClearedStateCookie = (req: ApiRequest) => {
  const config = getAuthConfig(req);
  return buildSetCookie(config.stateCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

const buildSessionCookie = async (req: ApiRequest, session: AuthSession) => {
  const config = getAuthConfig(req);
  const value = await serializeSignedPayload(session, config.sessionSecret);
  return buildSetCookie(config.sessionCookieName, value, {
    httpOnly: true,
    maxAge: config.sessionTtlSeconds,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

const buildClearedSessionCookie = (req: ApiRequest) => {
  const config = getAuthConfig(req);
  return buildSetCookie(config.sessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

const readStateFromRequest = async (req: ApiRequest) => {
  const config = getAuthConfig(req);
  if (!config.sessionSecret) {
    return null;
  }

  const cookieHeader = getCookieHeader(req);
  const cookies = parseCookies(cookieHeader);
  return parseSignedPayload<SignedStatePayload>(cookies[config.stateCookieName], config.sessionSecret);
};

const readSessionFromRequest = async (req: ApiRequest) => {
  const config = getAuthConfig(req);
  if (!config.sessionSecret) {
    return null;
  }

  const cookieHeader = getCookieHeader(req);
  const cookies = parseCookies(cookieHeader);
  return parseSignedPayload<AuthSession>(cookies[config.sessionCookieName], config.sessionSecret);
};

const buildPostAuthRedirectUrl = async (req: ApiRequest, status: 'signed-in' | 'auth-error') => {
  const config = getAuthConfig(req);
  const state = await readStateFromRequest(req);
  const redirectUrl = new URL(state?.returnTo || config.loginSuccessUrl, 'https://liutongxue.local');
  redirectUrl.searchParams.set('auth', status);
  return `${redirectUrl.pathname}${redirectUrl.search}`;
};

const buildLogoutRedirectUrl = (req: ApiRequest) => {
  const config = getAuthConfig(req);
  const redirectUrl = new URL(config.logoutRedirectUrl, 'https://liutongxue.local');
  redirectUrl.searchParams.set('auth', 'signed-out');
  return `${redirectUrl.pathname}${redirectUrl.search}`;
};

const getCallbackQuery = (req: ApiRequest) => ({
  code: getQueryValue(req, 'code'),
  error: getQueryValue(req, 'error'),
  loginType: getQueryValue(req, 'type')?.trim().toLowerCase() ?? '',
  nonce: getQueryValue(req, 'lc_state') ?? getQueryValue(req, 'state') ?? ''
});

const getReturnTo = (req: ApiRequest) => sanitizeReturnTo(getQueryValue(req, 'return_to'));

const getRoute = (req: ApiRequest) => (getQueryValue(req, 'route') || 'me').trim().toLowerCase();

const getStatus = (isLoginReady: boolean, hasSession: boolean): AuthStatus => {
  if (!isLoginReady) {
    return 'disabled';
  }
  return hasSession ? 'authenticated' : 'signed_out';
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    handleOptionsRequest(res);
    return;
  }

  const route = getRoute(req);

  if (route === 'login') {
    if (req.method !== 'GET') {
      methodNotAllowed(res);
      return;
    }

    const config = getAuthConfig(req);
    if (!config.isLoginReady) {
      json(res, 503, {
        error: 'auth_config_missing',
        message: buildConfigErrorMessage(config.missingLoginEnv),
        missingEnv: config.missingLoginEnv,
        provider: 'daen'
      });
      return;
    }

    const loginTypeResult = resolveLoginType(req);
    if (!loginTypeResult.isSupported) {
      json(res, 400, {
        allowedTypes: loginTypeResult.allowedTypes,
        error: 'unsupported_login_type',
        message: loginTypeResult.reason,
        provider: 'daen'
      });
      return;
    }

    try {
      const { payload, statePayload } = await requestDaenLoginUrl(req, loginTypeResult.loginType, getReturnTo(req));
      const stateCookie = await buildStateCookie(req, statePayload);
      redirect(res, 302, payload.url!, [stateCookie]);
    } catch (error) {
      json(res, 502, {
        error: 'daen_login_failed',
        loginType: loginTypeResult.loginType,
        message: error instanceof Error ? error.message : '大恩登录地址获取失败。',
        provider: 'daen'
      });
    }
    return;
  }

  if (route === 'callback') {
    if (req.method !== 'GET') {
      methodNotAllowed(res);
      return;
    }

    const config = getAuthConfig(req);
    const callbackQuery = getCallbackQuery(req);
    const clearedStateCookie = buildClearedStateCookie(req);
    const redirectUrl = await buildPostAuthRedirectUrl(req, callbackQuery.error ? 'auth-error' : 'signed-in');

    if (!config.isCallbackReady) {
      json(res, 503, {
        error: 'auth_config_missing',
        message: buildConfigErrorMessage(config.missingLoginEnv),
        missingEnv: config.missingLoginEnv,
        provider: 'daen'
      });
      return;
    }

    if (callbackQuery.error) {
      redirect(res, 302, `${redirectUrl}&provider_error=${encodeURIComponent(callbackQuery.error)}`, [clearedStateCookie]);
      return;
    }

    if (!callbackQuery.code || !callbackQuery.loginType || !callbackQuery.nonce) {
      json(res, 400, {
        error: 'invalid_callback',
        message: '缺少 code、type 或 lc_state，回调参数不完整。'
      });
      return;
    }

    const statePayload = await readStateFromRequest(req);
    if (!statePayload || statePayload.nonce !== callbackQuery.nonce || statePayload.loginType !== callbackQuery.loginType) {
      json(res, 400, {
        error: 'state_mismatch',
        message: '登录回调校验失败，已拒绝此次回调。'
      });
      return;
    }

    try {
      const profile = await exchangeDaenCallback(req, callbackQuery.loginType, callbackQuery.code);
      const session = buildSessionFromDaenProfile(req, profile);
      const sessionCookie = await buildSessionCookie(req, session);
      redirect(res, 302, redirectUrl, [clearedStateCookie, sessionCookie]);
    } catch (error) {
      redirect(
        res,
        302,
        `${redirectUrl}&provider_error=${encodeURIComponent(error instanceof Error ? error.message : 'callback_failed')}`,
        [clearedStateCookie]
      );
    }
    return;
  }

  if (route === 'logout') {
    if (req.method !== 'GET' && req.method !== 'POST') {
      methodNotAllowed(res);
      return;
    }

    const clearedCookie = buildClearedSessionCookie(req);
    if (req.method === 'GET') {
      redirect(res, 302, buildLogoutRedirectUrl(req), [clearedCookie]);
      return;
    }

    json(res, 200, {
      ok: true,
      redirectTo: buildLogoutRedirectUrl(req),
      logoutUrl: '/api/daen?route=logout'
    });
    res.setHeader('Set-Cookie', clearedCookie);
    return;
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  const config = getAuthConfig(req);
  const session = await readSessionFromRequest(req);
  const status = getStatus(config.isLoginReady, Boolean(session));
  const quota = session?.subject ? await getAccountQuotaSnapshot(session.subject) : null;

  json(res, 200, {
    authenticated: Boolean(session),
    dailyLimit: config.dailyLimit,
    kv: {
      enabled: config.kv.enabled,
      configured: config.isKvConfigured,
      mode: config.kv.mode
    },
    loginProviders: config.enabledTypes.map((type) => ({
      label: type === 'qq' ? 'QQ 登录' : type === 'baidu' ? '百度登录' : `${type} 登录`,
      type,
      url: `/api/daen?route=login&type=${encodeURIComponent(type)}`
    })),
    loginReady: config.isLoginReady,
    loginUrl: '/api/daen?route=login',
    logoutUrl: '/api/daen?route=logout',
    message:
      status === 'disabled'
        ? buildConfigErrorMessage(config.missingLoginEnv)
        : status === 'authenticated'
          ? quota?.reason || '已登录，可继续对话。'
          : '当前未登录，可先体验 5 次；登录后每日可聊 10 次。',
    missingEnv: config.missingLoginEnv,
    provider: 'daen',
    quota,
    status,
    user: session
      ? {
          avatarUrl: session.avatarUrl,
          displayName: session.displayName ?? '已登录用户',
          expiresAt: session.expiresAt,
          issuedAt: session.issuedAt,
          loginType: session.loginType,
          provider: session.provider,
          storage: session.storage,
          subject: session.subject
        }
      : null
  });
}
