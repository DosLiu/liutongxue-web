import { getSceneDetailCoverPath, getSceneDetailPath } from './routes';
import type { SceneLogCollection, SceneLogDetail, SceneLogEntry, SceneLogKey } from './types';

const collectionLoaders: Record<SceneLogKey, () => Promise<{ default: SceneLogCollection }>> = {
  digitalResident: () => import('./digital-resident'),
  blogOps: () => import('./blog-ops'),
  siteOps: () => import('./site-ops')
};

const detailLoaders: Record<SceneLogKey, () => Promise<{ default: Record<string, SceneLogDetail> }>> = {
  digitalResident: () => import('./digital-resident.detail'),
  blogOps: () => import('./blog-ops.detail'),
  siteOps: () => import('./site-ops.detail')
};

export async function loadSceneLogCollection(sceneKey: SceneLogKey) {
  const module = await collectionLoaders[sceneKey]();
  const collection = module.default;

  return {
    ...collection,
    logs: [...collection.logs].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  } satisfies SceneLogCollection;
}

export async function loadSceneLogDetail(sceneKey: SceneLogKey, publishedAt: string): Promise<SceneLogEntry | null> {
  const [collectionModule, detailModule] = await Promise.all([collectionLoaders[sceneKey](), detailLoaders[sceneKey]()]);
  const collection = collectionModule.default;
  const preview = collection.logs.find((log) => log.publishedAt === publishedAt);
  const detail = detailModule.default[publishedAt];

  if (!preview || !detail) {
    return null;
  }

  return {
    ...preview,
    ...detail,
    detailHref: getSceneDetailPath(sceneKey, publishedAt),
    detailImageSrc: getSceneDetailCoverPath(sceneKey, publishedAt)
  };
}
