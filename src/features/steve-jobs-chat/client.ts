import {
  createFigureChatLocalFallback,
  createFigureChatMessageId,
  FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS,
  FIGURE_CHAT_INPUT_MAX_LENGTH,
  FIGURE_CHAT_REQUEST_TIMEOUT_MS,
  getFigureChatDeveloperUnlimited,
  getFigureChatInitialRemaining,
  getFigureChatQuotaText,
  getFigureChatStatusMeta,
  normalizeAssistantReply,
  normalizeUserInput,
  setFigureChatStoredRemaining
} from '../figure-chat/client';
import { getFigureChatConfig } from '../figure-chat/shared';

const steveJobsConfig = getFigureChatConfig('steve-jobs');

export const STEVE_JOBS_CHAT_INPUT_MAX_LENGTH = FIGURE_CHAT_INPUT_MAX_LENGTH;
export const STEVE_JOBS_CHAT_HEALTHCHECK_TIMEOUT_MS = FIGURE_CHAT_HEALTHCHECK_TIMEOUT_MS;
export const STEVE_JOBS_CHAT_REQUEST_TIMEOUT_MS = FIGURE_CHAT_REQUEST_TIMEOUT_MS;

export { normalizeAssistantReply, normalizeUserInput };

export const getSteveJobsChatDeveloperUnlimited = () => getFigureChatDeveloperUnlimited(steveJobsConfig);
export const getSteveJobsChatInitialRemaining = () => getFigureChatInitialRemaining(steveJobsConfig);
export const setSteveJobsChatStoredRemaining = (value: number) => setFigureChatStoredRemaining(steveJobsConfig, value);
export const getSteveJobsChatQuotaText = (isDeveloperUnlimited: boolean, remaining: number) =>
  getFigureChatQuotaText(steveJobsConfig, isDeveloperUnlimited, remaining);
export const getSteveJobsChatStatusMeta = getFigureChatStatusMeta;
export const createSteveJobsChatMessageId = createFigureChatMessageId;
export const createSteveJobsChatLocalFallback = ({ content, apiUrl, isStaticPreview }: { content: string; apiUrl: string | null; isStaticPreview: boolean }) =>
  createFigureChatLocalFallback({ content, apiUrl, isStaticPreview, config: steveJobsConfig });
