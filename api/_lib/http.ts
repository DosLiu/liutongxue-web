type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

type ApiResponse = {
  end: () => void;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ApiResponse;
};

type CookieOptions = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.liutongxue.com.cn',
  'https://liutongxue.com.cn',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const normalizeHeaderValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : typeof value === 'string' ? value : undefined;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const parseAllowedOrigins = () => {
  const configured = env.ALLOWED_ORIGINS?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
};

const isAllowedOrigin = (origin: string | undefined, allowedOrigins: Set<string>) => {
  if (!origin) {
    return false;
  }

  return allowedOrigins.has(trimTrailingSlash(origin));
};

export const applyCors = (req: ApiRequest, res: ApiResponse, methods = 'GET, POST, OPTIONS') => {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = normalizeHeaderValue(req.headers?.origin);
  const normalizedOrigin = requestOrigin ? trimTrailingSlash(requestOrigin) : undefined;
  const allowOrigin = isAllowedOrigin(normalizedOrigin, allowedOrigins)
    ? normalizedOrigin ?? DEFAULT_ALLOWED_ORIGINS[0]
    : DEFAULT_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

export const noStore = (res: ApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
};

export const json = (res: ApiResponse, statusCode: number, payload: unknown) => {
  noStore(res);
  res.status(statusCode).json(payload);
};

export const redirect = (res: ApiResponse, statusCode: number, location: string, cookies?: string[]) => {
  noStore(res);
  if (cookies?.length) {
    res.setHeader('Set-Cookie', cookies);
  }
  res.setHeader('Location', location);
  res.status(statusCode).end();
};

export const methodNotAllowed = (res: ApiResponse) => {
  json(res, 405, { error: 'Method not allowed.' });
};

export const handleOptionsRequest = (res: ApiResponse) => {
  res.status(204).end();
};

export const parseCookies = (cookieHeader: string | undefined) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex <= 0) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = value;
      return cookies;
    }, {});
};

export const buildSetCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const parts = [`${name}=${value}`];

  parts.push(`Path=${options.path ?? '/'}`);

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

export const getRequestOrigin = (req: ApiRequest) => normalizeHeaderValue(req.headers?.origin);

export const getCookieHeader = (req: ApiRequest) => normalizeHeaderValue(req.headers?.cookie);

export const isSecureRequest = (req: ApiRequest) => {
  const forwardedProto = normalizeHeaderValue(req.headers?.['x-forwarded-proto'])?.toLowerCase();
  const origin = getRequestOrigin(req)?.toLowerCase();

  return forwardedProto === 'https' || origin?.startsWith('https://') || env.NODE_ENV === 'production';
};
