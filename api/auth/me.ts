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
    kv: {
      enabled: config.kv.enabled,
      configured: config.isKvConfigured,
      mode: config.kv.mode
    },
    loginReady: config.isLoginReady,
    loginUrl: '/api/auth/login',
    logoutUrl: '/api/auth/logout',
    message:
      status === 'disabled'
        ? buildConfigErrorMessage(config.missingLoginEnv)
        : status === 'authenticated'
          ? '已读取到本地 session 骨架。'
          : '当前未登录。',
    missingEnv: config.missingLoginEnv,
    provider: 'daen',
    status,
    user: session
      ? {
          displayName: session.displayName ?? '已登录用户',
          expiresAt: session.expiresAt,
          issuedAt: session.issuedAt,
          provider: session.provider,
          storage: session.storage,
          subject: session.subject
        }
      : null
  });
}
