import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, relative, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const siteUrl = (process.env.VITE_SITE_URL || 'https://www.liutongxue.com.cn').replace(/\/+$/, '');

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
console.log('- 关键入口文件、src/site.ts 声明路由、sitemap 与实际落地路由一致');
