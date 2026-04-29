import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  createCriticalPageFaqStructuredData,
  criticalPageContent,
  criticalPageFallbackStyle,
  renderCriticalPageSnapshot
} from './src/seo/criticalPageContent';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const canonicalPathOverrides: Record<string, string> = {
  '/tools/': '/scene/'
};

const toCanonicalPath = (filename?: string, pagePath?: string) => {
  if (filename) {
    const relativeFilename = relative(__dirname, filename).replace(/\\/g, '/');

    if (relativeFilename === 'index.html') {
      return '/';
    }

    if (relativeFilename.endsWith('/index.html')) {
      return `/${relativeFilename.slice(0, -'/index.html'.length)}/`;
    }
  }

  if (!pagePath || pagePath === '/' || pagePath === '/index.html') {
    return '/';
  }

  if (pagePath.endsWith('/index.html')) {
    return pagePath.slice(0, -'index.html'.length);
  }

  if (pagePath.endsWith('.html')) {
    return pagePath;
  }

  return pagePath.endsWith('/') ? pagePath : `${pagePath}/`;
};

const buildAbsoluteUrl = (siteUrl: string, pathname: string) => {
  if (pathname === '/') {
    return `${siteUrl}/`;
  }

  return `${siteUrl}${pathname}`;
};

const extractTagContent = (html: string, pattern: RegExp) => html.match(pattern)?.[1]?.trim() || '';
const stripSitePrefix = (title: string) => title.replace(/^Liutongxue\s*[·｜|-]\s*/, '').trim();
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const applyHeadMetadata = (html: string, title: string, description: string) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  let nextHtml = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  if (/<meta\s+name=["']description["']/i.test(nextHtml)) {
    nextHtml = nextHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
      `<meta name="description" content="${safeDescription}" />`
    );
  } else {
    nextHtml = nextHtml.replace('</head>', `    <meta name="description" content="${safeDescription}" />\n  </head>`);
  }

  return nextHtml;
};

const figureBreadcrumbTitles: Record<string, string> = {
  'steve-jobs': 'AI 乔布斯人物对话实验',
  'elon-musk': 'AI 马斯克人物对话实验',
  'zhang-yiming': 'AI 张一鸣人物对话实验'
};

const sceneCollectionStructuredData: Record<
  string,
  {
    collectionPath: string;
    collectionTitle: string;
    siteLabel: string;
  }
> = {
  'digital-resident': {
    collectionPath: '/scene/digital-resident/',
    collectionTitle: 'AI原生数字居民工作日志',
    siteLabel: 'AI原生数字居民'
  },
  'blog-ops': {
    collectionPath: '/scene/blog-ops/',
    collectionTitle: 'AI原生博客运营团队工作日志',
    siteLabel: 'AI原生博客运营团队'
  },
  'site-ops': {
    collectionPath: '/scene/site-ops/',
    collectionTitle: 'AI原生建站运营团队工作日志',
    siteLabel: 'AI原生建站运营团队'
  }
};

const sceneDetailPathPattern = /^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/;
const defaultSocialImagePath = '/og/liutongxue-share.png';
const seoTitleOverrides: Record<string, string> = {
  '/figures/': 'Liutongxue · AI 人物对话实验入口与实验说明',
  '/scene/': 'Liutongxue · AI 团队场景日志：项目现场与协作记录'
};

const resolveSeoMetadata = (pathname: string, fallbackTitle: string, fallbackDescription: string) => {
  const page = criticalPageContent[pathname];
  const sceneDetailMatch = pathname.match(sceneDetailPathPattern);
  const collectionMeta = sceneDetailMatch ? sceneCollectionStructuredData[sceneDetailMatch[1]] : null;
  const description = page?.lead ?? fallbackDescription;

  if (sceneDetailMatch && page && collectionMeta) {
    return {
      title: `Liutongxue · ${page.heading}｜${collectionMeta.collectionTitle}`,
      description,
      socialTitle: page.heading,
      ogType: 'article' as const,
      publishedTime: `${sceneDetailMatch[2]}T00:00:00+08:00`,
      modifiedTime: `${sceneDetailMatch[2]}T00:00:00+08:00`,
      articleSection: collectionMeta.collectionTitle,
      structuredDataTitle: page.heading
    };
  }

  return {
    title: seoTitleOverrides[pathname] ?? fallbackTitle,
    description,
    socialTitle: page?.heading ?? (stripSitePrefix(seoTitleOverrides[pathname] ?? fallbackTitle) || fallbackTitle),
    ogType: 'website' as const,
    structuredDataTitle: page?.heading ?? fallbackTitle
  };
};

