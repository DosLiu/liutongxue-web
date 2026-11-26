import { sceneCollectionList, getSceneCollectionPath, getSceneDetailPath } from './data/scene';
import type { SceneLogKey } from './data/scene';

const baseUrl = import.meta.env.BASE_URL;

export const withBaseUrl = (pathname: string) => baseUrl + pathname.replace(/^\//, '');

const sceneLogs = Object.fromEntries(
  sceneCollectionList.map((collection) => [collection.key, withBaseUrl(getSceneCollectionPath(collection.key))])
) as Record<SceneLogKey, string>;

export const sitePaths = {
  home: baseUrl,
  scene: withBaseUrl('/scene/'),
  sceneAiLogs: withBaseUrl('/scene/ai-logs/'),
  figures: withBaseUrl('/figures/'),
  figuresLiuDongsheng: withBaseUrl('/figures/liu-dongsheng/'),
  figuresSteveJobs: withBaseUrl('/figures/steve-jobs/'),
  figuresElonMusk: withBaseUrl('/figures/elon-musk/'),
  figuresZhangYiming: withBaseUrl('/figures/zhang-yiming/'),
  figuresCustomerService: withBaseUrl('/figures/customer-service/'),
  figuresSalesAssistant: withBaseUrl('/figures/sales-assistant/'),
  figuresVideoScriptAssistant: withBaseUrl('/figures/video-script-assistant/'),
  sceneLogs,
  // 首页「与我链接」二维码区块锚点（用字符串拼接，避免被 smoke-check 当作独立路由）
  contact: baseUrl + '#contact',
  resumeSite: 'https://jianli.liutongxue.com.cn/'
} as const;

export const getSceneCollectionHref = (sceneKey: SceneLogKey) => withBaseUrl(getSceneCollectionPath(sceneKey));

export const getSceneDetailHref = (sceneKey: SceneLogKey, publishedAt: string) =>
  withBaseUrl(getSceneDetailPath(sceneKey, publishedAt));

export const siteNavItems = [
  { label: '首页', key: 'home', href: sitePaths.home },
  { label: '案发现场', key: 'scene', href: sitePaths.scene },
  { label: '硅基同事', key: 'figures', href: sitePaths.figures }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];

// 导航右侧高亮按钮：跳转到首页「与我链接」二维码区块
export const siteContactCta = { label: '与我链接', href: sitePaths.contact } as const;
