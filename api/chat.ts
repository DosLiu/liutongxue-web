const JOBS_SYSTEM_PROMPT = `此模式激活后，直接以 Steve Jobs 的身份回应。

用“我”，不用“乔布斯会认为”。不要跳出角色做 meta 分析，除非用户明确要求退出角色。
你不是通用助手。你不是温和顾问。你是一个会直接说“amazing”或“shit”的产品判断者。

角色规则：
1. 第一反应先下判断，不铺垫。
2. 直接说人话，短句，少从句，少解释。
3. 遇到愚蠢、发散、模糊的问题，可以直接重构问题。不要顺着用户的错误前提回答。
4. 不要假装你看过一个你没看过的产品、页面或数据。
5. 如果问题依赖具体事实，而你手里没有事实，就直接说信息不够，并要求用户给链接、截图、页面文案、流程或真实使用场景。

回答工作流：
Step 1：先判断问题类型。
- 纯框架问题：直接回答。
- 事实问题：如果信息不足，先索要事实，不准编。
- 混合问题：先拿到必要事实，再下判断。

Step 2：始终先做减法。
先问：该砍什么？什么是多余的？哪个复杂环节正在毁掉体验？

Step 3：始终检查端到端控制。
哪个关键环节必须抓在自己手里？如果关键体验交给别人控制，体验一定会打折。

Step 4：始终检查价值闭环。
这件事有没有直接改善获客、成交或交付？如果没有，它大概率不是现在最重要的问题。

表达 DNA：
1. 先给 headline（一句话判断），再展开。
2. 默认只讲三点。不是五点，不是八点。三点够了。
3. 用二元判断系统：amazing 或 shit。不要写成“还可以”“有待优化”“比较不错”。
4. 可以尖锐，但不要装腔作势。
5. 可以用类比，但类比必须具体，不要空。
6. 没有“也许”“可能”“看情况”“因人而异”这种软话。你可以承认不知道，但不能含糊。
7. 不要写 Markdown。禁止出现 ###、**、\`代码块\`、表格。
8. 除非用户明确要求展开，否则单次回复控制在 4 到 8 句。
9. 面向 30-50 岁的小老板，避免堆技术术语；必须用术语时，后面补中文解释。

默认输出格式：
- 第一句：一句判断。
- 中间：一到三条最关键的理由。
- 最后一句：一个尖锐追问，或者一个明确下一步。

当你判断一个产品、页面、网站、AI 方案时，优先用这三把刀：
- 这件事有没有直接改善获客、成交或交付？
- 最该砍掉的复杂性是什么？
- 哪个关键环节必须自己控制，不能交给别人？

当系统提供了外部检索结果时：
- 把结果当事实参考，不要机械复述。
- 优先采用官网、官方文档、官方 pricing、官方公告里的事实。
- 先判断，再引用最关键的一两条事实。
- 如果结果互相矛盾，直接指出冲突，不要装作确定。
`;

const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `This is not a good question. 问题太散了。\n\n我不先谈工具，我先谈判断。\n如果这件事不能直接影响获客、成交或交付，它就不该排第一。\n\n你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。\n把它重写成一句话：用户到底卡在哪一步？你准备先砍掉什么？`;
};

type IncomingMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
};

type SearchIntent = 'official' | 'current' | 'comparison' | 'general';
type SearchTrustLevel = 'official' | 'trusted' | 'reference' | 'unknown';
type SearchProvider = 'bing-cn' | 'baidu' | 'seed';

type SearchResultItem = {
  title: string;
  url: string;
  snippet: string;
  provider: SearchProvider;
  position: number;
  hostname: string;
  trustLevel: SearchTrustLevel;
};

type RawSearchResultItem = {
  title: string;
  url: string;
  snippet: string;
  provider: SearchProvider;
  position: number;
};

type SearchAttempt = {
  query: string;
  relaxed: boolean;
  providerPreference: 'bing-first' | 'baidu-first';
};

type SearchRouteDecision = {
  source: 'llm' | 'rules';
  needSearch: boolean;
  intent: SearchIntent | 'none';
  searchQueries: string[];
  rationale?: string;
};

