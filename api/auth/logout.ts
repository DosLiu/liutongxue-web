import { buildClearedSessionCookie, buildLogoutRedirectUrl } from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http.js';

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    handleOptionsRequest(res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  const clearedCookie = buildClearedSessionCookie(req);

  if (req.method === 'GET') {
    redirect(res, 302, buildLogoutRedirectUrl(), [clearedCookie]);
    return;
  }

  json(res, 200, {
    ok: true,
    redirectTo: buildLogoutRedirectUrl(),
    logoutUrl: '/api/auth/logout',
    // 第二步如启用 KV，这里同步补 session 删除与 provider logout。
  });
  res.setHeader('Set-Cookie', clearedCookie);
}
