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

export const getJobsChatApiHint = () => {
  const explicitApiBaseUrl = getExplicitApiBaseUrl();
  if (explicitApiBaseUrl) {
    return `在线模式已指向：${explicitApiBaseUrl}`;
  }

  if (typeof window === 'undefined') {
    return '当前环境尚未加载 API 地址。';
  }

  const { hostname } = window.location;

  if (isLocalHost(hostname) || hostname.endsWith('.vercel.app')) {
    return '在线模式将直接调用当前站点的 /api/chat。';
  }

  return '当前页面运行在 GitHub Pages；要启用真实模型，需要配置 VITE_JOBS_CHAT_API_BASE_URL 指向 Vercel API 域名。';
};

export const getJobsChatApiInitialModeLabel = () => {
  const explicitApiBaseUrl = getExplicitApiBaseUrl();
  if (explicitApiBaseUrl) {
    return `在线模式：在线模式已指向：${explicitApiBaseUrl}`;
  }

  if (typeof window === 'undefined') {
    return '演示模式：当前环境尚未加载 API 地址。';
  }

  const { hostname } = window.location;

  if (isLocalHost(hostname) || hostname.endsWith('.vercel.app')) {
    return '在线模式：在线模式将直接调用当前站点的 /api/chat。';
  }

  return '演示模式：当前页面运行在 GitHub Pages；要启用真实模型，需要配置 VITE_JOBS_CHAT_API_BASE_URL 指向 Vercel API 域名。';
};

export const getJobsChatApiFallbackReason = () => {
  if (typeof window === 'undefined') {
    return '当前环境尚未加载 API 地址，先保留演示回复。';
  }

  const { hostname } = window.location;
  if (isLocalHost(hostname) || hostname.endsWith('.vercel.app')) {
    return '当前环境未连上模型 API，已自动回退到演示回复。';
  }

  return '当前页面还没配置 Vercel API 地址，已自动回退到演示回复。';
};
