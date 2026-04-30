import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, relative, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const siteUrl = (process.env.VITE_SITE_URL || 'https://www.liutongxue.com.cn').replace(/\/+$/, '');
const canonicalSiteUrl = (process.env.VITE_CANONICAL_SITE_URL || 'https://www.liutongxue.com.cn').replace(/\/+$/, '');
const isNonCanonicalBuild = siteUrl !== canonicalSiteUrl;

const requiredEntries = [
  'index.html',
  'figures/index.html',
  'figures/steve-jobs/index.html',
  'figures/elon-musk/index.html',
  'figures/zhang-yiming/index.html',
  'scene/index.html',
  'scene/blog-ops/index.html',
  'scene/digital-resident/index.html',
  'scene/site-ops/index.html'
];

const collectIndexHtmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return collectIndexHtmlFiles(entryPath);
      }
      return entry.isFile() && entry.name === 'index.html' ? [entryPath] : [];
    })
    .sort();

const toRoute = (absoluteFilePath) => {
  const relativePath = relative(repoRoot, absoluteFilePath).replace(/\\/g, '/');

  if (relativePath === 'index.html') {
    return '/';
  }

  return `/${relativePath.slice(0, -'index.html'.length)}`;
};

const normalizeRoute = (route) => {
  if (!route || route === '/') return '/';
  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const formatRouteList = (routes) => routes.map((route) => `  - ${route}`).join('\n');
const buildAbsoluteUrl = (route) => (route === '/' ? `${canonicalSiteUrl}/` : `${canonicalSiteUrl}${route}`);
const readUtf8IfExists = (filePath) => (existsSync(filePath) ? readFileSync(filePath, 'utf8') : '');

const actualRoutes = new Set([
  '/',
  ...['figures', 'scene'].flatMap((directory) => collectIndexHtmlFiles(resolve(repoRoot, directory)).map(toRoute))
]);

const sitePathsSource = readFileSync(resolve(repoRoot, 'src/site.ts'), 'utf8');
const declaredRoutes = new Set(['/']);

for (const match of sitePathsSource.matchAll(/\$\{baseUrl\}([^`]+)`/g)) {
  declaredRoutes.add(normalizeRoute(match[1]));
}

const sitemapSource = readFileSync(resolve(repoRoot, 'public/sitemap.xml'), 'utf8');
const sitemapRoutes = new Set();

for (const match of sitemapSource.matchAll(/<loc>(.*?)<\/loc>/g)) {
  const location = match[1]?.trim();
  if (!location) continue;

  const route = location.startsWith('http://') || location.startsWith('https://')
    ? normalizeRoute(new URL(location).pathname)
    : normalizeRoute(location.replace(siteUrl, ''));

  sitemapRoutes.add(route);
}

const missingEntries = requiredEntries.filter((entry) => !existsSync(resolve(repoRoot, entry)));
const missingDeclaredRoutes = [...declaredRoutes].filter((route) => !actualRoutes.has(route)).sort();
const missingSitemapRoutes = [...actualRoutes].filter((route) => !sitemapRoutes.has(route)).sort();
const extraSitemapRoutes = [...sitemapRoutes].filter((route) => !actualRoutes.has(route)).sort();
const vercelConfig = JSON.parse(readFileSync(resolve(repoRoot, 'vercel.json'), 'utf8'));
const vercelRedirects = Array.isArray(vercelConfig.redirects) ? vercelConfig.redirects : [];
const vercelHeaders = Array.isArray(vercelConfig.headers) ? vercelConfig.headers : [];

const danglingSceneDirectories = [];
for (const collection of readdirSync(resolve(repoRoot, 'scene'), { withFileTypes: true })) {
  if (!collection.isDirectory()) continue;
  const collectionPath = resolve(repoRoot, 'scene', collection.name);

  for (const entry of readdirSync(collectionPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexPath = resolve(collectionPath, entry.name, 'index.html');
    if (!existsSync(indexPath)) {
      danglingSceneDirectories.push(`scene/${collection.name}/${entry.name}/`);
    }
  }
}

danglingSceneDirectories.sort();

const failures = [];

const hasToolsRedirect = vercelRedirects.some((rule) => {
  const source = typeof rule?.source === 'string' ? rule.source : '';
  const destination = typeof rule?.destination === 'string' ? rule.destination : '';
  const statusCode = rule?.statusCode;
  const permanent = rule?.permanent;

  return source.startsWith('/tools') && destination === '/scene/' && (permanent === true || statusCode === 308 || statusCode === 301);
});

if (!hasToolsRedirect) {
  failures.push('vercel.json 缺少 /tools -> /scene/ 的永久重定向规则。');
}

const hasTestNoindexHeader = vercelHeaders.some((rule) => {
  const hostMatches =
    Array.isArray(rule?.has) &&
    rule.has.some((item) => item?.type === 'host' && typeof item?.value === 'string' && item.value.includes('test.liutongxue.com.cn'));
  const xRobotsHeader =
    Array.isArray(rule?.headers) &&
    rule.headers.some(
      (header) =>
        typeof header?.key === 'string' &&
        header.key.toLowerCase() === 'x-robots-tag' &&
        typeof header?.value === 'string' &&
        /noindex/i.test(header.value)
    );

  return hostMatches && xRobotsHeader;
});

if (!hasTestNoindexHeader) {
  failures.push('vercel.json 缺少面向 test.liutongxue.com.cn 的 X-Robots-Tag noindex 头。');
}

const apiChatSource = readFileSync(resolve(repoRoot, 'api/chat.ts'), 'utf8');
if (/from\s+['"]\.\.\/src\//.test(apiChatSource)) {
  failures.push("api/chat.ts 不应直接依赖 ../src/*，否则线上 serverless 运行时容易再次加载失败。");
}

let apiHealthCheckSummary = null;
let apiDirectReplySummary = null;
let authCallbackSummary = null;

const createMockApiResponse = () => {
  const apiResponse = { statusCode: 200, headers: {}, payload: null, ended: false };
  const res = {
    setHeader(name, value) {
      apiResponse.headers[name] = value;
    },
    status(code) {
      apiResponse.statusCode = code;
      return this;
    },
    json(payload) {
      apiResponse.payload = payload;
    },
    end() {
      apiResponse.ended = true;
    }
  };

  return { apiResponse, res };
};

try {
  const { default: chatHandler } = await import(resolve(repoRoot, 'api/chat.ts'));
  const { getAuthConfig } = await import(resolve(repoRoot, 'api/_lib/auth.js'));

  {
    const { apiResponse, res } = createMockApiResponse();
    await chatHandler({ method: 'GET', headers: { origin: siteUrl } }, res);

    const allowOrigin = apiResponse.headers['Access-Control-Allow-Origin'];
    const payload = apiResponse.payload;
    const expectedAllowOrigins = new Set([siteUrl, canonicalSiteUrl]);
    const hasValidPayload =
      payload &&
      typeof payload === 'object' &&
      typeof payload.reply === 'string' &&
      ['api', 'mock'].includes(payload.mode) &&
      ['api', 'mock'].includes(payload.status);

    if (apiResponse.statusCode !== 200 || !expectedAllowOrigins.has(allowOrigin) || !hasValidPayload) {
      failures.push(`api/chat 健康检查异常:\n${JSON.stringify(apiResponse, null, 2)}`);
    } else {
      apiHealthCheckSummary = `api/chat health ok (${payload.status})`;
    }
  }

  {
    const previousOpenAiApiKey = process.env.OPENAI_API_KEY;

    try {
      process.env.OPENAI_API_KEY = 'smoke-test-key';
      const { apiResponse, res } = createMockApiResponse();

      await chatHandler(
        {
          method: 'POST',
          headers: { origin: siteUrl },
          body: JSON.stringify({
            figureId: 'elon-musk',
            messages: [{ role: 'user', content: 'AI Agent赛道这么热，谁会赢？' }]
          })
        },
        res
      );

      const payload = apiResponse.payload;
      const isDirectReplyAligned =
        apiResponse.statusCode === 200 &&
        payload &&
        typeof payload.reply === 'string' &&
        payload.reply.length > 0 &&
        payload.mode === 'mock' &&
        payload.status === 'mock' &&
        payload.shouldConsume === false;

      if (!isDirectReplyAligned) {
        failures.push(`api/chat 直出规则口径异常:\n${JSON.stringify(apiResponse, null, 2)}`);
      } else {
        apiDirectReplySummary = 'api/chat direct reply ok (mode/status/mock + no consume)';
      }
    } finally {
      if (previousOpenAiApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousOpenAiApiKey;
      }
    }
  }

  {
    const envExampleSource = readFileSync(resolve(repoRoot, '.env.example'), 'utf8');
    const previousCallbackUrl = process.env.DAEN_AUTH_CALLBACK_URL;

    try {
      process.env.DAEN_AUTH_CALLBACK_URL = 'https://www.liutongxue.com.cn/api/daen?route=callback';
      const callbackUrl = getAuthConfig().callbackUrl;
      const usesCanonicalPathInExample =
        envExampleSource.includes('/api/auth/callback') && !envExampleSource.includes('/api/daen?route=callback');

      if (callbackUrl !== 'https://www.liutongxue.com.cn/api/auth/callback' || !usesCanonicalPathInExample) {
        failures.push(
          `auth callback 归一化异常:\n${JSON.stringify({ callbackUrl, usesCanonicalPathInExample }, null, 2)}`
        );
      } else {
        authCallbackSummary = 'auth callback ok (/api/auth/callback locked)';
      }
    } finally {
      if (previousCallbackUrl === undefined) {
        delete process.env.DAEN_AUTH_CALLBACK_URL;
      } else {
        process.env.DAEN_AUTH_CALLBACK_URL = previousCallbackUrl;
      }
    }
  }
} catch (error) {
  failures.push(`api/chat 模块加载失败:\n${error instanceof Error ? error.stack || error.message : String(error)}`);
}

if (missingEntries.length) {
  failures.push(`缺少关键入口文件:\n${formatRouteList(missingEntries)}`);
}

if (missingDeclaredRoutes.length) {
  failures.push(`src/site.ts 中声明但仓库中不存在的路由:\n${formatRouteList(missingDeclaredRoutes)}`);
}

if (missingSitemapRoutes.length) {
  failures.push(`sitemap 缺少的真实路由:\n${formatRouteList(missingSitemapRoutes)}`);
}

if (extraSitemapRoutes.length) {
  failures.push(`sitemap 中存在但仓库中没有落地入口的路由:\n${formatRouteList(extraSitemapRoutes)}`);
}

if (danglingSceneDirectories.length) {
  failures.push(`存在未落地 index.html 的 scene 目录:\n${formatRouteList(danglingSceneDirectories)}`);
}

const distToolsIndexPath = resolve(repoRoot, 'dist/tools/index.html');
if (existsSync(distToolsIndexPath)) {
  failures.push('dist/tools/index.html 仍然存在，/tools/ 仍可能以 200 页面落地。');
}

if (isNonCanonicalBuild) {
  for (const entry of requiredEntries) {
    const filePath = resolve(repoRoot, 'dist', entry);
    const route = entry === 'index.html' ? '/' : `/${entry.slice(0, -'index.html'.length)}`;
    const expectedCanonical = buildAbsoluteUrl(route);
    const html = readUtf8IfExists(filePath);

    if (!html) {
      failures.push(`非 canonical 构建缺少产物: ${entry}`);
      continue;
    }

    if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) {
      failures.push(`非 canonical 构建 canonical 未指向正式域名: ${entry} -> ${expectedCanonical}`);
    }

    if (!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) {
      failures.push(`非 canonical 构建缺少 robots noindex: ${entry}`);
    }

    if (!/<meta[^>]+name="googlebot"[^>]+content="[^"]*noindex/i.test(html)) {
      failures.push(`非 canonical 构建缺少 googlebot noindex: ${entry}`);
    }

    if (!/<meta[^>]+name="bingbot"[^>]+content="[^"]*noindex/i.test(html)) {
      failures.push(`非 canonical 构建缺少 bingbot noindex: ${entry}`);
    }
  }
}

if (failures.length) {
  console.error('Smoke check failed.\n');
  console.error(failures.join('\n\n'));
  process.exit(1);
}

const totalHtmlRoutes = actualRoutes.size;
const sceneDetailCount = [...actualRoutes].filter((route) => /^\/scene\/[^/]+\/\d{4}-\d{2}-\d{2}\/$/.test(route)).length;

console.log(`Smoke check passed: ${totalHtmlRoutes} 个入口路由已校验。`);
console.log(`- scene 明细页: ${sceneDetailCount}`);
console.log(`- sitemap URL: ${sitemapRoutes.size}`);
console.log(`- ${apiHealthCheckSummary}`);
console.log(`- ${apiDirectReplySummary}`);
console.log(`- ${authCallbackSummary}`);
console.log('- 关键入口文件、src/site.ts 声明路由、sitemap 与实际落地路由一致');
