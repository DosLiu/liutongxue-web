const baseUrl = import.meta.env.BASE_URL;

export const sitePaths = {
  home: baseUrl,
  scene: `${baseUrl}scene/`,
  toolsPage: `${baseUrl}tools/`,
  jobsChat: `${baseUrl}jobs-chat/`,
  sceneLogs: {
    digitalResident: `${baseUrl}scene/digital-resident/`,
    blogOps: `${baseUrl}scene/blog-ops/`,
    siteOps: `${baseUrl}scene/site-ops/`
  },
  sceneLogDetails: {
    digitalResidentFirst: `${baseUrl}scene/digital-resident/2026-03-21/`,
    digitalResidentSecond: `${baseUrl}scene/digital-resident/2026-03-22/`,
    digitalResidentThird: `${baseUrl}scene/digital-resident/2026-03-24/`,
    digitalResidentFourth: `${baseUrl}scene/digital-resident/2026-03-26/`,
    digitalResidentFifth: `${baseUrl}scene/digital-resident/2026-03-27/`,
    blogOpsFirst: `${baseUrl}scene/blog-ops/2026-03-13/`
  },
  contact: 'mailto:hello@liutongxue.com'
} as const;

export const siteNavItems = [
  { label: '首页', key: 'home', href: sitePaths.home },
  { label: '案发现场', key: 'scene', href: sitePaths.scene },
  { label: '具身AI', key: 'contact', href: sitePaths.contact }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
