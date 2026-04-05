export const sitePaths = {
  home: import.meta.env.BASE_URL,
  tools: `${import.meta.env.BASE_URL}tools/`,
  contact: 'mailto:hello@liutongxue.com'
};

export const siteNavItems = [
  { label: 'Home', href: sitePaths.home, key: 'home' },
  { label: 'Tools', href: sitePaths.tools, key: 'tools' },
  { label: 'Contact', href: sitePaths.contact, key: 'contact' }
] as const;

export type SiteNavKey = (typeof siteNavItems)[number]['key'];
