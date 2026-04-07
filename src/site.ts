export const sitePaths = {
  home: import.meta.env.BASE_URL,
  tools: `${import.meta.env.BASE_URL}#tools`,
  toolsPage: `${import.meta.env.BASE_URL}tools/`,
  contact: 'mailto:hello@liutongxue.com'
};

export const siteNavItems = [
  { label: '首页', href: sitePaths.home, key: 'home' },
  { label: '现场', href: sitePaths.tools, key: 'tools' },
  { label: '具身AI', href: sitePaths.contact, key: 'contact' }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
