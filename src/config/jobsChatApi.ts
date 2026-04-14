const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

const getExplicitApiBaseUrl = () => {
  const configured = import.meta.env.VITE_JOBS_CHAT_API_BASE_URL?.trim();

  if (!configured) {
    return '';
  }

  return configured === '/' ? '' : trimTrailingSlash(configured);
};

export const getJobsChatApiUrl = () => {
  const explicitApiBaseUrl = getExplicitApiBaseUrl();
  const hasExplicitConfig = typeof import.meta.env.VITE_JOBS_CHAT_API_BASE_URL === 'string' && import.meta.env.VITE_JOBS_CHAT_API_BASE_URL.trim().length > 0;

  if (hasExplicitConfig) {
    return explicitApiBaseUrl ? `${explicitApiBaseUrl}/api/chat` : '/api/chat';
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const { hostname, origin } = window.location;

  if (isLocalHost(hostname) || hostname.endsWith('.vercel.app')) {
    return `${trimTrailingSlash(origin)}/api/chat`;
  }

  return null;
};