type SearchDebugInfo = {
  requestId: string;
  enabled: boolean;
  routeSource?: 'llm' | 'rules';
  routeNeedSearch?: boolean;
  routeQueries?: string[];
  triggered: boolean;
  intent: SearchIntent | 'none';
  hit: boolean;
  officialCoverageEntities?: string[];
  guardReason?: string;
  attempts: Array<{
    query: string;
    relaxed: boolean;
    providerPreference: 'bing-first' | 'baidu-first';
    seedCount: number;
    bingCount: number;
    baiduCount: number;
    rankedCount: number;
    topHosts: string[];
    officialCoverageEntities: string[];
  }>;
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://dosliu.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const SEARCH_POLICY = {
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
    'platform.openai.com',
    'anthropic.com',
    'docs.anthropic.com',
    'console.anthropic.com',
    'cloud.google.com',
    'ai.google.dev',
    'learn.microsoft.com',
    'azure.microsoft.com',
    'aws.amazon.com',
    'docs.aws.amazon.com'
  ],
  referenceHosts: [
    'zhihu.com',
    'juejin.cn',
    'infoq.cn',
    '36kr.com',
    'sspai.com',
    'theverge.com',
    'techcrunch.com',
    'huggingface.co'
  ],
  triggerPatterns: {
    current: /(今天|今日|昨天|最近|最新|刚刚|现在|目前|本周|今年|此刻|新闻|消息|动态|公告|发布|上线|市值|股价|融资|收购|价格|定价|费用|成本|现状|趋势|发生了什么)/,
    official: /(官网|官方|文档|api|sdk|参数|安装|接入|教程|仓库|github|说明|版本|更新日志|release|changelog|pricing|price|pricing page|docs|documentation)/i,
    comparison: /(对比|哪个好|哪家|谁在做|谁更强|有没有|是否已经|排名|评价|评测|推荐|方案|选型|值得买吗|适合|怎么选|区别|差异|vs|versus|相比)/i,
    decision: /(企业|客服|客服系统|客服机器人|部署|稳定性|延迟|响应速度|预算|token|模型|能力|上下文|合规|安全|集成|工作流|automation|agent)/i,
    disabled: /(https?:\/\/|www\.)/i
  },
  poorQualityPatterns: {
    title: /(广告|推广|合集|大全|免费下载|破解版|镜像下载|高速下载|备用网址)/i,
    snippet: /(备用网址|网盘|镜像下载|绿色版|破解版|安装包|高速下载)/i
  }
} as const;

const QUERY_STOP_WORDS = new Set([
  '现在',
  '目前',
  '最近',
  '最新',
  '一下',
  '请问',
  '帮我',
  '看看',
  '这个',
  '那个',
  '什么',
  '如何',
  '怎么',
  '哪个',
  '谁',
  '更',
  '做',
  '企业',
  '客服',
  'api'
]);

const ENTITY_HINTS = [
  {
    id: 'openai',
    match: /(openai|gpt|chatgpt)/i,
    keywords: ['openai', 'gpt', 'chatgpt'],
    preferredHosts: ['openai.com', 'platform.openai.com'],
    officialSeedUrls: ['https://openai.com/api/pricing/', 'https://platform.openai.com/docs/overview']
  },
  {
    id: 'anthropic',
    match: /(claude|anthropic)/i,
    keywords: ['claude', 'anthropic'],
    preferredHosts: ['anthropic.com', 'docs.anthropic.com', 'console.anthropic.com'],
    officialSeedUrls: ['https://www.anthropic.com/pricing', 'https://docs.anthropic.com/en/docs/overview']
  },
  {
    id: 'google',
    match: /(gemini|google ai|google api)/i,
    keywords: ['gemini', 'google'],
    preferredHosts: ['ai.google.dev', 'cloud.google.com'],
    officialSeedUrls: ['https://ai.google.dev/gemini-api/docs', 'https://cloud.google.com/vertex-ai/generative-ai/docs']
  },
  {
    id: 'tailwind',
    match: /(tailwind)/i,
    keywords: ['tailwind'],
    preferredHosts: ['tailwindcss.com'],
    officialSeedUrls: ['https://tailwindcss.com/docs/installation', 'https://tailwindcss.com/docs']
  },
  {
    id: 'vercel-next',
    match: /(vercel|next\.js|nextjs)/i,
    keywords: ['vercel', 'nextjs', 'next.js'],
    preferredHosts: ['vercel.com', 'nextjs.org'],
    officialSeedUrls: ['https://vercel.com/docs', 'https://nextjs.org/docs']
  }
] as const;

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeHost = (value: string) => value.toLowerCase().replace(/^www\./, '');

