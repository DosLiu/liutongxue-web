import { buildConfigErrorMessage, getAuthConfig, readSessionFromRequest } from '../_lib/auth.js';
import { applyCors, handleOptionsRequest, json, methodNotAllowed } from '../_lib/http.js';
import { getAccountQuotaSnapshot } from '../_lib/quota.js';
const getStatus = (isLoginReady, hasSession) => {
    if (!isLoginReady) {
        return 'disabled';
    }
    return hasSession ? 'authenticated' : 'signed_out';
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
        loginEnabled: config.loginEnabled,
        loginProviders: (config.loginEnabled ? config.enabledTypes : []).map((type) => ({
            label: type === 'qq' ? 'QQ 登录' : type === 'baidu' ? '百度登录' : `${type} 登录`,
            type,
            url: `/api/auth/login?type=${encodeURIComponent(type)}`
        })),
        loginReady: config.isLoginReady,
        loginUrl: '/api/auth/login',
        logoutUrl: '/api/auth/logout',
        message: !config.loginEnabled
            ? '当前开放游客体验。'
            : status === 'disabled'
            ? buildConfigErrorMessage(config.missingLoginEnv)
            : status === 'authenticated'
                ? quota?.reason || '已登录，可继续对话。'
                : `游客可先体验 5 次，登录后每天可聊 ${config.dailyLimit} 次。`,
        missingEnv: config.loginEnabled ? config.missingLoginEnv : [],
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
