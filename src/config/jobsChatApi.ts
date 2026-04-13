const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

const getExplicitApiBaseUrl = () => {
  const configured = import.meta.env.VITE_JOBS_CHAT_API_BASE_URL?.trim();
  return configured ? trimTrailingSlash(configured) : '';
};

export const getJobsChatApiUrl = () => {
  const explicitApiBaseUrl = getExplicitApiBaseUrl();
  if (explicitApiBaseUrl) {
    return `${explicitApiBaseUrl}/api/chat`;
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

