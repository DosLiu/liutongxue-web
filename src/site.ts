const baseUrl = import.meta.env.BASE_URL;

export const sitePaths = {
  home: baseUrl,
  scene: `${baseUrl}scene/`,
  toolsPage: `${baseUrl}tools/`,
  sceneLogs: {
    digitalResident: `${baseUrl}scene/digital-resident/`,
    blogOps: `${baseUrl}scene/blog-ops/`,
    siteOps: `${baseUrl}scene/site-ops/`
  },
  contact: 'mailto:hello@liutongxue.com'
} as const;

export const siteNavItems = [
  { label: '首页', key: 'home', href: sitePaths.home },
  { label: '现场', key: 'scene', href: sitePaths.scene },
  { label: '具身AI', key: 'contact', href: sitePaths.contact }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
