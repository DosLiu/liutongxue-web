import { buildClearedSessionCookie, buildLogoutRedirectUrl, getAuthConfig } from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http.js';
export default async function handler(req, res) {
    applyCors(req, res);
    if (req.method === 'OPTIONS') {
        handleOptionsRequest(res);
        return;
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
        methodNotAllowed(res);
        return;
    }
    if (!getAuthConfig().loginEnabled) {
        json(res, 503, { error: 'login_disabled', message: '登录暂未开放，可使用游客模式。' });
        return;
    }
    const clearedCookie = buildClearedSessionCookie(req);
    if (req.method === 'GET') {
        redirect(res, 302, buildLogoutRedirectUrl(), [clearedCookie]);
        return;
    }
    res.setHeader('Set-Cookie', clearedCookie);
    json(res, 200, {
        ok: true,
        redirectTo: buildLogoutRedirectUrl(),
        logoutUrl: '/api/auth/logout'
    });
}
