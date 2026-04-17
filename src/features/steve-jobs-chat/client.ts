import {
  buildSteveJobsMockReply,
  STEVE_JOBS_CHAT_FREE_LIMIT,
  STEVE_JOBS_CHAT_STORAGE_KEY,
  type SteveJobsChatResolvedStatus,
  type SteveJobsChatRole,
  type SteveJobsChatServiceStatus
} from './shared';

export const STEVE_JOBS_CHAT_INPUT_MAX_LENGTH = 400;
export const STEVE_JOBS_CHAT_HEALTHCHECK_TIMEOUT_MS = 5000;
export const STEVE_JOBS_CHAT_REQUEST_TIMEOUT_MS = 18000;

const STEVE_JOBS_CHAT_DEBUG_KEY = `${STEVE_JOBS_CHAT_STORAGE_KEY}-debug-unlimited`;
const STEVE_JOBS_CHAT_DEBUG_PARAM = 'debug-unlimited';

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

const setDeveloperUnlimited = (enabled: boolean) => {
  const storage = getStorage();
  if (!storage) return;

  if (enabled) {
    storage.setItem(STEVE_JOBS_CHAT_DEBUG_KEY, '1');
    return;
  }

  storage.removeItem(STEVE_JOBS_CHAT_DEBUG_KEY);
};

export const getSteveJobsChatDeveloperUnlimited = () => {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const debugParam = params.get(STEVE_JOBS_CHAT_DEBUG_PARAM);

  if (debugParam === '1') {
    setDeveloperUnlimited(true);
    return true;
  }

  if (debugParam === '0') {
    setDeveloperUnlimited(false);
    return false;
  }

  return getStorage()?.getItem(STEVE_JOBS_CHAT_DEBUG_KEY) === '1';
};

const getStoredRemaining = () => {
  const storage = getStorage();
  if (!storage) return STEVE_JOBS_CHAT_FREE_LIMIT;

  const cached = storage.getItem(STEVE_JOBS_CHAT_STORAGE_KEY);
  if (cached === null) {
    storage.setItem(STEVE_JOBS_CHAT_STORAGE_KEY, String(STEVE_JOBS_CHAT_FREE_LIMIT));
    return STEVE_JOBS_CHAT_FREE_LIMIT;
  }

  const parsed = Number.parseInt(cached, 10);
  return Number.isNaN(parsed) ? STEVE_JOBS_CHAT_FREE_LIMIT : Math.max(0, parsed);
};

export const setSteveJobsChatStoredRemaining = (value: number) => {
  getStorage()?.setItem(STEVE_JOBS_CHAT_STORAGE_KEY, String(value));
};

export const getSteveJobsChatInitialRemaining = () =>
  getSteveJobsChatDeveloperUnlimited() ? STEVE_JOBS_CHAT_FREE_LIMIT : getStoredRemaining();

export const getSteveJobsChatQuotaText = (isDeveloperUnlimited: boolean, remaining: number) =>
  isDeveloperUnlimited ? '开发调试：不限次数' : `剩余体验：${remaining}/${STEVE_JOBS_CHAT_FREE_LIMIT}`;

export const getSteveJobsChatStatusMeta = (status: SteveJobsChatServiceStatus) => {
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

export const createSteveJobsChatMessageId = (role: SteveJobsChatRole) =>
  `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createSteveJobsChatLocalFallback = ({
  content,
  apiUrl,
  isStaticPreview
}: {
  content: string;
  apiUrl: string | null;
  isStaticPreview: boolean;
}): {
  replyText: string;
  nextStatus: SteveJobsChatResolvedStatus;
  nextNotice: string;
  shouldConsume: boolean;
} => ({
  replyText: normalizeAssistantReply(buildSteveJobsMockReply(content)),
  nextStatus: apiUrl ? 'mock' : isStaticPreview ? 'preview' : 'offline',
  nextNotice: apiUrl
    ? '当前返回的是演示回复，不会扣减体验次数。'
    : isStaticPreview
      ? '当前是静态预览，最新功能与正式结果以 Vercel 为准，不会扣减体验次数。'
      : '当前未连接服务，先给你演示回复，不会扣减体验次数。',
  shouldConsume: false
});
