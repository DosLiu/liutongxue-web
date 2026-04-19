import type { SceneLogKey } from './types';

export const sceneRouteSegments: Record<SceneLogKey, string> = {
  digitalResident: 'digital-resident',
  blogOps: 'blog-ops',
  siteOps: 'site-ops'
};

const sceneRouteSegmentLookup = Object.fromEntries(
  Object.entries(sceneRouteSegments).map(([sceneKey, segment]) => [segment, sceneKey as SceneLogKey])
) as Record<string, SceneLogKey>;

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

const normalizeBaseUrl = (baseUrl: string) => {
  const trimmed = trimSlashes(baseUrl);
  return trimmed ? `/${trimmed}` : '';
};

const stripBaseUrl = (pathname: string, baseUrl: string) => {
  const prefix = normalizeBaseUrl(baseUrl);
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (prefix && normalizedPath.startsWith(prefix)) {
    const stripped = normalizedPath.slice(prefix.length);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }

  return normalizedPath;
};

const normalizeRoutePath = (pathname: string, baseUrl = import.meta.env.BASE_URL) => {
  const stripped = stripBaseUrl(pathname, baseUrl).replace(/\/+$/, '') || '/';
  return stripped === '/' ? '/' : `${stripped}/`;
};

export const resolveSceneLogCollectionRoute = (pathname: string, baseUrl = import.meta.env.BASE_URL) => {
  const match = normalizeRoutePath(pathname, baseUrl).match(/^\/scene\/([^/]+)\/$/);
  const sceneKey = match ? sceneRouteSegmentLookup[match[1]] : null;

  return sceneKey ? { sceneKey } : null;
};

export const resolveSceneLogDetailRoute = (pathname: string, baseUrl = import.meta.env.BASE_URL) => {
  const match = normalizeRoutePath(pathname, baseUrl).match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);
  const sceneKey = match ? sceneRouteSegmentLookup[match[1]] : null;

  return sceneKey && match ? { sceneKey, publishedAt: match[2] } : null;
};
