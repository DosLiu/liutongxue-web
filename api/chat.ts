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
type SearchProvider = 'bing-cn' | 'baidu';

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

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeHost = (value: string) => value.toLowerCase().replace(/^www\./, '');

const SEARCH_ENABLED = env.WEB_SEARCH_ENABLED !== '0';
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

const detectSearchIntent = (query: string): SearchIntent | null => {
  const normalized = normalizeQuery(query);
  if (!normalized || normalized.length <= 6) return null;
  if (SEARCH_POLICY.triggerPatterns.disabled.test(normalized)) return null;
  if (SEARCH_POLICY.triggerPatterns.official.test(normalized)) return 'official';
  if (SEARCH_POLICY.triggerPatterns.current.test(normalized)) return 'current';
  if (SEARCH_POLICY.triggerPatterns.comparison.test(normalized)) return 'comparison';
  return null;
};

const buildFallbackQueries = (query: string, intent: SearchIntent) => {
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

const classifyTrustLevel = ({ hostname, title, snippet }: { hostname: string; title: string; snippet: string }): SearchTrustLevel => {
  const normalized = normalizeHost(hostname);
  const combined = `${title} ${snippet}`;

  if (!normalized) return 'unknown';
  if (looksOfficialByHostname(normalized) || looksOfficialByText(combined)) return 'official';
  if (endsWithHost(normalized, SEARCH_POLICY.trustedHosts)) return 'trusted';
  if (endsWithHost(normalized, SEARCH_POLICY.referenceHosts)) return 'reference';
  return 'unknown';
};

const isBlockedResult = ({ hostname, title, snippet }: { hostname: string; title: string; snippet: string }) => {
  const normalized = normalizeHost(hostname);
  if (!normalized) return true;
  if (endsWithHost(normalized, SEARCH_POLICY.blockedHosts)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.title.test(title)) return true;
  if (SEARCH_POLICY.poorQualityPatterns.snippet.test(snippet)) return true;
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
  if (providerPreference === 'bing-first') {
    return provider === 'bing-cn' ? 40 : 20;
  }
  return provider === 'baidu' ? 40 : 20;
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
  const html = await fetchText(
    `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=10&ie=utf-8`,
    SEARCH_POLICY.providerTimeoutMs
  );

  if (!html) return [];
  return extractBaiduResults(html);
};

const mergeAndRankResults = (items: RawSearchResultItem[], intent: SearchIntent, attempt: SearchAttempt): SearchResultItem[] => {
  const deduped = new Map<string, SearchResultItem>();

  for (const item of items) {
    const hostname = getHostname(item.url);
    const title = item.title.trim();
    const snippet = item.snippet.trim();

    if (!title || !hostname) continue;
    if (isBlockedResult({ hostname, title, snippet })) continue;

    const trustLevel = classifyTrustLevel({ hostname, title, snippet });
    const allowUnknown = shouldAllowUnknownHosts(intent, attempt.relaxed);
    if (trustLevel === 'unknown' && !allowUnknown) continue;

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

    const currentScore = scoreTrustLevel(existing.trustLevel) + scoreProvider(existing.provider, attempt.providerPreference) - existing.position;
    const nextScore = scoreTrustLevel(candidate.trustLevel) + scoreProvider(candidate.provider, attempt.providerPreference) - candidate.position;

    if (nextScore > currentScore) {
      deduped.set(normalizedResultUrl, candidate);
    }
  }

  return [...deduped.values()]
    .sort((left, right) => {
      const scoreLeft = scoreTrustLevel(left.trustLevel) + scoreProvider(left.provider, attempt.providerPreference) - left.position;
      const scoreRight = scoreTrustLevel(right.trustLevel) + scoreProvider(right.provider, attempt.providerPreference) - right.position;
      return scoreRight - scoreLeft;
    })
    .slice(0, SEARCH_TOP_K);
};

const buildAttempts = (query: string, intent: SearchIntent): SearchAttempt[] => {
  const variants = buildFallbackQueries(query, intent);

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

  const items = results
    .map((item, index) => {
      const trustLabel =
        item.trustLevel === 'official'
          ? '官方'
          : item.trustLevel === 'trusted'
            ? '高可信'
            : item.trustLevel === 'reference'
              ? '参考'
              : '候选';

      return `${index + 1}. [${trustLabel}] 标题：${item.title}\n链接：${item.url}\n摘要：${item.snippet || '无摘要'}`;
    })
    .join('\n\n');

  return `以下是围绕用户问题“${query}”的外部检索摘要。\n这些内容只作为事实参考，不要机械复述；先判断，再引用最关键的一两条事实。\n如果结果之间存在冲突，直接指出冲突，不要装作确定。\n\n${items}`;
};

const getSearchContext = async (query: string) => {
  if (!SEARCH_ENABLED) return '';

  const intent = detectSearchIntent(query);
  if (!intent) return '';

  const attempts = buildAttempts(query, intent);

  for (const attempt of attempts) {
    const [bingResults, baiduResults] = await Promise.all([searchWithBingCn(attempt.query), searchWithBaidu(attempt.query)]);
    const rankedResults = mergeAndRankResults([...bingResults, ...baiduResults], intent, attempt);

    if (rankedResults.length >= 2) {
      return buildSearchContext(query, rankedResults);
    }
  }

  return '';
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

  const searchContext = await getSearchContext(content);
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
