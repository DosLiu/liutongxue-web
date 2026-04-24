import { buildConfigErrorMessage, buildDaenAuthorizeUrl, buildStateCookie, getAuthConfig } from '../_lib/auth';
import { applyCors, handleOptionsRequest, json, methodNotAllowed, redirect } from '../_lib/http';

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type ApiResponse = {
  end: () => void;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ApiResponse;
};

const getReturnTo = (req: ApiRequest) => {
  const directValue = req.query?.return_to;

  if (typeof directValue === 'string') {
    return directValue;
  }

  if (Array.isArray(directValue) && typeof directValue[0] === 'string') {
    return directValue[0];
  }

  if (typeof req.url === 'string') {
    try {
      return new URL(req.url, 'http://localhost').searchParams.get('return_to') ?? undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    handleOptionsRequest(res);
    return;
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  const config = getAuthConfig();
  if (!config.isLoginReady) {
    json(res, 503, {
      error: 'auth_config_missing',
      message: buildConfigErrorMessage(config.missingLoginEnv),
      missingEnv: config.missingLoginEnv,
      provider: 'daen'
    });
    return;
  }

  const { authUrl, statePayload } = buildDaenAuthorizeUrl(getReturnTo(req));
  const stateCookie = await buildStateCookie(statePayload, req);

  redirect(res, 302, authUrl, [stateCookie]);
}