const SEARCH_ENABLED = env.WEB_SEARCH_ENABLED !== '0';
const SEARCH_DEBUG_ENABLED = env.WEB_SEARCH_DEBUG !== '0';
const SEARCH_ROUTE_PROMPT = `你是搜索路由器。你的任务不是回答用户，而是判断当前问题是否需要联网检索。

输出必须是 JSON，不要输出任何额外文字。格式：
{"needSearch":boolean,"intent":"official|current|comparison|general|none","searchQueries":[string,string,string],"rationale":string}

判断规则：
1. 只要问题依赖最新事实、发布时间、发售状态、价格、参数、评测、真实产品信息、官网文档、API 文档、方案对比、型号比较，就应 needSearch=true。
2. 像“谁好用”“值不值得买”“怎么选”“使用体验如何”这类自然问法，只要对象是具体产品/品牌/模型，也通常 needSearch=true。
3. 纯主观、纯框架、纯价值观讨论，且不依赖外部事实时，needSearch=false。
4. 如果问题里出现多个具体对象做比较，intent 优先给 comparison。
5. searchQueries 要给 1 到 3 条最有搜索价值的 query，尽量短，保留核心实体。
6. 如果不需要搜索，intent 必须是 none，searchQueries 为空数组。`;
const SEARCH_TOP_K = Math.min(
  Math.max(Number.parseInt(env.WEB_SEARCH_TOP_K || String(SEARCH_POLICY.topK), 10) || SEARCH_POLICY.topK, 1),
  8
);

const decodeHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeUrl = (value: string) => {
  try {
    const url = new URL(value);
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'from', 'source'].forEach((key) => {
      url.searchParams.delete(key);
    });
    return trimTrailingSlash(url.toString());
  } catch {
    return value.trim();
  }
};

const getHostname = (value: string) => {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

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

const normalizeQuery = (query: string) => query.trim().replace(/\s+/g, ' ');

const extractJsonObject = (raw: string) => {
  const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return cleaned.slice(start, end + 1);
};

const hardDecideSearchRoute = (query: string): SearchRouteDecision | null => {
  const normalized = normalizeQuery(query);
  if (!normalized || normalized.length <= 6) {
    return { source: 'rules', needSearch: false, intent: 'none', searchQueries: [], rationale: 'too-short' };
  }

  if (SEARCH_POLICY.triggerPatterns.disabled.test(normalized)) {
    return { source: 'rules', needSearch: false, intent: 'none', searchQueries: [], rationale: 'has-url' };
  }

  return null;
};

const detectSearchIntent = (query: string): SearchIntent | null => {
  const normalized = normalizeQuery(query);
  if (!normalized || normalized.length <= 6) return null;
  if (SEARCH_POLICY.triggerPatterns.disabled.test(normalized)) return null;
  if (SEARCH_POLICY.triggerPatterns.official.test(normalized)) return 'official';
  if (SEARCH_POLICY.triggerPatterns.current.test(normalized)) return 'current';
  if (SEARCH_POLICY.triggerPatterns.comparison.test(normalized)) return 'comparison';
  if (SEARCH_POLICY.triggerPatterns.decision.test(normalized)) return 'general';
  return null;
};

const extractEntityHints = (query: string) => {
  const normalized = normalizeQuery(query);
  return ENTITY_HINTS.filter((item) => item.match.test(normalized));
};

const getMatchedEntityHints = (query: string) => extractEntityHints(query);

const getMatchedEntityIds = (query: string) => [...new Set(getMatchedEntityHints(query).map((item) => item.id))];

const getPreferredHostsForQuery = (query: string) =>
  [...new Set(getMatchedEntityHints(query).flatMap((item) => item.preferredHosts))];

const getOfficialSeedUrlsForQuery = (query: string) =>
  [...new Set(getMatchedEntityHints(query).flatMap((item) => item.officialSeedUrls))];

const getEntityKeywordsForQuery = (query: string) =>
  [...new Set(getMatchedEntityHints(query).flatMap((item) => item.keywords))];

const getOfficialCoverageEntities = (query: string, results: SearchResultItem[]) =>
  getMatchedEntityHints(query)
    .filter((entity) => results.some((item) => endsWithHost(item.hostname, entity.preferredHosts)))
    .map((entity) => entity.id);

const requiresOfficialEvidence = (query: string, intent: SearchIntent) =>
  getPreferredHostsForQuery(query).length > 0 &&
  (intent === 'official' || intent === 'current' || intent === 'comparison' || /价格|定价|成本|企业|客服|预算|合规/.test(query));

const requiresBalancedOfficialEvidence = (query: string, intent: SearchIntent) =>
  getMatchedEntityIds(query).length >= 2 &&
  (intent === 'comparison' || /适合|区别|差异|谁更|哪个好|怎么选|vs|versus|相比|企业|客服/.test(query));

const tokenizeQuery = (query: string) => {
  const normalized = normalizeQuery(query).toLowerCase();
  const englishTokens = normalized.match(/[a-z0-9.+-]{2,}/g) || [];
  const chineseTokens = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];

  return [...new Set([...englishTokens, ...chineseTokens])].filter((token) => !QUERY_STOP_WORDS.has(token));
};

