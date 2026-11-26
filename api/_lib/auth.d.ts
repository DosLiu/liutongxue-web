type ApiRequest = {
    headers?: Record<string, string | string[] | undefined>;
    query?: Record<string, string | string[] | undefined>;
    url?: string;
};
export type AuthStatus = 'disabled' | 'signed_out' | 'authenticated';
export type AuthSession = {
    avatarUrl?: string;
    displayName?: string;
    expiresAt: string;
    issuedAt: string;
    loginType: string;
    provider: 'daen';
    socialUid: string;
    storage: 'cookie';
    subject: string;
};
type SignedStatePayload = {
    expiresAt: string;
    issuedAt: string;
    loginType: string;
    nonce: string;
    returnTo?: string;
};
type DaenLoginResult = {
    code: number;
    msg: string;
    qrcode?: string;
    type?: string;
    url?: string;
};
type DaenCallbackResult = {
    access_token?: string;
    code: number;
    faceimg?: string;
    gender?: string;
    ip?: string;
    location?: string;
    msg: string;
    nickname?: string;
    social_uid?: string;
    type?: string;
};
export declare const getAuthConfig: () => {
    appId: string;
    appKey: string;
    callbackUrl: string;
    connectUrl: string;
    dailyLimit: number;
    enabledTypes: string[];
    isCallbackReady: boolean;
    isKvConfigured: boolean;
    isLoginReady: boolean;
    kv: {
        enabled: boolean;
        kvRestApiToken: string;
        kvRestApiUrl: string;
        kvUrl: string;
        mode: string;
    };
    loginEnabled: boolean;
    loginSuccessUrl: string;
    logoutRedirectUrl: string;
    missingLoginEnv: string[];
    sessionCookieName: string;
    sessionSecret: string;
    sessionTtlSeconds: number;
    stateCookieName: string;
};
export declare const buildConfigErrorMessage: (missingEnv: string[]) => string;
export declare const resolveLoginType: (req: ApiRequest) => {
    allowedTypes: string[];
    isSupported: boolean;
    loginType: string;
    reason: string;
};
export declare const buildDaenLoginRequest: (loginType: string, returnTo?: string) => {
    loginRequestUrl: string;
    statePayload: {
        expiresAt: string;
        issuedAt: string;
        loginType: string;
        nonce: string;
        returnTo: string | undefined;
    };
};
export declare const requestDaenLoginUrl: (loginType: string, returnTo?: string) => Promise<{
    loginUrl: string;
    payload: DaenLoginResult;
    statePayload: {
        expiresAt: string;
        issuedAt: string;
        loginType: string;
        nonce: string;
        returnTo: string | undefined;
    };
}>;
export declare const buildDaenLoginRedirect: (loginType: string, returnTo?: string) => {
    loginUrl: string;
    statePayload: {
        expiresAt: string;
        issuedAt: string;
        loginType: string;
        nonce: string;
        returnTo: string | undefined;
    };
};
export declare const exchangeDaenCallback: (loginType: string, code: string) => Promise<DaenCallbackResult>;
export declare const buildSessionFromDaenProfile: (profile: DaenCallbackResult) => AuthSession;
export declare const buildStateCookie: (payload: SignedStatePayload, req: ApiRequest) => Promise<string>;
export declare const buildClearedStateCookie: (req: ApiRequest) => string;
export declare const buildSessionCookie: (session: AuthSession, req: ApiRequest) => Promise<string>;
export declare const buildClearedSessionCookie: (req: ApiRequest) => string;
export declare const readStateFromRequest: (req: ApiRequest) => Promise<SignedStatePayload | null>;
export declare const readSessionFromRequest: (req: ApiRequest) => Promise<AuthSession | null>;
export declare const buildPostAuthRedirectUrl: (req: ApiRequest, status: "signed-in" | "auth-error") => Promise<string>;
export declare const buildLogoutRedirectUrl: () => string;
export declare const getCallbackQuery: (req: ApiRequest) => {
    code: string | undefined;
    error: string | undefined;
    errorDescription: string | undefined;
    loginType: string;
    nonce: string;
    returnTo: string | undefined;
};
export {};
