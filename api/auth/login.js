import { buildConfigErrorMessage, buildDaenLoginRedirect, buildStateCookie, getAuthConfig, resolveLoginType } from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http.js';
const getReturnTo = (req) => {
    const directValue = req.query?.return_to;
    if (typeof directValue === 'string') {
        return directValue;
    }
    if (Array.isArray(directValue) && typeof directValue[0] === 'string') {
        return directValue[0];
    }
    if (typeof req.url === 'string') {
        try {
            return new URL(req.url, 'http://localhost').searchParams.get('return_to') ?? undefined;
        }
        catch {
            return undefined;
        }
    }
    return undefined;
};
export default async function handler(req, res) {
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
    if (!config.isLoginReady) {
        json(res, 503, {
            error: 'auth_config_missing',
            message: buildConfigErrorMessage(config.missingLoginEnv),
            missingEnv: config.missingLoginEnv,
            provider: 'daen'
        });
        return;
    }
    const loginTypeResult = resolveLoginType(req);
    if (!loginTypeResult.isSupported) {
        json(res, 400, {
            allowedTypes: loginTypeResult.allowedTypes,
            error: 'unsupported_login_type',
            message: loginTypeResult.reason,
            provider: 'daen'
        });
        return;
    }
    try {
        const { loginUrl, statePayload } = buildDaenLoginRedirect(loginTypeResult.loginType, getReturnTo(req));
        const stateCookie = await buildStateCookie(statePayload, req);
        redirect(res, 302, loginUrl, [stateCookie]);
    }
    catch (error) {
        json(res, 502, {
            error: 'daen_login_failed',
            loginType: loginTypeResult.loginType,
            message: error instanceof Error ? error.message : '大恩登录地址构建失败。',
            provider: 'daen'
        });
    }
}