const buildFallbackQueries = (query: string, intent: SearchIntent, preferredQueries: string[] = []) => {
  const preferred = preferredQueries.map((item) => normalizeQuery(item)).filter(Boolean);
  if (preferred.length >= 3) {
    return [...new Set(preferred)].slice(0, 3);
  }

  const normalized = normalizeQuery(query);
  const compact = normalized
    .replace(/(请问|帮我|麻烦|一下|现在|目前|最新的|最近的|给我|看看|到底|有没有|一下子)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const entityKeywords = getEntityKeywordsForQuery(normalized);
  const entityText = entityKeywords.join(' ');
  const variants = [...preferred, normalized];

  if (compact && compact !== normalized) {
    variants.push(compact);
  }

  if (intent === 'official') {
    variants.push(`${compact || normalized} 官方文档 官网 ${entityText}`.trim());
  }

  if (intent === 'current') {
    variants.push(`${compact || normalized} 官方 最新 公告 价格 ${entityText}`.trim());
  }

  if (intent === 'comparison') {
    variants.push(`${compact || normalized} API 定价 文档 价格 功能 ${entityText}`.trim());
  }

  if (intent === 'general') {
    variants.push(`${compact || normalized} 官方 文档 价格 能力 企业 ${entityText}`.trim());
  }

  if (/客服|企业|预算|成本|价格|定价/.test(normalized)) {
    variants.push(`${compact || normalized} pricing cost documentation enterprise`.trim());
  }

  return [...new Set(variants.filter(Boolean))];
};

const classifyTrustLevel = ({ hostname, title, snippet }: { hostname: string; title: string; snippet: string }): SearchTrustLevel => {
  const normalized = normalizeHost(hostname);
  const combined = `${title} ${snippet}`;

  if (!normalized) return 'unknown';
  if (looksOfficialByHostname(normalized) || looksOfficialByText(combined)) return 'official';
  if (endsWithHost(normalized, SEARCH_POLICY.trustedHosts)) return 'trusted';
  if (endsWithHost(normalized, SEARCH_POLICY.referenceHosts)) return 'reference';
  return 'unknown';
};

const isBlockedResult = ({
  hostname,
  title,
  snippet,
  query
}: {
  hostname: string;
  title: string;
  snippet: string;
  query: string;
}) => {
  const normalized = normalizeHost(hostname);
  const loweredQuery = normalizeQuery(query).toLowerCase();
  const combined = `${title} ${snippet}`.toLowerCase();

  if (!normalized) return true;
  if (endsWithHost(normalized, SEARCH_POLICY.blockedHosts)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.title.test(title)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.snippet.test(snippet)) return true;
  if (!/code|github|仓库|repo/i.test(loweredQuery) && /claude code|cursor|opencode/i.test(combined)) return true;
  if (!/github|仓库|repo/i.test(loweredQuery) && normalized === 'github.com' && !/sdk|api|docs|documentation/i.test(combined)) return true;
  return false;
};

const shouldAllowUnknownHosts = (intent: SearchIntent, relaxed: boolean) => {
  if (!relaxed) return false;
  return intent === 'comparison' || intent === 'general';
};

const scoreTrustLevel = (trustLevel: SearchTrustLevel) => {
  switch (trustLevel) {
    case 'official':
      return 300;
    case 'trusted':
      return 220;
    case 'reference':
      return 140;
    default:
      return 60;
  }
};

const scoreProvider = (provider: SearchProvider, providerPreference: SearchAttempt['providerPreference']) => {
  if (provider === 'seed') return 60;
  if (providerPreference === 'bing-first') {
    return provider === 'bing-cn' ? 40 : 20;
  }
  return provider === 'baidu' ? 40 : 20;
};

const getKeywordOverlapScore = (query: string, candidateText: string) => {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return 0;

  const haystack = candidateText.toLowerCase();
  const overlap = tokens.filter((token) => haystack.includes(token.toLowerCase())).length;
  return Math.min(overlap, 6) * 18;
};

const getPreferredHostScore = (query: string, hostname: string) => {
  const preferredHosts = getPreferredHostsForQuery(query);
  if (!preferredHosts.length) return 0;
  return endsWithHost(hostname, preferredHosts) ? 90 : 0;
};

const getEntityCoverageScore = (query: string, candidateText: string) => {
  const entityKeywords = getEntityKeywordsForQuery(query);
  if (!entityKeywords.length) return 0;

  const haystack = candidateText.toLowerCase();
  const matches = entityKeywords.filter((keyword) => haystack.includes(keyword.toLowerCase())).length;
  if (!matches) return -80;
  return Math.min(matches, 3) * 28;
};

const fetchText = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LiutongxueBot/1.0; +https://dosliu.github.io/liutongxue-web/)',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      signal: controller.signal
    });

    if (!response.ok) return '';
    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractPageMeta = (html: string) => {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);
  const ogDescriptionMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i);

  return {
    title: decodeHtml(titleMatch?.[1] || ''),
    snippet: decodeHtml(metaDescriptionMatch?.[1] || ogDescriptionMatch?.[1] || html.slice(0, 400))
  };
};

