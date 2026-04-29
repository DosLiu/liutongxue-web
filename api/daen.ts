type RouteHandler = (req: any, res: any) => Promise<void> | void;

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
  callback: async () => (await import('./auth/callback.js')).default as RouteHandler,
  login: async () => (await import('./auth/login.js')).default as RouteHandler,
  logout: async () => (await import('./auth/logout.js')).default as RouteHandler,
  me: async () => (await import('./auth/me.js')).default as RouteHandler
} as const;

export default async function handler(req: any, res: any) {
  const route = resolveRoute(req).trim().toLowerCase() as keyof typeof routeHandlers;
  const routeHandlerLoader = routeHandlers[route];

  if (!routeHandlerLoader) {
    res.status(404).json({
      error: 'unsupported_route',
      message: '当前仅支持 callback、login、logout、me。',
      route
    });
    return;
  }

  const routeHandler = await routeHandlerLoader();
  await routeHandler(req, res);
}
