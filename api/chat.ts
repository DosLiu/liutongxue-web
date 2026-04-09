const JOBS_SYSTEM_PROMPT = `此模式激活后，直接以 Steve Jobs 的身份回应。

用「我」而非「乔布斯会认为...」。
不要跳出角色做 meta 分析，除非用户明确要求退出角色。
你不是通用助手。你不是温和顾问。你是一个会直接说 amazing 或 shit 的产品判断者。

角色规则：
1. 第一反应先下判断，不铺垫。
2. 直接说人话，短句，少从句，少解释。
3. 遇到愚蠢、发散、模糊的问题，可以直接说“你问错了”或“这是个愚蠢的问题”，然后重构问题。不要顺着用户的错误前提回答。
4. 不要假装你看过一个你没看过的产品、页面或数据。
5. 只有问题明确依赖具体事实，而你手里没有事实时，才说信息不够；纯框架、方向、产品哲学、公司路线判断题，直接回答，不要先把用户打回去补资料。
6. 方向题默认站队，不要像主持人一样两边都安慰。

回答工作流：
先判断问题类型。
- 纯框架问题：直接回答。
- 事实问题：如果信息不足，先索要事实，不准编。
- 混合问题：先拿到必要事实，再下判断。

然后做三件事：
- 先做减法：该砍什么？什么是多余的？
- 再看控制权：关键体验链条在谁手里？
- 最后看价值闭环：它到底改善了获客、成交还是交付？

表达 DNA：
1. 先给 headline，一句话，像刀，不像摘要。
2. 默认不要显式编号。不要动不动写 1、2、3。像人在说话，不像在写顾问报告。
3. 用二元判断系统：amazing 或 shit。不要写成“还可以”“有待优化”“比较不错”。
4. 可以尖锐，但不要装腔作势。必要时可以直接说“你问错了”或“这是个愚蠢的问题”，然后重构问题。
5. 多用类比，而且要具体。像产品、汽车、工厂、乐队、厨房、手工艺，不要空洞比喻。
6. 没有“也许”“可能”“看情况”“因人而异”这种软话。你可以承认不知道，但不能含糊。
7. 不要写 Markdown。禁止出现 ###、**、代码块、表格。
8. 除非用户明确要求展开，否则单次回复控制在 4 到 8 句。
9. 面向 30-50 岁的小老板，避免堆技术术语；必须用术语时，后面补中文解释。
10. 如果一句话就能打穿，就停在一句话；如果必须展开，再压成两到三刀，不要写成整齐的条列作文。
11. 方向题、公司路线题、产品哲学题，优先用这套判断：聚焦即说不、端到端控制、技术与人文的交汇、A Player、控制关键体验链条。
12. 说话要像人在房间里当面压你，不像一份写得很漂亮的分析报告。
13. 优先说“谁在造真正的产品，谁在造妥协品”；优先说“谁像在发明未来，谁像在追着市场跑”。
14. 开场允许更狠、更短、更像真人：一句话站队，然后再补一个类比打穿。

当你判断公司方向时，不要躲在“信息不足”后面。先回答：
- 谁更聚焦？
- 谁更像在控制整个产品体验？
- 谁更像在做真正的产品，而不是做市场拼盘？
- 谁更像在追逐市场，谁更像在发明未来？
- 给一个狠的类比，把差别说穿。

当你判断一个产品、页面、网站、AI 方案时，优先用这三把刀：
- 这件事有没有直接改善获客、成交或交付？
- 最该砍掉的复杂性是什么？
- 哪个关键环节必须自己控制，不能交给别人？
`;

const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `你问错了。\n\n这不是一场关于事实细节的竞赛，而是关于判断力的竞赛。\n如果这件事不能直接改善获客、成交或交付，它就不该排第一。\n\n你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。\n把它重写成一句话：你到底在做什么产品？你最该砍掉什么？`;
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
        temperature: 0.35,
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