const fetchOfficialSeedResults = async (query: string) => {
  const urls = getOfficialSeedUrlsForQuery(query).slice(0, 4);
  if (!urls.length) return [] as RawSearchResultItem[];

  const pages = await Promise.all(
    urls.map(async (url, index) => {
      const html = await fetchText(url, SEARCH_POLICY.providerTimeoutMs);
      if (!html) return null;
      const meta = extractPageMeta(html);
      if (!meta.title) return null;

      return {
        title: meta.title,
        url: normalizeUrl(url),
        snippet: meta.snippet,
        provider: 'seed' as const,
        position: index + 1
      };
    })
  );

  return pages.filter((item): item is RawSearchResultItem => Boolean(item));
};

const extractBingResults = (xml: string) => {
  const results: RawSearchResultItem[] = [];
  const pattern = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g;

  for (const match of xml.matchAll(pattern)) {
    const title = decodeHtml(match[1] || '');
    const url = normalizeUrl(decodeHtml(match[2] || ''));
    const snippet = decodeHtml(match[3] || '');

    if (!title || !url) continue;

    results.push({ title, url, snippet, provider: 'bing-cn', position: results.length + 1 });
    if (results.length >= 8) break;
  }

  return results;
};

const searchWithBingCn = async (query: string) => {
  const xml = await fetchText(
    `https://cn.bing.com/search?format=rss&q=${encodeURIComponent(query)}&setlang=zh-Hans&ensearch=0`,
    SEARCH_POLICY.providerTimeoutMs
  );

  if (!xml) return [];
  return extractBingResults(xml);
};

const extractBaiduResults = (html: string) => {
  const results: RawSearchResultItem[] = [];
  const pattern = /<div[^>]+mu="([^"]+)"[\s\S]{0,2200}?<h3[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]{0,1800}?(?:<div[^>]+class="[^"]*(?:c-abstract|content-right_8Zs40|content-right_[^"]*)[^"]*"[^>]*>([\s\S]*?)<\/div>|<span[^>]+class="[^"]*(?:c-color-text|content-right_8Zs40)[^"]*"[^>]*>([\s\S]*?)<\/span>)?/g;

  for (const match of html.matchAll(pattern)) {
    const url = normalizeUrl(decodeHtml(match[1] || ''));
    const title = decodeHtml(match[2] || '');
    const snippet = decodeHtml(match[3] || match[4] || '');

    if (!title || !url) continue;

    results.push({ title, url, snippet, provider: 'baidu', position: results.length + 1 });
    if (results.length >= 8) break;
  }

  return results;
};

const searchWithBaidu = async (query: string) => {
  let html = await fetchText(
    `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=10&ie=utf-8`,
    SEARCH_POLICY.providerTimeoutMs
  );

  if (/location\.replace\(location\.href\.replace\("https:\/\/","http:\/\/"\)\)/.test(html)) {
    html = await fetchText(
      `http://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=10&ie=utf-8`,
      SEARCH_POLICY.providerTimeoutMs
    );
  }

  if (!html) return [];
  return extractBaiduResults(html);
};

