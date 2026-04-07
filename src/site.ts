export const sitePaths = {
  home: import.meta.env.BASE_URL,
  tools: `${import.meta.env.BASE_URL}#tools`,
  toolsPage: `${import.meta.env.BASE_URL}tools/`,
  contact: 'mailto:hello@liutongxue.com'
};

export const siteNavItems = [
  { label: '首页', key: 'home' },
  { label: '现场', key: 'tools' },
  { label: '具身AI', key: 'contact' }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
