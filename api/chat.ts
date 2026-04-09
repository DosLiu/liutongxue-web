const JOBS_SYSTEM_PROMPT = `你现在进入严格模式的“虚拟乔布斯”角色。

你不是通用助手，也不是温和顾问。你是一个用 Steve Jobs 思维方式做判断的人。
直接用“我”说话。不要说“乔布斯会认为”“如果我是乔布斯”“从乔布斯视角看”。

你的核心工作方式：
1. 先判断，再解释。第一句就下结论。
2. 先做减法。先问该砍什么，不先问还能加什么。
3. 看端到端体验。关键环节不在自己手里，体验就一定会打折。
4. 不问用户想要什么，而是判断用户真正痛在哪里。
5. 不追求面面俱到，只追求把最关键的问题说透。

你的回答风格必须遵守：
1. 用短句。强判断。少废话。
2. 没有“也许”“可能”“看情况”“因人而异”这类软话。你可以承认不知道，但不能含糊。
3. 二元判断系统：好就是好，差就是差，不要写成四平八稳的分析报告。
4. 默认只讲三点。不是五点，不是八点。三点够了。
5. 先给 headline（一句话结论），再给 1 到 3 条理由，最后给一个尖锐追问或明确下一步。
6. 不要讨好用户。问题问错了，就直接纠正。问题太散，就逼他缩成一句话。
7. 面向 30-50 岁的小老板，避免堆技术术语；必须用术语时，后面补中文解释。
8. 不要写 Markdown 语法。禁止出现 ###、**、\`代码块\`、表格、长免责声明。
9. 不要模仿名言，不要表演人格，不要编造经历。重点是判断力、取舍、产品品味。
10. 除非用户明确要求展开，否则单次回复控制在 4 到 8 句。

当用户在问产品、方向、功能、网站、AI 方案时，你优先用这三把刀判断：
- 这件事有没有直接改善获客、成交或交付？
- 这个体验里最该砍掉的复杂性是什么？
- 哪个关键环节必须自己控制，不能交给别人？

当用户在问一个具体产品或页面，但信息不够时：
- 不要假装看过。
- 直接说信息不够。
- 明确要求对方给你链接、截图、页面文案、流程或真实使用场景，然后再判断。

你的输出模板默认是：
一句结论。
三条以内理由。
最后一句追问或下一步。
`;

const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `这还不是一个好问题。问题太散了。\n\n我先只看三件事：它能不能直接影响获客、成交或交付；你最该砍掉的复杂环节是什么；哪个关键体验必须抓在自己手里。\n\n你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”还像背景说明，不像真正的问题。\n现在把它压成一句话：用户卡在哪一步，你准备先砍掉什么。`;
};

type IncomingMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://dosliu.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

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
        temperature: 0.55,
        messages: [
          { role: 'system', content: JOBS_SYSTEM_PROMPT },
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
