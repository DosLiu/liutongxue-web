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

export const canUseFigureChatStaticFallback = (apiUrl: string | null) => {
  if (!apiUrl || typeof window === 'undefined') return false;
  const { hostname, origin } = window.location;
  const isPreviewHost = ['localhost', '127.0.0.1', '[::1]'].includes(hostname) || hostname.endsWith('.github.io');
  return isPreviewHost && (apiUrl === `${origin}/api/chat` || apiUrl === '/api/chat');
};