const createSceneCollectionItemListStructuredData = (pathname: string) => {
  const match = pathname.match(/^\/scene\/([^/]+)\/$/);
  const collectionMeta = match ? sceneCollectionStructuredData[match[1]] : null;
  const page = criticalPageContent[pathname];
  const items = page?.sections.flatMap((section) => section.items ?? []).slice(0, 5) ?? [];

  if (!match || !collectionMeta || !page || !items.length) {
    return null;
  }

  const collectionUrl = buildAbsoluteUrl(canonicalSiteUrl, collectionMeta.collectionPath);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${collectionUrl}#collection`,
        url: collectionUrl,
        name: collectionMeta.collectionTitle,
        description: page.lead,
        isPartOf: {
          '@id': `${canonicalSiteUrl}/#website`
        },
        mainEntity: {
          '@id': `${collectionUrl}#itemlist`
        },
        inLanguage: 'zh-CN'
      },
      {
        '@type': 'ItemList',
        '@id': `${collectionUrl}#itemlist`,
        name: `${collectionMeta.siteLabel} 最新公开日志`,
        numberOfItems: items.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: items.map((item, index) => {
          const logUrl = buildAbsoluteUrl(canonicalSiteUrl, item.href);
          return {
            '@type': 'ListItem',
            position: index + 1,
            url: logUrl,
            name: item.title,
            item: {
              '@type': 'BlogPosting',
              '@id': `${logUrl}#log`,
              url: logUrl,
              headline: item.title,
              description: item.description,
              datePublished: item.meta,
              dateModified: item.meta,
              articleSection: collectionMeta.collectionTitle,
              inLanguage: 'zh-CN'
            }
          };
        })
      }
    ]
  };
};

const createSceneDetailStructuredData = (pathname: string, absoluteUrl: string, title: string, description: string) => {
  const match = pathname.match(sceneDetailPathPattern);
  const collectionMeta = match ? sceneCollectionStructuredData[match[1]] : null;

  if (!match || !collectionMeta || !title || !description) {
    return null;
  }

  const collectionUrl = buildAbsoluteUrl(canonicalSiteUrl, collectionMeta.collectionPath);
  const headline = stripSitePrefix(title) || title;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${absoluteUrl}#log`,
        url: absoluteUrl,
        headline,
        description,
        datePublished: match[2],
        dateModified: match[2],
        genre: '工作日志',
        articleSection: collectionMeta.collectionTitle,
        mainEntityOfPage: {
          '@id': `${absoluteUrl}#webpage`
        },
        isPartOf: {
          '@type': 'CollectionPage',
          '@id': `${collectionUrl}#webpage`,
          url: collectionUrl,
          name: collectionMeta.collectionTitle
        },
        about: [
          {
            '@type': 'Thing',
            name: '日志详情'
          },
          {
            '@type': 'Thing',
            name: collectionMeta.siteLabel
          }
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Liutongxue',
          url: `${canonicalSiteUrl}/`
        },
        inLanguage: 'zh-CN'
      },
      {
        '@type': 'WebPage',
        '@id': `${absoluteUrl}#webpage`,
        url: absoluteUrl,
        name: title,
        description,
        isPartOf: {
          '@id': `${canonicalSiteUrl}/#website`
        },
        about: {
          '@id': `${absoluteUrl}#log`
        },
        inLanguage: 'zh-CN'
      }
    ]
  };
};

