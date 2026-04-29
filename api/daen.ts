import authCallbackHandler from './auth/callback.js';
import authLoginHandler from './auth/login.js';
import authLogoutHandler from './auth/logout.js';
import authMeHandler from './auth/me.js';

const resolveRoute = (req: { query?: Record<string, string | string[] | undefined>; url?: string }) => {
  const directValue = req.query?.route;

  if (typeof directValue === 'string') {
    return directValue;
  }

  if (Array.isArray(directValue) && typeof directValue[0] === 'string') {
    return directValue[0];
  }

  if (typeof req.url === 'string') {
    try {
      return new URL(req.url, 'http://localhost').searchParams.get('route') ?? '';
    } catch {
      return '';
    }
  }

  return '';
};

const routeHandlers = {
  callback: authCallbackHandler,
  login: authLoginHandler,
  logout: authLogoutHandler,
  me: authMeHandler
} as const;

export default async function handler(req: any, res: any) {
  const route = resolveRoute(req).trim().toLowerCase() as keyof typeof routeHandlers;
  const routeHandler = routeHandlers[route];

  if (!routeHandler) {
    res.status(404).json({
      error: 'unsupported_route',
      message: '当前仅支持 callback、login、logout、me。',
      route
    });
    return;
  }

  await routeHandler(req, res);
}
