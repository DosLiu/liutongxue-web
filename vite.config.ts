import { readdirSync } from 'node:fs';
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
      input: htmlInputs
    }
  }
});
