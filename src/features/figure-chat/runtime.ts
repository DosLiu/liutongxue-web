const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getExplicitApiUrl = () => {
  const configured = import.meta.env.VITE_CHAT_API_URL?.trim();

  if (!configured) {
    return '';
  }

  return configured;
};

const getExplicitApiBaseUrl = () => {
  const configured = import.meta.env.VITE_JOBS_CHAT_API_BASE_URL?.trim();

  if (!configured) {
    return '';
  }

  return configured === '/' ? '' : trimTrailingSlash(configured);
};

export const getFigureChatSurface = () => {
  if (typeof window === 'undefined') {
    return 'server' as const;
  }

  return 'runtime' as const;
};

export const getFigureChatApiUrl = () => {
  const explicitApiUrl = getExplicitApiUrl();
  if (explicitApiUrl) {
    return explicitApiUrl;
  }

  const explicitApiBaseUrl = getExplicitApiBaseUrl();
  const hasExplicitConfig =
    typeof import.meta.env.VITE_JOBS_CHAT_API_BASE_URL === 'string' && import.meta.env.VITE_JOBS_CHAT_API_BASE_URL.trim().length > 0;

  if (hasExplicitConfig) {
    return explicitApiBaseUrl ? `${explicitApiBaseUrl}/api/chat` : '/api/chat';
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return `${trimTrailingSlash(window.location.origin)}/api/chat`;
};
