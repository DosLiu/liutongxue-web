const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.liutongxue.com.cn",
  "https://liutongxue.com.cn",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];
const env = globalThis.process?.env ?? {};
const normalizeHeaderValue = (value) => Array.isArray(value) ? value[0] : typeof value === "string" ? value : void 0;
const trimTrailingSlash = (value) => value.replace(/\/+$/, "");
const parseAllowedOrigins = () => {
  const configured = env.ALLOWED_ORIGINS?.split(",").map((item) => item.trim()).filter(Boolean);
  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
};
const isAllowedOrigin = (origin, allowedOrigins) => {
  if (!origin) {
    return false;
  }
  return allowedOrigins.has(trimTrailingSlash(origin));
};
const applyCors = (req, res, methods = "GET, POST, OPTIONS") => {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = normalizeHeaderValue(req.headers?.origin);
  const normalizedOrigin = requestOrigin ? trimTrailingSlash(requestOrigin) : void 0;
  const allowOrigin = isAllowedOrigin(normalizedOrigin, allowedOrigins) ? normalizedOrigin ?? DEFAULT_ALLOWED_ORIGINS[0] : DEFAULT_ALLOWED_ORIGINS[0];
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
};
const noStore = (res) => {
  res.setHeader("Cache-Control", "no-store");
};
const json = (res, statusCode, payload) => {
  noStore(res);
  res.status(statusCode).json(payload);
};
const redirect = (res, statusCode, location, cookies) => {
  noStore(res);
  if (cookies?.length) {
    res.setHeader("Set-Cookie", cookies);
  }
  res.setHeader("Location", location);
  res.status(statusCode).end();
};
const methodNotAllowed = (res) => {
  json(res, 405, { error: "Method not allowed." });
};
const handleOptionsRequest = (res) => {
  res.status(204).end();
};
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) {
    return {};
  }
  return cookieHeader.split(";").map((part) => part.trim()).filter(Boolean).reduce((cookies, part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex <= 0) {
      return cookies;
    }
    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    cookies[key] = value;
    return cookies;
  }, {});
};
const buildSetCookie = (name, value, options = {}) => {
  const parts = [`${name}=${value}`];
  parts.push(`Path=${options.path ?? "/"}`);
  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
};
const getRequestOrigin = (req) => normalizeHeaderValue(req.headers?.origin);
const getCookieHeader = (req) => normalizeHeaderValue(req.headers?.cookie);
const isSecureRequest = (req) => {
  const forwardedProto = normalizeHeaderValue(req.headers?.["x-forwarded-proto"])?.toLowerCase();
  const origin = getRequestOrigin(req)?.toLowerCase();
  return forwardedProto === "https" || origin?.startsWith("https://") || env.NODE_ENV === "production";
};
export {
  applyCors,
  buildSetCookie,
  getCookieHeader,
  getRequestOrigin,
  handleOptionsRequest,
  isSecureRequest,
  json,
  methodNotAllowed,
  noStore,
  parseCookies,
  redirect
};
