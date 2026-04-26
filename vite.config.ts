import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  createCriticalPageFaqStructuredData,
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
const stripSitePrefix = (title: string) => title.replace(/^Liutongxue\s*·\s*/, '').trim();

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

const createSceneDetailStructuredData = (pathname: string, absoluteUrl: string, title: string, description: string) => {
  const match = pathname.match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);
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
        const title = extractTagContent(html, /<title>([\s\S]*?)<\/title>/i) || 'Liutongxue';
        const description = extractTagContent(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);
        const sceneDetailStructuredData = createSceneDetailStructuredData(canonicalPath, absoluteUrl, title, description);
        const criticalPageFaqStructuredData =
          pathname === '/' ? null : createCriticalPageFaqStructuredData(pathname, absoluteUrl);
        const htmlWithSnapshot = injectRootSnapshot(html, pathname);
        const hasCriticalSnapshot = htmlWithSnapshot !== html;

        return {
          html: htmlWithSnapshot,
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
                content: 'website'
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
                content: title
              },
              injectTo: 'head'
            },
            ...(description
              ? [
                  {
                    tag: 'meta',
                    attrs: {
                      property: 'og:description',
                      content: description
                    },
                    injectTo: 'head' as const
                  }
                ]
              : []),
            {
              tag: 'meta',
              attrs: {
                property: 'og:url',
                content: absoluteUrl
              },
              injectTo: 'head'
            },
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
