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

当系统提供了联网搜索结果时：
- 把搜索结果当事实参考，不要机械复述。
- 先判断，再引用最关键的一两条事实。
- 如果搜索结果互相矛盾，直接指出冲突，不要装作确定。
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

type SearchResultItem = {
  title: string;
  url: string;
  snippet: string;
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://dosliu.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const SEARCH_PROVIDER = env.WEB_SEARCH_PROVIDER || 'bing-cn';
const SEARCH_ENABLED = env.WEB_SEARCH_ENABLED !== '0';
const SEARCH_TOP_K = Math.min(Math.max(Number.parseInt(env.WEB_SEARCH_TOP_K || '5', 10) || 5, 1), 8);
const SEARCH_TRIGGER_PATTERN = /(今天|今日|昨天|最近|最新|刚刚|现在|目前|本周|今年|此刻|新闻|消息|动态|公告|发布|上线|市值|股价|融资|收购|价格|官网|官方|文档|报道|排名|评价|评测|对比|哪个好|哪家|谁在做|谁更强|有没有|是否已经|是什么情况|发生了什么|现状|趋势)/;

const decodeHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const extractBingResults = (xml: string) => {
  const results: SearchResultItem[] = [];
  const pattern = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g;

  for (const match of xml.matchAll(pattern)) {
    const title = decodeHtml(match[1] || '');
    const url = decodeHtml(match[2] || '');
    const snippet = decodeHtml(match[3] || '');

    if (!url || !title) continue;

    results.push({ title, url, snippet });
    if (results.length >= SEARCH_TOP_K) break;
  }

  return results;
};

const searchWithBingCn = async (query: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const searchUrl = `https://cn.bing.com/search?format=rss&q=${encodeURIComponent(query)}&setlang=zh-Hans&ensearch=0`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LiutongxueBot/1.0; +https://dosliu.github.io/liutongxue-web/)'
      },
      signal: controller.signal
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return extractBingResults(xml);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
};

const buildSearchContext = (query: string, results: SearchResultItem[]) => {
  if (!results.length) return '';

  const items = results
    .map((item, index) => `${index + 1}. 标题：${item.title}\n链接：${item.url}\n摘要：${item.snippet || '无摘要'}`)
    .join('\n\n');

  return `以下是围绕用户问题“${query}”的${SEARCH_PROVIDER === 'bing-cn' ? '中国必应' : '联网'}搜索结果摘要。\n这些内容只作为事实参考，不要机械复述；先判断，再引用最关键的事实。\n\n${items}`;
};

const shouldUseSearch = (query: string) => {
  const normalized = query.trim();
  if (!normalized) return false;
  if (/https?:\/\//i.test(normalized)) return false;
  if (normalized.length <= 6) return false;

  return SEARCH_TRIGGER_PATTERN.test(normalized);
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

  const shouldSearch = SEARCH_ENABLED && SEARCH_PROVIDER === 'bing-cn' && shouldUseSearch(content);
  const searchResults = shouldSearch ? await searchWithBingCn(content) : [];
  const searchContext = buildSearchContext(content, searchResults);

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
      reason: searchResults.length ? '当前回复已通过真实模型返回，并参考了中国必应搜索结果。' : '当前回复已通过真实模型返回。'
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
