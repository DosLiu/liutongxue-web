import { buildConfigErrorMessage, getAuthConfig, readSessionFromRequest, type AuthStatus } from '../_lib/auth';
import { applyCors, handleOptionsRequest, json, methodNotAllowed } from '../_lib/http';

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
          ? '已通过大恩登录回站，本地 session 已建立。下一步继续接 Vercel KV 做每日 10 次限制。'
          : '当前未登录，先从人物页选择 QQ 或百度登录。',
    missingEnv: config.missingLoginEnv,
    provider: 'daen',
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