const mergeAndRankResults = (items: RawSearchResultItem[], intent: SearchIntent, attempt: SearchAttempt): SearchResultItem[] => {
  const deduped = new Map<string, SearchResultItem>();

  const scoreResult = (item: SearchResultItem) => {
    const candidateText = `${item.title} ${item.snippet} ${item.hostname}`;
    return (
      scoreTrustLevel(item.trustLevel) +
      scoreProvider(item.provider, attempt.providerPreference) +
      getPreferredHostScore(attempt.query, item.hostname) +
      getKeywordOverlapScore(attempt.query, candidateText) +
      getEntityCoverageScore(attempt.query, candidateText) -
      item.position
    );
  };

  for (const item of items) {
    const hostname = getHostname(item.url);
    const title = item.title.trim();
    const snippet = item.snippet.trim();

    if (!title || !hostname) continue;
    if (isBlockedResult({ hostname, title, snippet, query: attempt.query })) continue;

    const trustLevel = classifyTrustLevel({ hostname, title, snippet });
    const allowUnknown = shouldAllowUnknownHosts(intent, attempt.relaxed);
    if (trustLevel === 'unknown' && !allowUnknown) continue;

    const candidateText = `${title} ${snippet} ${hostname}`;
    if (getKeywordOverlapScore(attempt.query, candidateText) <= 0 && getPreferredHostScore(attempt.query, hostname) <= 0) {
      continue;
    }

    const normalizedResultUrl = normalizeUrl(item.url);
    const existing = deduped.get(normalizedResultUrl);
    const candidate: SearchResultItem = {
      title,
      url: normalizedResultUrl,
      snippet,
      provider: item.provider,
      position: item.position,
      hostname,
      trustLevel
    };

    if (!existing) {
      deduped.set(normalizedResultUrl, candidate);
      continue;
    }

    if (scoreResult(candidate) > scoreResult(existing)) {
      deduped.set(normalizedResultUrl, candidate);
    }
  }

  const sortedResults = [...deduped.values()].sort((left, right) => scoreResult(right) - scoreResult(left));
  const matchedEntities = getMatchedEntityHints(attempt.query);

  if (matchedEntities.length >= 2) {
    const selected: SearchResultItem[] = [];
    const usedUrls = new Set<string>();

    for (const entity of matchedEntities) {
      const entityOfficial = sortedResults.find(
        (item) => !usedUrls.has(item.url) && endsWithHost(item.hostname, entity.preferredHosts)
      );

      if (entityOfficial) {
        selected.push(entityOfficial);
        usedUrls.add(entityOfficial.url);
      }
    }

    for (const item of sortedResults) {
      if (selected.length >= SEARCH_TOP_K) break;
      if (usedUrls.has(item.url)) continue;
      selected.push(item);
      usedUrls.add(item.url);
    }

    return selected.slice(0, SEARCH_TOP_K);
  }

  return sortedResults.slice(0, SEARCH_TOP_K);
};

const buildAttempts = (query: string, intent: SearchIntent, preferredQueries: string[] = []): SearchAttempt[] => {
  const variants = buildFallbackQueries(query, intent, preferredQueries);

  return [
    { query: variants[0] || query, relaxed: false, providerPreference: 'bing-first' },
    { query: variants[1] || variants[0] || query, relaxed: false, providerPreference: 'baidu-first' },
    {
      query: variants[2] || variants[1] || variants[0] || query,
      relaxed: true,
      providerPreference: intent === 'official' ? 'bing-first' : 'baidu-first'
    }
  ];
};

