import type { SceneLogKey } from './types';

// Set to false and redeploy to reopen the project card and all log URLs.
export const SCENE_LOGS_UNDER_MAINTENANCE = true;

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

  if (prefix && (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return normalizedPath.slice(prefix.length) || '/';
  }

  return normalizedPath;
};

const normalizeRoutePath = (pathname: string, baseUrl = '/') => {
  const stripped = stripBaseUrl(pathname, baseUrl).replace(/\/index\.html$/, '/');
  return `${stripped.replace(/\/+$/, '')}/`;
};

export const getSceneCollectionPath = (sceneKey: SceneLogKey) => `/scene/${sceneRouteSegments[sceneKey]}/`;

export const getSceneDetailPath = (sceneKey: SceneLogKey, publishedAt: string) =>
  `${getSceneCollectionPath(sceneKey)}${publishedAt}/`;

export const resolveSceneLogCollectionRoute = (pathname: string, baseUrl = '/') => {
  const match = normalizeRoutePath(pathname, baseUrl).match(/^\/scene\/([^/]+)\/$/);
  const sceneKey = match ? sceneRouteSegmentLookup[match[1]] : null;

  return sceneKey ? { sceneKey } : null;
};

export const resolveSceneLogDetailRoute = (pathname: string, baseUrl = '/') => {
  const match = normalizeRoutePath(pathname, baseUrl).match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);
  const sceneKey = match ? sceneRouteSegmentLookup[match[1]] : null;

  return sceneKey && match ? { sceneKey, publishedAt: match[2] } : null;
};

export const isSceneLogPath = (pathname: string) =>
  normalizeRoutePath(pathname) === '/scene/ai-logs/' ||
  Boolean(resolveSceneLogCollectionRoute(pathname) || resolveSceneLogDetailRoute(pathname));
