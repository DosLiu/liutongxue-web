import {
  buildSteveJobsMockReply,
  getFigureChatConfig,
  resolveFigureChatServiceStatus,
  type FigureChatApiResponse,
  type FigureChatMode,
  type FigureChatResolvedStatus,
  type FigureChatRole,
  type FigureChatServiceStatus
} from '../figure-chat/shared';

const steveJobsConfig = getFigureChatConfig('steve-jobs');

export type SteveJobsChatRole = FigureChatRole;
export type SteveJobsChatMode = FigureChatMode;
export type SteveJobsChatServiceStatus = FigureChatServiceStatus;
export type SteveJobsChatResolvedStatus = FigureChatResolvedStatus;
export type SteveJobsChatApiResponse = FigureChatApiResponse;

export {
  buildSteveJobsMockReply,
  resolveFigureChatServiceStatus as resolveSteveJobsChatServiceStatus
};

export const STEVE_JOBS_CHAT_TITLE = steveJobsConfig.title;
export const STEVE_JOBS_CHAT_DESCRIPTION = steveJobsConfig.description;
export const STEVE_JOBS_CHAT_STORAGE_KEY = steveJobsConfig.storageKey;
export const STEVE_JOBS_CHAT_FREE_LIMIT = steveJobsConfig.freeLimit;
