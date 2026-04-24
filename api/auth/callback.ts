import {
  buildClearedStateCookie,
  buildConfigErrorMessage,
  buildPostAuthRedirectUrl,
  getAuthConfig,
  getCallbackQuery,
  readStateFromRequest
} from '../_lib/auth';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http';

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
  const redirectUrl = await buildPostAuthRedirectUrl(req, callbackQuery.error ? 'auth-error' : 'callback-ready');

  if (!config.isLoginReady) {
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

  if (!callbackQuery.code || !callbackQuery.state) {
    json(res, 400, {
      error: 'invalid_callback',
      message: '缺少 code 或 state，回调参数不完整。'
    });
    return;
  }

  const statePayload = await readStateFromRequest(req);
  if (!statePayload || statePayload.state !== callbackQuery.state) {
    json(res, 400, {
      error: 'state_mismatch',
      message: 'state 校验失败，已拒绝此次回调。'
    });
    return;
  }

  // 第二步在这里补 token exchange + userinfo + KV/session 落库。
  // 当前阶段只确认登录回调链路和 state 校验骨架已就位，不会伪造真实登录态。
  redirect(res, 302, redirectUrl, [clearedStateCookie]);
}
