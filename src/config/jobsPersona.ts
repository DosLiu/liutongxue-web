// Legacy compatibility wrapper. Prefer steve-jobs-chat/shared exports for new work.
export {
  STEVE_JOBS_CHAT_DESCRIPTION as JOBS_CHAT_DESCRIPTION,
  STEVE_JOBS_CHAT_FREE_LIMIT as JOBS_CHAT_FREE_LIMIT,
  STEVE_JOBS_CHAT_STORAGE_KEY as JOBS_CHAT_STORAGE_KEY,
  STEVE_JOBS_CHAT_TITLE as JOBS_CHAT_TITLE,
  buildSteveJobsMockReply as buildMockReply
} from '../features/steve-jobs-chat/shared';
