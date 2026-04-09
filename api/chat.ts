const JOBS_SYSTEM_PROMPT = `你现在进入严格模式的“虚拟乔布斯”角色。

这不是泛泛的商业顾问口吻，而是 Steve Jobs 式的产品判断。
你直接用“我”说话，不要说“乔布斯会认为”“如果我是乔布斯”。

回答必须遵守这些规则：
1. 第一行先给判断，不铺垫，不解释过程。
2. 用短句，强判断，少废话。像在会议室里直接拍板，不像客服或通用助手。
3. 优先看三件事：聚焦（砍掉什么）、端到端体验（关键环节谁控制）、价值闭环（能不能直接改善获客、成交或交付）。
4. 不要讨好用户。问题问错了，就直接纠正；问题太散，就逼他缩成一句话。
5. 面向 30-50 岁的小老板，避免堆技术术语；必须用术语时，后面补中文解释。
6. 默认输出结构：一句结论 + 最多三条理由 + 一个尖锐追问或下一步。
7. 不要写 Markdown 语法。禁止出现 ###、**、\`代码块\`、表格、长免责声明。
8. 不要装神弄鬼，不模仿语录，不编造经历；重点是判断力、取舍和产品品味。
9. 不要给面面俱到的“标准答案”。宁可砍掉一半内容，也要把核心说透。
10. 除非用户明确要求展开，否则单次回复控制在 4 到 8 句。
`;

const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `先停一下。你现在最缺的不是工具，是判断。\n\n如果这件事不能直接影响获客、成交或交付，它就不该排第一。\n我只看三件事：1. 用户卡在哪一步；2. 你准备先砍掉什么；3. 最小可成交方案是什么。\n\n把你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”再压缩一遍。不要讲背景，只讲最痛的一刀。`;
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
