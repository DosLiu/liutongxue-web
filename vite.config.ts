import { readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  createCriticalPageBreadcrumbStructuredData,
  createCriticalPageFaqStructuredData,
  createCriticalPagePrimaryStructuredData,
  criticalPageFallbackStyle,
  renderCriticalPageSnapshot,
  resolveCriticalPageSeoMetadata
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

const buildAbsoluteUrl = (siteUrl: string, pathname: string) => (pathname === '/' ? `${siteUrl}/` : `${siteUrl}${pathname}`);

const extractTagContent = (html: string, pattern: RegExp) => html.match(pattern)?.[1]?.trim() || '';
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
const defaultSocialImagePath = '/og/liutongxue-share.png';

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
        const seoMeta = resolveCriticalPageSeoMetadata(canonicalPath, rawTitle, rawDescription);
        const socialImageUrl = buildAbsoluteUrl(canonicalSiteUrl, defaultSocialImagePath);
        const socialImageAlt = `Liutongxue 分享图：${seoMeta.socialTitle}`;
        const htmlWithSnapshot = injectRootSnapshot(html, pathname);
        const htmlWithMetadata = applyHeadMetadata(htmlWithSnapshot, seoMeta.title, seoMeta.description);
        const hasCriticalSnapshot = htmlWithSnapshot !== html;
        const primaryStructuredData = createCriticalPagePrimaryStructuredData(canonicalPath, absoluteUrl, canonicalSiteUrl);
        const breadcrumbStructuredData = createCriticalPageBreadcrumbStructuredData(canonicalPath, absoluteUrl, canonicalSiteUrl);
        const criticalPageFaqStructuredData = createCriticalPageFaqStructuredData(canonicalPath, absoluteUrl);

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
            ...(primaryStructuredData
              ? [
                  {
                    tag: 'script',
                    attrs: {
                      type: 'application/ld+json'
                    },
                    children: JSON.stringify(primaryStructuredData, null, 2),
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
