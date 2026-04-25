import { request as httpsRequest } from 'node:https';
import { buildSetCookie, getCookieHeader, isSecureRequest, parseCookies } from './http.js';

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

export type AuthStatus = 'disabled' | 'signed_out' | 'authenticated';

export type AuthSession = {
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

type EnvField = {
  key: string;
  value: string;
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

const normalizeEnvValue = (value: string | undefined) => value?.trim() ?? '';
const toIsoString = (date: Date) => date.toISOString();
const now = () => new Date();

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

const collectMissingEnv = (fields: EnvField[]) => fields.filter((field) => !field.value).map((field) => field.key);

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
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
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

export const getAuthConfig = () => {
  const connectUrl = normalizeEnvValue(env.DAEN_CONNECT_URL) || 'https://u.daenwl.com/connect.php';
  const appId = normalizeEnvValue(env.DAEN_APP_ID);
  const appKey = normalizeEnvValue(env.DAEN_APP_KEY);
  const callbackUrl = normalizeEnvValue(env.DAEN_AUTH_CALLBACK_URL);
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

  const missingLoginEnv = collectMissingEnv([
    { key: 'DAEN_CONNECT_URL', value: connectUrl },
    { key: 'DAEN_APP_ID', value: appId },
    { key: 'DAEN_APP_KEY', value: appKey },
    { key: 'DAEN_AUTH_CALLBACK_URL', value: callbackUrl },
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

export const buildConfigErrorMessage = (missingEnv: string[]) =>
  missingEnv.length ? `缺少环境变量：${missingEnv.join(', ')}` : '认证配置未完成。';

export const resolveLoginType = (req: ApiRequest) => {
  const rawType = getQueryValue(req, 'type')?.trim().toLowerCase();
  const config = getAuthConfig();

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

export const buildDaenLoginRequest = (loginType: string, returnTo?: string) => {
  const config = getAuthConfig();
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

export const requestDaenLoginUrl = async (loginType: string, returnTo?: string) => {
  const { loginRequestUrl, statePayload } = buildDaenLoginRequest(loginType, returnTo);
  const payload = await requestJson<DaenLoginResult>(loginRequestUrl);
  if (payload.code !== 0 || !payload.url) {
    throw new Error(payload.msg || 'daen_login_failed');
  }

  return {
    payload,
    statePayload
  };
};

export const exchangeDaenCallback = async (loginType: string, code: string) => {
  const config = getAuthConfig();
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

export const buildSessionFromDaenProfile = (profile: DaenCallbackResult): AuthSession => {
  const config = getAuthConfig();
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

export const buildStateCookie = async (payload: SignedStatePayload, req: ApiRequest) => {
  const config = getAuthConfig();
  const value = await serializeSignedPayload(payload, config.sessionSecret);

  return buildSetCookie(config.stateCookieName, value, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

export const buildClearedStateCookie = (req: ApiRequest) => {
  const config = getAuthConfig();
  return buildSetCookie(config.stateCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

export const buildSessionCookie = async (session: AuthSession, req: ApiRequest) => {
  const config = getAuthConfig();
  const value = await serializeSignedPayload(session, config.sessionSecret);

  return buildSetCookie(config.sessionCookieName, value, {
    httpOnly: true,
    maxAge: config.sessionTtlSeconds,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

export const buildClearedSessionCookie = (req: ApiRequest) => {
  const config = getAuthConfig();
  return buildSetCookie(config.sessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(req)
  });
};

export const readStateFromRequest = async (req: ApiRequest) => {
  const config = getAuthConfig();
  if (!config.sessionSecret) {
    return null;
  }

  const cookieHeader = getCookieHeader(req);
  const cookies = parseCookies(cookieHeader);
  return parseSignedPayload<SignedStatePayload>(cookies[config.stateCookieName], config.sessionSecret);
};

export const readSessionFromRequest = async (req: ApiRequest) => {
  const config = getAuthConfig();
  if (!config.sessionSecret) {
    return null;
  }

  const cookieHeader = getCookieHeader(req);
  const cookies = parseCookies(cookieHeader);
  return parseSignedPayload<AuthSession>(cookies[config.sessionCookieName], config.sessionSecret);
};

export const buildPostAuthRedirectUrl = async (req: ApiRequest, status: 'signed-in' | 'auth-error') => {
  const config = getAuthConfig();
  const state = await readStateFromRequest(req);
  const redirectUrl = new URL(state?.returnTo || config.loginSuccessUrl, 'https://liutongxue.local');
  redirectUrl.searchParams.set('auth', status);
  return `${redirectUrl.pathname}${redirectUrl.search}`;
};

export const buildLogoutRedirectUrl = () => {
  const config = getAuthConfig();
  const redirectUrl = new URL(config.logoutRedirectUrl, 'https://liutongxue.local');
  redirectUrl.searchParams.set('auth', 'signed-out');
  return `${redirectUrl.pathname}${redirectUrl.search}`;
};

export const getCallbackQuery = (req: ApiRequest) => ({
  code: getQueryValue(req, 'code'),
  error: getQueryValue(req, 'error'),
  errorDescription: getQueryValue(req, 'error_description'),
  loginType: getQueryValue(req, 'type')?.trim().toLowerCase() ?? '',
  nonce: getQueryValue(req, 'lc_state') ?? getQueryValue(req, 'state') ?? '',
  returnTo: sanitizeReturnTo(getQueryValue(req, 'return_to'))
});
