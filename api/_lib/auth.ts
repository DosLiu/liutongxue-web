import { buildSetCookie, getCookieHeader, isSecureRequest, parseCookies } from './http';

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

export type AuthStatus = 'disabled' | 'signed_out' | 'authenticated';

export type AuthSession = {
  displayName?: string;
  expiresAt: string;
  issuedAt: string;
  provider: 'daen';
  storage: 'cookie-placeholder';
  subject: string;
};

type SignedStatePayload = {
  expiresAt: string;
  issuedAt: string;
  returnTo?: string;
  state: string;
};

type EnvField = {
  key: string;
  value: string;
};

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
const textEncoder = new TextEncoder();
const bufferCtor = (globalThis as { Buffer?: { from: (value: string, encoding?: string) => { toString: (encoding?: string) => string } } }).Buffer;

const normalizeEnvValue = (value: string | undefined) => value?.trim() ?? '';
const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);
const now = () => new Date();
const toIsoString = (date: Date) => date.toISOString();

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

const joinUrl = (baseUrl: string, path: string) => `${trimTrailingSlash(baseUrl)}${ensureLeadingSlash(path)}`;

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

export const getAuthConfig = () => {
  const authBaseUrl = normalizeEnvValue(env.DAEN_AUTH_BASE_URL);
  const authorizePath = normalizeEnvValue(env.DAEN_AUTH_AUTHORIZE_PATH) || '/oauth/authorize';
  const tokenUrl = normalizeEnvValue(env.DAEN_AUTH_TOKEN_URL);
  const userInfoUrl = normalizeEnvValue(env.DAEN_AUTH_USERINFO_URL);
  const appId = normalizeEnvValue(env.DAEN_APP_ID);
  const appKey = normalizeEnvValue(env.DAEN_APP_KEY);
  const scope = normalizeEnvValue(env.DAEN_AUTH_SCOPE) || 'openid profile';
  const callbackUrl = normalizeEnvValue(env.DAEN_AUTH_CALLBACK_URL);
  const loginSuccessUrl = normalizeEnvValue(env.AUTH_LOGIN_SUCCESS_URL) || '/';
  const logoutRedirectUrl = normalizeEnvValue(env.AUTH_LOGOUT_REDIRECT_URL) || '/';
  const sessionCookieName = normalizeEnvValue(env.AUTH_SESSION_COOKIE_NAME) || 'liutongxue_session';
  const stateCookieName = normalizeEnvValue(env.AUTH_STATE_COOKIE_NAME) || 'liutongxue_auth_state';
  const sessionSecret = normalizeEnvValue(env.AUTH_SESSION_SECRET);
  const sessionTtlSeconds = toInt(normalizeEnvValue(env.AUTH_SESSION_TTL_SECONDS), 60 * 60 * 24 * 7);
  const kvEnabled = normalizeEnvValue(env.AUTH_KV_ENABLED).toLowerCase() === 'true';
  const kvRestApiUrl = normalizeEnvValue(env.KV_REST_API_URL);
  const kvRestApiToken = normalizeEnvValue(env.KV_REST_API_TOKEN);
  const kvUrl = normalizeEnvValue(env.KV_URL);

  const missingLoginEnv = collectMissingEnv([
    { key: 'DAEN_AUTH_BASE_URL', value: authBaseUrl },
    { key: 'DAEN_APP_ID', value: appId },
    { key: 'DAEN_AUTH_CALLBACK_URL', value: callbackUrl },
    { key: 'AUTH_SESSION_SECRET', value: sessionSecret }
  ]);

  const missingCallbackEnv = collectMissingEnv([
    { key: 'DAEN_APP_KEY', value: appKey },
    { key: 'DAEN_AUTH_TOKEN_URL', value: tokenUrl },
    { key: 'DAEN_AUTH_USERINFO_URL', value: userInfoUrl },
    { key: 'AUTH_SESSION_SECRET', value: sessionSecret }
  ]);

  return {
    appId,
    appKey,
    authBaseUrl,
    authorizePath,
    callbackUrl,
    isCallbackReady: missingCallbackEnv.length === 0,
    isKvConfigured: Boolean(kvRestApiUrl && kvRestApiToken),
    isLoginReady: missingLoginEnv.length === 0,
    kv: {
      enabled: kvEnabled,
      kvRestApiToken,
      kvRestApiUrl,
      kvUrl,
      mode: kvEnabled ? 'reserved' : 'disabled'
    },
    loginSuccessUrl,
    logoutRedirectUrl,
    missingCallbackEnv,
    missingLoginEnv,
    scope,
    sessionCookieName,
    sessionSecret,
    sessionTtlSeconds,
    stateCookieName,
    tokenUrl,
    userInfoUrl
  };
};

export const buildConfigErrorMessage = (missingEnv: string[]) =>
  missingEnv.length ? `缺少环境变量：${missingEnv.join(', ')}` : '认证配置未完成。';

export const buildDaenAuthorizeUrl = (returnTo?: string) => {
  const config = getAuthConfig();
  if (!config.isLoginReady) {
    throw new Error(buildConfigErrorMessage(config.missingLoginEnv));
  }

  const state = createNonce();
  const authorizeUrl = new URL(joinUrl(config.authBaseUrl, config.authorizePath));
  authorizeUrl.searchParams.set('client_id', config.appId);
  authorizeUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', config.scope);
  authorizeUrl.searchParams.set('state', state);

  return {
    authUrl: authorizeUrl.toString(),
    statePayload: {
      expiresAt: toIsoString(new Date(Date.now() + 10 * 60 * 1000)),
      issuedAt: toIsoString(now()),
      returnTo: sanitizeReturnTo(returnTo),
      state
    } satisfies SignedStatePayload
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

export const buildPostAuthRedirectUrl = async (req: ApiRequest, status: 'callback-ready' | 'auth-error') => {
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
  state: getQueryValue(req, 'state')
});
