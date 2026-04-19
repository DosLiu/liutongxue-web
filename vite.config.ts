import { relative, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

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

const siteUrl = trimTrailingSlash(process.env.VITE_SITE_URL || 'https://www.liutongxue.com.cn');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-seo-tags',
      transformIndexHtml(html, ctx) {
        const pathname = toCanonicalPath(ctx.filename, ctx.path);
        const absoluteUrl = buildAbsoluteUrl(siteUrl, pathname);
        const title = extractTagContent(html, /<title>([\s\S]*?)<\/title>/i) || 'Liutongxue';
        const description = extractTagContent(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i);

        return {
          html,
          tags: [
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
            }
          ]
        };
      }
    }
  ],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tools: resolve(__dirname, 'tools/index.html'),
        figures: resolve(__dirname, 'figures/index.html'),
        figuresSteveJobs: resolve(__dirname, 'figures/steve-jobs/index.html'),
        figuresElonMusk: resolve(__dirname, 'figures/elon-musk/index.html'),
        figuresZhangYiming: resolve(__dirname, 'figures/zhang-yiming/index.html'),
        scene: resolve(__dirname, 'scene/index.html'),
        sceneDigitalResident: resolve(__dirname, 'scene/digital-resident/index.html'),
        sceneDigitalResident20260321: resolve(__dirname, 'scene/digital-resident/2026-03-21/index.html'),
        sceneDigitalResident20260322: resolve(__dirname, 'scene/digital-resident/2026-03-22/index.html'),
        sceneDigitalResident20260324: resolve(__dirname, 'scene/digital-resident/2026-03-24/index.html'),
        sceneDigitalResident20260326: resolve(__dirname, 'scene/digital-resident/2026-03-26/index.html'),
        sceneDigitalResident20260327: resolve(__dirname, 'scene/digital-resident/2026-03-27/index.html'),
        sceneBlogOps: resolve(__dirname, 'scene/blog-ops/index.html'),
        sceneBlogOps20260313: resolve(__dirname, 'scene/blog-ops/2026-03-13/index.html'),
        sceneBlogOps20260318: resolve(__dirname, 'scene/blog-ops/2026-03-18/index.html'),
        sceneBlogOps20260325: resolve(__dirname, 'scene/blog-ops/2026-03-25/index.html'),
        sceneBlogOps20260401: resolve(__dirname, 'scene/blog-ops/2026-04-01/index.html'),
        sceneSiteOps: resolve(__dirname, 'scene/site-ops/index.html'),
        sceneSiteOps20260401: resolve(__dirname, 'scene/site-ops/2026-04-01/index.html'),
        sceneSiteOps20260402: resolve(__dirname, 'scene/site-ops/2026-04-02/index.html'),
        sceneSiteOps20260403: resolve(__dirname, 'scene/site-ops/2026-04-03/index.html'),
        sceneSiteOps20260404: resolve(__dirname, 'scene/site-ops/2026-04-04/index.html')
      }
    }
  }
});
