import blogOpsSceneLogCollection from './blog-ops';
import digitalResidentSceneLogCollection from './digital-resident';
import siteOpsSceneLogCollection from './site-ops';
import { getSceneCollectionPath, getSceneDetailPath, sceneRouteSegments } from './routes';
import type { SceneLogCollection, SceneLogKey, SceneLogPreview } from './types';

export const sceneLogCollections: Record<SceneLogKey, SceneLogCollection> = {
  digitalResident: digitalResidentSceneLogCollection,
  blogOps: blogOpsSceneLogCollection,
  siteOps: siteOpsSceneLogCollection
};

export const sceneCollectionList = Object.values(sceneLogCollections);

const sortLogsDesc = (logs: SceneLogPreview[]) => [...logs].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function getSceneCollection(key: SceneLogKey) {
  return sceneLogCollections[key];
}

export function getSceneLogs(key: SceneLogKey) {
  return sortLogsDesc(sceneLogCollections[key].logs);
}

export function getLatestSceneLog(key: SceneLogKey) {
  return getSceneLogs(key)[0];
}

export function getSceneLogPreview(key: SceneLogKey, publishedAt: string) {
  return getSceneLogs(key).find((log) => log.publishedAt === publishedAt);
}

export function listSceneCollectionPaths() {
  return Object.keys(sceneLogCollections).map((key) => getSceneCollectionPath(key as SceneLogKey));
}

export function listSceneDetailPaths() {
  return Object.entries(sceneLogCollections).flatMap(([key, collection]) =>
    collection.logs.map((log) => getSceneDetailPath(key as SceneLogKey, log.publishedAt))
  );
}

export { sceneRouteSegments };
export type { SceneLogCollection, SceneLogKey, SceneLogPreview } from './types';
