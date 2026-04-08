import { blogOpsSceneLogCollection } from './blog-ops';
import { digitalResidentSceneLogCollection } from './digital-resident';
import { siteOpsSceneLogCollection } from './site-ops';
import type { SceneLogCollection, SceneLogEntry, SceneLogKey } from './types';

export type { SceneLogCollection, SceneLogEntry, SceneLogKey } from './types';

export const sceneLogCollections: Record<SceneLogKey, SceneLogCollection> = {
  digitalResident: digitalResidentSceneLogCollection,
  blogOps: blogOpsSceneLogCollection,
  siteOps: siteOpsSceneLogCollection
};

const sortLogsDesc = (logs: SceneLogEntry[]) => [...logs].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function getSceneLogs(key: SceneLogKey) {
  return sortLogsDesc(sceneLogCollections[key].logs);
}

export function getLatestSceneLog(key: SceneLogKey) {
  return getSceneLogs(key)[0];
}
