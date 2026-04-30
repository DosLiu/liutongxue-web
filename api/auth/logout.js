import { buildClearedSessionCookie, buildLogoutRedirectUrl } from '../_lib/auth.js';
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
