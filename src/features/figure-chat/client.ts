import { type FigureChatConfig, type FigureChatResolvedStatus, type FigureChatRole, type FigureChatServiceStatus } from './shared';

export const FIGURE_CHAT_INPUT_MAX_LENGTH = 400;
export const FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS = 5000;
export const FIGURE_CHAT_REQUEST_TIMEOUT_MS = 18000;

const FIGURE_CHAT_DEBUG_PARAM = 'debug-unlimited';
const FIGURE_CHAT_DEBUG_ALLOWED = import.meta.env.DEV;

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const getFigureChatDebugKey = (config: FigureChatConfig) => `${config.storageKey}-debug-unlimited`;
const clampFigureChatRemaining = (config: FigureChatConfig, value: number) => Math.min(config.freeLimit, Math.max(0, value));

const setDeveloperUnlimited = (config: FigureChatConfig, enabled: boolean) => {
  const storage = getStorage();
  if (!storage) return;

  if (enabled) {
    storage.setItem(getFigureChatDebugKey(config), '1');
    return;
  }

  storage.removeItem(getFigureChatDebugKey(config));
};

export const getFigureChatDeveloperUnlimited = (config: FigureChatConfig) => {
  if (typeof window === 'undefined' || !FIGURE_CHAT_DEBUG_ALLOWED) {
    setDeveloperUnlimited(config, false);
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get(FIGURE_CHAT_DEBUG_PARAM);

  if (debugParam === '1') {
    setDeveloperUnlimited(config, true);
    return true;
  }

  if (debugParam === '0') {
    setDeveloperUnlimited(config, false);
    return false;
  }

  return getStorage()?.getItem(getFigureChatDebugKey(config)) === '1';
};

const getStoredRemaining = (config: FigureChatConfig) => {
  const storage = getStorage();
  if (!storage) return config.freeLimit;

  const cached = storage.getItem(config.storageKey);
  if (cached === null) {
    storage.setItem(config.storageKey, String(config.freeLimit));
    return config.freeLimit;
  }

  const parsed = Number.parseInt(cached, 10);
  return Number.isNaN(parsed) ? config.freeLimit : clampFigureChatRemaining(config, parsed);
};

export const setFigureChatStoredRemaining = (config: FigureChatConfig, value: number) => {
  getStorage()?.setItem(config.storageKey, String(clampFigureChatRemaining(config, value)));
};

export const getFigureChatInitialRemaining = (config: FigureChatConfig) =>
  getFigureChatDeveloperUnlimited(config) ? config.freeLimit : getStoredRemaining(config);

export const getFigureChatQuotaText = (config: FigureChatConfig, isDeveloperUnlimited: boolean, remaining: number) =>
  isDeveloperUnlimited ? '开发调试：不限次数' : `剩余体验：${remaining}/${config.freeLimit}`;

export const getFigureChatStatusMeta = (status: FigureChatServiceStatus) => {
  switch (status) {
    case 'api':
      return { label: '真实模型', toneClassName: 'is-healthy' };
    case 'mock':
      return { label: '演示模式', toneClassName: 'is-pending' };
    case 'offline':
      return { label: '未连接', toneClassName: 'is-unhealthy' };
    case 'preview':
      return { label: '静态预览', toneClassName: 'is-preview' };
    default:
      return { label: '检测中', toneClassName: 'is-pending' };
  }
};

export const normalizeAssistantReply = (content: string) =>
  content
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim())
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*(\d+)[.)]\s+/gm, '$1. ')
    .replace(/^\s*[-*•]\s+/gm, '• ')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const normalizeUserInput = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const createFigureChatMessageId = (role: FigureChatRole) =>
  `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createFigureChatLocalFallback = ({
  content,
  apiUrl,
  isStaticPreview,
  config
}: {
  content: string;
  apiUrl: string | null;
  isStaticPreview: boolean;
  config: FigureChatConfig;
}): {
  replyText: string;
  nextStatus: FigureChatResolvedStatus;
  nextNotice: string;
  shouldConsume: boolean;
} => ({
  replyText: normalizeAssistantReply(config.buildMockReply(content)),
  nextStatus: apiUrl ? 'mock' : isStaticPreview ? 'preview' : 'offline',
  nextNotice: apiUrl
    ? '当前返回的是演示回复，不会扣减体验次数。'
    : isStaticPreview
      ? '当前是静态预览，最新功能与正式结果以 Vercel 为准，不会扣减体验次数。'
      : '当前未连接服务，先给你演示回复，不会扣减体验次数。',
  shouldConsume: false
});
