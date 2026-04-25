import {
  buildClearedStateCookie,
  buildConfigErrorMessage,
  buildPostAuthRedirectUrl,
  buildSessionCookie,
  buildSessionFromDaenProfile,
  exchangeDaenCallback,
  getAuthConfig,
  getCallbackQuery,
  readStateFromRequest
} from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http.js';

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
    const profile = await exchangeDaenCallback(callbackQuery.loginType, callbackQuery.code);
    const session = buildSessionFromDaenProfile(profile);
    const sessionCookie = await buildSessionCookie(session, req);
    redirect(res, 302, redirectUrl, [clearedStateCookie, sessionCookie]);
  } catch (error) {
    redirect(
      res,
      302,
      `${redirectUrl}&provider_error=${encodeURIComponent(error instanceof Error ? error.message : 'callback_failed')}`,
      [clearedStateCookie]
    );
  }
}