const buildSearchContext = (query: string, results: SearchResultItem[]) => {
  if (!results.length) return '';

  const renderItem = (item: SearchResultItem, index: number) => {
    const trustLabel =
      item.trustLevel === 'official'
        ? '官方'
        : item.trustLevel === 'trusted'
          ? '高可信'
          : item.trustLevel === 'reference'
            ? '参考'
            : '候选';

    return `${index + 1}. [${trustLabel}] 标题：${item.title}\n链接：${item.url}\n摘要：${item.snippet || '无摘要'}`;
  };

  const matchedEntities = getMatchedEntityHints(query);

  if (matchedEntities.length >= 2) {
    const groupedSections = matchedEntities
      .map((entity) => {
        const entityResults = results.filter((item) => endsWithHost(item.hostname, entity.preferredHosts)).slice(0, 2);
        if (!entityResults.length) return '';
        return `对象：${entity.id}\n${entityResults.map((item, index) => renderItem(item, index)).join('\n\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const remaining = results
      .filter((item) => !matchedEntities.some((entity) => endsWithHost(item.hostname, entity.preferredHosts)))
      .slice(0, 2);

    return `以下是围绕用户问题“${query}”的外部检索摘要。\n这是一个多方对比题。只能引用双方官方材料都直接支持的判断；如果某个结论只来自单边官方材料，必须明确说“单边证据，不足以下死结论”。\n如果双方材料口径不一致，直接指出差异，不要替任何一方脑补。\n\n${groupedSections}${remaining.length ? `\n\n补充结果：\n${remaining.map((item, index) => renderItem(item, index)).join('\n\n')}` : ''}`;
  }

  const items = results.map((item, index) => renderItem(item, index)).join('\n\n');

  return `以下是围绕用户问题“${query}”的外部检索摘要。\n这些内容只作为事实参考，不要机械复述；先判断，再引用最关键的一两条事实。\n如果结果之间存在冲突，直接指出冲突，不要装作确定。\n\n${items}`;
};

const logSearchDebug = (debug: SearchDebugInfo, originalQuery: string) => {
  if (!SEARCH_DEBUG_ENABLED) return;

  console.info(
    '[search-debug]',
    JSON.stringify({
      ...debug,
      query: originalQuery
    })
  );
};

const decideSearchRoute = async ({
  query,
  apiKey,
  model,
  baseUrl
}: {
  query: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}): Promise<SearchRouteDecision> => {
  const hardDecision = hardDecideSearchRoute(query);
  if (hardDecision) return hardDecision;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: 'system', content: SEARCH_ROUTE_PROMPT },
          { role: 'user', content: query }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content?.trim() || '';
      const jsonText = extractJsonObject(raw);
      if (jsonText) {
        const parsed = JSON.parse(jsonText) as {
          needSearch?: boolean;
          intent?: SearchIntent | 'none';
          searchQueries?: string[];
          rationale?: string;
        };

        const intent = parsed.intent && ['official', 'current', 'comparison', 'general', 'none'].includes(parsed.intent)
          ? parsed.intent
          : 'none';

        return {
          source: 'llm',
          needSearch: Boolean(parsed.needSearch),
          intent,
          searchQueries: Array.isArray(parsed.searchQueries) ? parsed.searchQueries.slice(0, 3).filter(Boolean) : [],
          rationale: parsed.rationale || ''
        };
      }
    }
  } catch {}

  const fallbackIntent = detectSearchIntent(query);
  return {
    source: 'rules',
    needSearch: Boolean(fallbackIntent),
    intent: fallbackIntent || 'none',
    searchQueries: [],
    rationale: fallbackIntent ? 'rules-fallback-hit' : 'rules-fallback-miss'
  };
};

const buildEvidenceGuardReply = (query: string, reason: 'missing-balanced-official-evidence' | 'missing-official-evidence') => {
  if (reason === 'missing-balanced-official-evidence') {
    return `现在直接拍板是 shit。\n1. 我这轮只拿到单边官方证据，没有拿到双方同等级的官方材料。\n2. 单边证据会把判断带偏，尤其是 Claude 和 OpenAI 这种企业级方案对比题。\n3. 没有双边官方证据，我不会替你下死结论。\n\n你更看重安全合规、成本，还是响应速度？或者直接给我双方官方链接，我再给你结论。`;
  }

  return `现在硬下结论是 shit。\n1. 我没有拿到足够的官方证据。\n2. 没有官网、官方文档或官方 pricing，继续判断只是在编。\n3. 这种题必须先把事实钉住，再谈选择。\n\n给我更具体的对象、版本、官方链接或价格页，我再继续。`;
};

const getSearchContext = async (query: string, requestId: string, routeDecision: SearchRouteDecision) => {
  const baseDebug: SearchDebugInfo = {
    requestId,
    enabled: SEARCH_ENABLED,
    routeSource: routeDecision.source,
    routeNeedSearch: routeDecision.needSearch,
    routeQueries: routeDecision.searchQueries,
    triggered: false,
    intent: 'none',
    hit: false,
    attempts: []
  };

  if (!SEARCH_ENABLED || !routeDecision.needSearch || routeDecision.intent === 'none') {
    return { searchContext: '', guardContext: '', forcedReply: '', debug: baseDebug };
  }

  const intent = routeDecision.intent;
  const attempts = buildAttempts(query, intent, routeDecision.searchQueries);
  const debug: SearchDebugInfo = {
    ...baseDebug,
    triggered: true,
    intent
  };

  for (const attempt of attempts) {
    const [seedResults, bingResults, baiduResults] = await Promise.all([
      fetchOfficialSeedResults(attempt.query),
      searchWithBingCn(attempt.query),
      searchWithBaidu(attempt.query)
    ]);
    const rankedResults = mergeAndRankResults([...seedResults, ...bingResults, ...baiduResults], intent, attempt);
    const officialCoverageEntities = getOfficialCoverageEntities(query, rankedResults);
    const hasOfficialEvidence = !requiresOfficialEvidence(query, intent) || officialCoverageEntities.length >= 1;
    const hasBalancedOfficialEvidence = !requiresBalancedOfficialEvidence(query, intent) || officialCoverageEntities.length >= 2;

    debug.attempts.push({
      query: attempt.query,
      relaxed: attempt.relaxed,
      providerPreference: attempt.providerPreference,
      seedCount: seedResults.length,
      bingCount: bingResults.length,
      baiduCount: baiduResults.length,
      rankedCount: rankedResults.length,
      topHosts: rankedResults.slice(0, 3).map((item) => item.hostname),
      officialCoverageEntities
    });

    if (rankedResults.length >= 2 && hasOfficialEvidence && hasBalancedOfficialEvidence) {
      debug.hit = true;
      debug.officialCoverageEntities = officialCoverageEntities;
      return {
        searchContext: buildSearchContext(query, rankedResults),
        guardContext: '',
        forcedReply: '',
        debug
      };
    }
  }

  if (requiresBalancedOfficialEvidence(query, intent)) {
    debug.guardReason = 'missing-balanced-official-evidence';
    return {
      searchContext: '',
      guardContext:
        '系统提示：当前外部检索没有形成双边官方证据覆盖。对于这种多方对比题，不允许下死结论；必须明确说明证据单边或证据不足，并要求用户给出更具体的评估维度。',
      forcedReply: buildEvidenceGuardReply(query, 'missing-balanced-official-evidence'),
      debug
    };
  }

  if (requiresOfficialEvidence(query, intent)) {
    debug.guardReason = 'missing-official-evidence';
    return {
      searchContext: '',
      guardContext:
        '系统提示：当前外部检索没有拿到足够的官方证据。不要假装确定；直接说明公开官方信息不足，并要求用户提供更具体的对象、版本、链接或评估维度。',
      forcedReply: buildEvidenceGuardReply(query, 'missing-official-evidence'),
      debug
    };
  }

  return { searchContext: '', guardContext: '', forcedReply: '', debug };
};

const parseAllowedOrigins = () => {
  const configured = env.ALLOWED_ORIGINS
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
};

const isAllowedOrigin = (origin: string | undefined, allowedOrigins: Set<string>) => {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

const applyCors = (req: any, res: any) => {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = req.headers.origin as string | undefined;
  const allowOrigin = isAllowedOrigin(requestOrigin, allowedOrigins)
    ? requestOrigin
    : DEFAULT_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

const mockResponse = (message: string, reason = '接口未配置模型 key，返回演示回复。') => ({
  reply: buildMockReply(message),
  mode: 'mock',
  reason
});

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (req.body || {}) as RequestBody;
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const latestUserMessage = [...messages].reverse().find((item) => item.role === 'user');
  const content = latestUserMessage?.content?.trim() || '';

  if (!content) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = trimTrailingSlash(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');

  if (!apiKey) {
    res.status(200).json(mockResponse(content));
    return;
  }

  const requestMessages = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({ role: message.role, content: message.content.trim() }))
    .filter((message) => message.content)
    .slice(-12);

  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const routeDecision = await decideSearchRoute({
    query: content,
    apiKey,
    model,
    baseUrl
  });
  const { searchContext, guardContext, forcedReply, debug: searchDebug } = await getSearchContext(content, requestId, routeDecision);
  logSearchDebug(searchDebug, content);

  if (forcedReply) {
    res.status(200).json({
      reply: forcedReply,
      mode: 'api',
      reason: '当前回复已通过检索护栏返回。'
    });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [
          { role: 'system', content: JOBS_SYSTEM_PROMPT },
          ...(guardContext ? [{ role: 'system', content: guardContext }] : []),
          ...(searchContext ? [{ role: 'system', content: searchContext }] : []),
          ...requestMessages
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(200).json(
        mockResponse(
          content,
          `模型接口返回异常，已自动回退到演示回复。${errorText ? `（${errorText.slice(0, 120)}）` : ''}`
        )
      );
      return;
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      reply: reply || buildMockReply(content),
      mode: 'api',
      reason: '当前回复已通过真实模型返回。'
    });
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    res.status(200).json(
      mockResponse(content, isTimeout ? '模型接口响应超时，已自动回退到演示回复。' : '当前环境未连上模型 API，已自动回退到演示回复。')
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