const createBreadcrumbStructuredData = (pathname: string, absoluteUrl: string, title: string) => {
  const items: Array<{ name: string; item: string }> = [{ name: 'Liutongxue 首页', item: `${canonicalSiteUrl}/` }];
  const figureMatch = pathname.match(/^\/figures\/([^/]+)\/$/);
  const sceneCollectionMatch = pathname.match(/^\/scene\/([^/]+)\/$/);
  const sceneDetailMatch = pathname.match(sceneDetailPathPattern);

  if (pathname === '/figures/') {
    items.push({ name: 'AI 人物对话实验', item: absoluteUrl });
  } else if (figureMatch) {
    items.push({ name: 'AI 人物对话实验', item: `${canonicalSiteUrl}/figures/` });
    items.push({ name: figureBreadcrumbTitles[figureMatch[1]] ?? (stripSitePrefix(title) || title), item: absoluteUrl });
  } else if (pathname === '/scene/') {
    items.push({ name: 'AI 团队场景日志', item: absoluteUrl });
  } else if (sceneDetailMatch) {
    const collectionMeta = sceneCollectionStructuredData[sceneDetailMatch[1]];

    if (collectionMeta) {
      items.push({ name: 'AI 团队场景日志', item: `${canonicalSiteUrl}/scene/` });
      items.push({ name: collectionMeta.collectionTitle, item: buildAbsoluteUrl(canonicalSiteUrl, collectionMeta.collectionPath) });
      items.push({ name: stripSitePrefix(title) || title, item: absoluteUrl });
    }
  } else if (sceneCollectionMatch) {
    const collectionMeta = sceneCollectionStructuredData[sceneCollectionMatch[1]];

    if (collectionMeta) {
      items.push({ name: 'AI 团队场景日志', item: `${canonicalSiteUrl}/scene/` });
      items.push({ name: collectionMeta.collectionTitle, item: absoluteUrl });
    }
  }

  if (items.length < 2) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
};

const injectRootSnapshot = (html: string, pathname: string) => {
  const snapshotHtml = renderCriticalPageSnapshot(pathname);

  if (!snapshotHtml) {
    return html;
  }

  return html.replace('<div id="root"></div>', `<div id="root">${snapshotHtml}</div>`);
};

const canonicalSiteUrl = trimTrailingSlash(process.env.VITE_CANONICAL_SITE_URL || 'https://www.liutongxue.com.cn');
const siteUrl = trimTrailingSlash(process.env.VITE_SITE_URL || canonicalSiteUrl);
const isNonCanonicalBuild = siteUrl !== canonicalSiteUrl;

const collectHtmlFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return collectHtmlFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
    })
    .sort();

