export type FigureChatId = 'steve-jobs' | 'elon-musk' | 'zhang-yiming' | 'customer-service' | 'sales-assistant' | 'video-script-assistant' | 'liu-dongsheng';
export type FigureChatRole = 'assistant' | 'user';
export type FigureChatMode = 'api' | 'mock';
export type FigureChatServiceStatus = 'checking' | 'api' | 'mock' | 'offline' | 'preview';
export type FigureChatResolvedStatus = Exclude<FigureChatServiceStatus, 'checking'>;
export type FigureChatQuotaScope = 'device' | 'account';
export type FigureChatQuotaMode = 'device' | 'daily' | 'unavailable';
export type FigureChatQuota = {
    scope: FigureChatQuotaScope;
    mode: FigureChatQuotaMode;
    limit: number;
    remaining: number | null;
    resetAt?: string | null;
    exhausted?: boolean;
    enforced?: boolean;
    reason?: string;
};
export type FigureChatApiResponse = {
    error?: string;
    quota?: FigureChatQuota;
    reply: string;
    mode?: FigureChatMode;
    status?: FigureChatResolvedStatus;
    reason?: string;
    shouldConsume?: boolean;
};
export type FigureDirectReply = {
    reply: string;
    reason: string;
};
export type IncomingMessage = {
    role: FigureChatRole;
    content: string;
};
export type RequestBody = {
    figureId?: FigureChatId;
    messages?: IncomingMessage[];
};
type FigureChatModelDefinition = {
    systemPrompt: string;
    buildMockReply: (message: string) => string;
    resolveDirectReply?: (message: string) => FigureDirectReply | null;
    temperature?: number;
};
export declare const trimTrailingSlash: (value: string) => string;
export declare const normalizeFigureChatText: (value: unknown) => string;
declare const buildSteveJobsMockReply: (message: string) => string;
declare const resolveElonMuskDirectReply: (message: string) => FigureDirectReply | null;
declare const buildElonMuskMockReply: (message: string) => string;
declare const resolveZhangYimingDirectReply: (message: string) => FigureDirectReply | null;
declare const buildZhangYimingMockReply: (message: string) => string;
declare const buildCustomerServiceMockReply: (message: string) => string;
declare const buildSalesAssistantMockReply: (message: string) => string;
declare const buildVideoScriptAssistantMockReply: (message: string) => string;
export declare const polishZhangYimingReply: (reply: string, message?: string) => string;
export declare const getFigureChatModelDefinition: (figureId: FigureChatId) => FigureChatModelDefinition;
export declare const resolveFigureChatDirectReply: (figureId: FigureChatId, message: string) => FigureDirectReply | null;
export declare const buildFigureChatResponse: ({ error, quota, reply, mode, status, reason, shouldConsume }: {
    error?: string;
    quota?: FigureChatQuota;
    reply: string;
    mode: FigureChatMode;
    status: FigureChatResolvedStatus;
    reason: string;
    shouldConsume: boolean;
}) => FigureChatApiResponse;
export declare const buildFigureChatMockResponse: (figureId: FigureChatId, message: string, reason: string, status?: FigureChatResolvedStatus, quota?: FigureChatQuota) => FigureChatApiResponse;
export declare const getFigureChatHealthPayload: (hasApiKey: boolean) => FigureChatApiResponse;
export declare const DEFAULT_ALLOWED_ORIGINS: string[];
export declare const parseFigureChatAllowedOrigins: (configured?: string) => Set<string>;
export declare const isAllowedFigureChatOrigin: (origin: string | undefined, allowedOrigins: Set<string>) => boolean;
export declare const applyFigureChatCors: (req: any, res: any, allowedOrigins: Set<string>) => void;
export declare const parseFigureChatRequestBody: (body: unknown) => RequestBody;
export declare const isFigureChatApiResponse: (value: unknown) => value is FigureChatApiResponse;
export declare const sanitizeFigureChatMessages: (messages: unknown) => IncomingMessage[];
export declare const normalizeFigureChatId: (value: unknown) => FigureChatId;
export declare const resolveFigureChatServiceStatus: (status?: FigureChatApiResponse["status"], mode?: FigureChatApiResponse["mode"], fallbackStatus?: FigureChatResolvedStatus) => FigureChatResolvedStatus;
export { buildSteveJobsMockReply, buildElonMuskMockReply, buildZhangYimingMockReply, buildCustomerServiceMockReply, buildSalesAssistantMockReply, buildVideoScriptAssistantMockReply, resolveElonMuskDirectReply, resolveZhangYimingDirectReply };
