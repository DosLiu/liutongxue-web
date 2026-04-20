const baseUrl = import.meta.env.BASE_URL;

export const sitePaths = {
  home: baseUrl,
  scene: `${baseUrl}scene/`,
  figures: `${baseUrl}figures/`,
  figuresSteveJobs: `${baseUrl}figures/steve-jobs/`,
  figuresElonMusk: `${baseUrl}figures/elon-musk/`,
  figuresZhangYiming: `${baseUrl}figures/zhang-yiming/`,
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
    blogOpsFirst: `${baseUrl}scene/blog-ops/2026-03-13/`,
    blogOpsSecond: `${baseUrl}scene/blog-ops/2026-03-18/`,
    blogOpsThird: `${baseUrl}scene/blog-ops/2026-03-25/`,
    blogOpsFourth: `${baseUrl}scene/blog-ops/2026-04-01/`,
    siteOpsFirst: `${baseUrl}scene/site-ops/2026-04-01/`,
    siteOpsSecond: `${baseUrl}scene/site-ops/2026-04-02/`,
    siteOpsThird: `${baseUrl}scene/site-ops/2026-04-03/`,
    siteOpsFourth: `${baseUrl}scene/site-ops/2026-04-04/`
  },
  contact: 'mailto:hello@liutongxue.com'
} as const;

export const siteNavItems = [
  { label: '首页', key: 'home', href: sitePaths.home },
  { label: '案发现场', key: 'scene', href: sitePaths.scene },
  { label: '具身AI', key: 'contact', href: sitePaths.contact }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
