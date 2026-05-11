import { sceneCollectionList, getSceneCollectionPath, getSceneDetailPath } from './data/scene';
import type { SceneLogKey } from './data/scene';

const baseUrl = import.meta.env.BASE_URL;

const withBaseUrl = (pathname: string) => baseUrl + pathname.replace(/^\//, '');

const sceneLogs = Object.fromEntries(
  sceneCollectionList.map((collection) => [collection.key, withBaseUrl(getSceneCollectionPath(collection.key))])
) as Record<SceneLogKey, string>;

export const sitePaths = {
  home: baseUrl,
  scene: withBaseUrl('/scene/'),
  figures: withBaseUrl('/figures/'),
  figuresSteveJobs: withBaseUrl('/figures/steve-jobs/'),
  figuresElonMusk: withBaseUrl('/figures/elon-musk/'),
  figuresZhangYiming: withBaseUrl('/figures/zhang-yiming/'),
  figuresCustomerService: withBaseUrl('/figures/customer-service/'),
  sceneLogs,
  contact: 'mailto:hello@liutongxue.com'
} as const;

export const getSceneCollectionHref = (sceneKey: SceneLogKey) => withBaseUrl(getSceneCollectionPath(sceneKey));

export const getSceneDetailHref = (sceneKey: SceneLogKey, publishedAt: string) =>
  withBaseUrl(getSceneDetailPath(sceneKey, publishedAt));

export const siteNavItems = [
  { label: '首页', key: 'home', href: sitePaths.home },
  { label: '案发现场', key: 'scene', href: sitePaths.scene },
  { label: '具身AI', key: 'contact', href: sitePaths.contact }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
