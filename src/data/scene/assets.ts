import { sceneRouteSegments } from './routes';
import type { SceneLogKey } from './types';

const sceneRouteLookup = Object.fromEntries(
  Object.entries(sceneRouteSegments).map(([sceneKey, segment]) => [segment, sceneKey as SceneLogKey])
) as Record<string, SceneLogKey>;

const sceneDetailCoverModules = import.meta.glob('../../assets/scene/*/*/cover.webp', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const createSceneDetailCoverAssetMap = () => {
  const assetMap: Record<SceneLogKey, Record<string, string>> = {
    digitalResident: {},
    blogOps: {},
    siteOps: {}
  };

  for (const [assetPath, assetUrl] of Object.entries(sceneDetailCoverModules)) {
    const match = assetPath.match(/\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/cover\.webp$/);
    const sceneKey = match ? sceneRouteLookup[match[1]] : undefined;
    const publishedAt = match?.[2];

    if (!sceneKey || !publishedAt) {
      continue;
    }

    assetMap[sceneKey][publishedAt] = assetUrl;
  }

  return assetMap;
};

const sceneDetailCoverAssetMap = createSceneDetailCoverAssetMap();

export const getSceneDetailCoverAsset = (sceneKey: SceneLogKey, publishedAt: string) =>
  sceneDetailCoverAssetMap[sceneKey][publishedAt];
