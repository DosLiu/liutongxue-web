import { buildConfigErrorMessage, getAuthConfig, readSessionFromRequest, type AuthStatus } from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed } from '../_lib/http.js';
import { getAccountQuotaSnapshot } from '../_lib/quota.js';

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

type ApiResponse = {
  end: () => void;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ApiResponse;
};

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

  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  const config = getAuthConfig();
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
      url: `/api/auth/login?type=${encodeURIComponent(type)}`
    })),
    loginReady: config.isLoginReady,
    loginUrl: '/api/auth/login',
    logoutUrl: '/api/auth/logout',
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