const htmlInputs = [
  resolve(__dirname, 'index.html'),
  ...['tools', 'figures', 'scene'].flatMap((directory) => collectHtmlFiles(resolve(__dirname, directory)))
];

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-seo-tags',
      transformIndexHtml(html, ctx) {
        const pathname = toCanonicalPath(ctx.filename, ctx.path);
        const canonicalPath = canonicalPathOverrides[pathname] ?? pathname;
        const absoluteUrl = buildAbsoluteUrl(canonicalSiteUrl, canonicalPath);
        const rawTitle = extractTagContent(html, /<title>([\s\S]*?)<\/title>/i) || 'Liutongxue';
        const rawDescription = extractTagContent(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
        const seoMeta = resolveSeoMetadata(canonicalPath, rawTitle, rawDescription);
        const socialImageUrl = buildAbsoluteUrl(canonicalSiteUrl, defaultSocialImagePath);
        const socialImageAlt = `Liutongxue 分享图：${seoMeta.socialTitle}`;
        const htmlWithSnapshot = injectRootSnapshot(html, pathname);
        const htmlWithMetadata = applyHeadMetadata(htmlWithSnapshot, seoMeta.title, seoMeta.description);
        const hasCriticalSnapshot = htmlWithSnapshot !== html;
        const sceneDetailStructuredData = createSceneDetailStructuredData(
          canonicalPath,
          absoluteUrl,
          seoMeta.structuredDataTitle,
          seoMeta.description
        );
        const sceneCollectionItemListStructuredData = createSceneCollectionItemListStructuredData(canonicalPath);
        const breadcrumbStructuredData = createBreadcrumbStructuredData(canonicalPath, absoluteUrl, seoMeta.structuredDataTitle);
        const criticalPageFaqStructuredData =
          pathname === '/' ? null : createCriticalPageFaqStructuredData(pathname, absoluteUrl);

        return {
          html: htmlWithMetadata,
          tags: [
            ...(hasCriticalSnapshot
              ? [
                  {
                    tag: 'script',
                    children: 'document.documentElement.classList.add("js");',
                    injectTo: 'head-prepend' as const
                  },
                  {
                    tag: 'style',
                    children: criticalPageFallbackStyle,
                    injectTo: 'head' as const
                  }
                ]
              : []),
            {
              tag: 'link',
              attrs: {
                rel: 'canonical',
                href: absoluteUrl
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:site_name',
                content: 'Liutongxue'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:type',
                content: seoMeta.ogType
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:locale',
                content: 'zh_CN'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:title',
                content: seoMeta.title
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:description',
                content: seoMeta.description
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:url',
                content: absoluteUrl
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image',
                content: socialImageUrl
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:secure_url',
                content: socialImageUrl
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:type',
                content: 'image/png'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:width',
                content: '1200'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:height',
                content: '630'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                property: 'og:image:alt',
                content: socialImageAlt
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'twitter:card',
                content: 'summary_large_image'
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'twitter:title',
                content: seoMeta.title
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'twitter:description',
                content: seoMeta.description
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'twitter:image',
                content: socialImageUrl
              },
              injectTo: 'head'
            },
            {
              tag: 'meta',
              attrs: {
                name: 'twitter:image:alt',
                content: socialImageAlt
              },
              injectTo: 'head'
            },
            ...(seoMeta.ogType === 'article'
              ? [
                  {
                    tag: 'meta',
                    attrs: {
                      property: 'article:published_time',
                      content: seoMeta.publishedTime
                    },
                    injectTo: 'head' as const
                  },
                  {
                    tag: 'meta',
                    attrs: {
                      property: 'article:modified_time',
                      content: seoMeta.modifiedTime
                    },
                    injectTo: 'head' as const
                  },
                  {
                    tag: 'meta',
                    attrs: {
                      property: 'article:section',
                      content: seoMeta.articleSection
                    },
                    injectTo: 'head' as const
                  }
                ]
              : []),
            ...(isNonCanonicalBuild
              ? [
                  {
                    tag: 'meta',
                    attrs: {
                      name: 'robots',
                      content: 'noindex, nofollow, noarchive'
                    },
                    injectTo: 'head' as const
                  },
                  {
                    tag: 'meta',
                    attrs: {
                      name: 'googlebot',
                      content: 'noindex, nofollow, noarchive'
                    },
                    injectTo: 'head' as const
                  }
                ]
              : []),
            ...(sceneDetailStructuredData
              ? [
                  {
                    tag: 'script',
                    attrs: {
                      type: 'application/ld+json'
                    },
                    children: JSON.stringify(sceneDetailStructuredData, null, 2),
                    injectTo: 'head' as const
                  }
                ]
              : []),
            ...(sceneCollectionItemListStructuredData
              ? [
                  {
                    tag: 'script',
                    attrs: {
                      type: 'application/ld+json'
                    },
                    children: JSON.stringify(sceneCollectionItemListStructuredData, null, 2),
                    injectTo: 'head' as const
                  }
                ]
              : []),
            ...(breadcrumbStructuredData
              ? [
                  {
                    tag: 'script',
                    attrs: {
                      type: 'application/ld+json'
                    },
                    children: JSON.stringify(breadcrumbStructuredData, null, 2),
                    injectTo: 'head' as const
                  }
                ]
              : []),
            ...(criticalPageFaqStructuredData
              ? [
                  {
                    tag: 'script',
                    attrs: {
                      type: 'application/ld+json'
                    },
                    children: JSON.stringify(criticalPageFaqStructuredData, null, 2),
                    injectTo: 'head' as const
                  }
                ]
              : [])
          ]
        };
      }
    }
  ],
  base: '/',
  build: {
    rollupOptions: {
      input: htmlInputs
    }
  }
});
