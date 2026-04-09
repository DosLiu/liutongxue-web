export type SearchIntent = 'official' | 'current' | 'comparison' | 'general';
export type SearchTrustLevel = 'official' | 'trusted' | 'reference' | 'unknown';
export type SearchProvider = 'bing-cn' | 'baidu';

export type SearchResultItem = {
  title: string;
  url: string;
  snippet: string;
  provider: SearchProvider;
  position: number;
  hostname: string;
  trustLevel: SearchTrustLevel;
};

export const SEARCH_POLICY_VERSION = 'v1-stable';

export const SEARCH_POLICY = {
  topK: 5,
  providerTimeoutMs: 6000,
  blockedHosts: [
    'm.baidu.com',
    'zhidao.baidu.com',
    'wenku.baidu.com',
    'tieba.baidu.com',
    'news.baidu.com',
    'b2b.baidu.com'
  ],
  trustedHosts: [
    'github.com',
    'docs.github.com',
    'npmjs.com',
    'pypi.org',
    'developer.mozilla.org',
    'stackoverflow.com',
    'stackexchange.com',
    'docs.docker.com',
    'nodejs.org',
    'react.dev',
    'vite.dev',
    'tailwindcss.com',
    'vercel.com',
    'nextjs.org',
    'developer.chrome.com',
    'openai.com',
    'platform.openai.com'
  ],
  referenceHosts: [
    'zhihu.com',
    'juejin.cn',
    'infoq.cn',
    '36kr.com',
    'sspai.com',
    'theverge.com',
    'techcrunch.com'
  ],
  triggerPatterns: {
    current: /(今天|今日|昨天|最近|最新|刚刚|现在|目前|本周|今年|此刻|新闻|消息|动态|公告|发布|上线|市值|股价|融资|收购|价格|现状|趋势|发生了什么)/,
    official: /(官网|官方|文档|api|sdk|参数|安装|接入|教程|仓库|github|说明|版本|更新日志|release|changelog|pricing|price|pricing page)/i,
    comparison: /(对比|哪个好|哪家|谁在做|谁更强|有没有|是否已经|排名|评价|评测|推荐|方案|选型|值得买吗)/,
    disabled: /(https?:\/\/|www\.)/i
  },
  poorQualityPatterns: {
    title: /(广告|推广|合集|大全|免费下载|破解版|镜像下载|高速下载)/i,
    snippet: /(备用网址|网盘|镜像下载|绿色版|破解版|安装包|高速下载)/i
  }
} as const;

const normalizeHost = (value: string) => value.toLowerCase().replace(/^www\./, '');

const endsWithHost = (hostname: string, targets: readonly string[]) => {
  const normalized = normalizeHost(hostname);
  return targets.some((target) => normalized === target || normalized.endsWith(`.${target}`));
};

const looksOfficialByHostname = (hostname: string) => {
  const normalized = normalizeHost(hostname);
  const firstLabel = normalized.split('.')[0] || '';
  return ['docs', 'developer', 'developers', 'help', 'support', 'api'].includes(firstLabel);
};

const looksOfficialByText = (value: string) =>
  /(官网|官方|官方文档|官方博客|开发者文档|api reference|developer documentation|release notes|changelog|quickstart|getting started)/i.test(
    value
  );

export const normalizeQuery = (query: string) => query.trim().replace(/\s+/g, ' ');

export const detectSearchIntent = (query: string): SearchIntent | null => {
  const normalized = normalizeQuery(query);
  if (!normalized || normalized.length <= 6) return null;
  if (SEARCH_POLICY.triggerPatterns.disabled.test(normalized)) return null;
  if (SEARCH_POLICY.triggerPatterns.official.test(normalized)) return 'official';
  if (SEARCH_POLICY.triggerPatterns.current.test(normalized)) return 'current';
  if (SEARCH_POLICY.triggerPatterns.comparison.test(normalized)) return 'comparison';
  return null;
};

export const buildFallbackQueries = (query: string, intent: SearchIntent) => {
  const normalized = normalizeQuery(query);
  const compact = normalized
    .replace(/(请问|帮我|麻烦|一下|现在|目前|最新的|最近的|给我|看看|到底|有没有|一下子)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const variants = [normalized];

  if (compact && compact !== normalized) {
    variants.push(compact);
  }

  if (intent === 'official') {
    variants.push(`${compact || normalized} 官方文档`);
  }

  if (intent === 'current') {
    variants.push(`${compact || normalized} 最新公告`);
  }

  if (intent === 'comparison') {
    variants.push(`${compact || normalized} 对比`);
  }

  return [...new Set(variants.filter(Boolean))];
};

export const classifyTrustLevel = ({
  hostname,
  title,
  snippet
}: {
  hostname: string;
  title: string;
  snippet: string;
}): SearchTrustLevel => {
  const normalized = normalizeHost(hostname);
  const combined = `${title} ${snippet}`;

  if (!normalized) return 'unknown';

  if (looksOfficialByHostname(normalized) || looksOfficialByText(combined)) {
    return 'official';
  }

  if (endsWithHost(normalized, SEARCH_POLICY.trustedHosts)) {
    return 'trusted';
  }

  if (endsWithHost(normalized, SEARCH_POLICY.referenceHosts)) {
    return 'reference';
  }

  return 'unknown';
};

export const isBlockedResult = ({
  hostname,
  title,
  snippet
}: {
  hostname: string;
  title: string;
  snippet: string;
}) => {
  const normalized = normalizeHost(hostname);
  if (!normalized) return true;
  if (endsWithHost(normalized, SEARCH_POLICY.blockedHosts)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.title.test(title)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.snippet.test(snippet)) return true;
  return false;
};

export const shouldAllowUnknownHosts = (intent: SearchIntent, relaxed: boolean) => {
  if (!relaxed) return false;
  return intent === 'comparison' || intent === 'general';
};
