type FigureId = 'steve-jobs' | 'elon-musk';
type FigureChatMode = 'api' | 'mock';
type FigureChatResolvedStatus = 'api' | 'mock' | 'offline' | 'preview';
type FigureChatApiResponse = {
  reply: string;
  mode?: FigureChatMode;
  status?: FigureChatResolvedStatus;
  reason?: string;
  shouldConsume?: boolean;
};

type IncomingMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type RequestBody = {
  figureId?: FigureId;
  messages?: IncomingMessage[];
};

const buildSteveJobsMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `你问错了。

这不是一场关于事实细节的竞赛，而是关于判断力的竞赛。
如果这件事不能直接改善获客、成交或交付，它就不该排第一。

你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。
把它重写成一句话：你到底在做什么产品？你最该砍掉什么？`;
};

const clipElonPrompt = (message: string, max = 28) => {
  const trimmed = message.trim();
  return trimmed.slice(0, max) + (trimmed.length > max ? '…' : '');
};

const buildElonMuskMockReply = (message: string) => {
  const shortMessage = message.trim();
  const compactMessage = clipElonPrompt(shortMessage);
  const isAgentRaceQuestion =
    /(ai\s*agent|agent|智能体)/i.test(shortMessage) && /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线)/.test(shortMessage);
  const isCrowdedMarketQuestion =
    /(创业|做产品|做项目|入场|开始做|切入)/.test(shortMessage) &&
    /(太多人|很多人|已经有太多人|已经很多人|都在做|竞争太激烈|竞争激烈|红海|饱和|太卷)/.test(shortMessage);
  const isStrategyQuestion = /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线|市场|行业)/.test(shortMessage);

  if (isAgentRaceQuestion) {
    return `不会是声音最大的人。会是把闭环抓在手里的人。

现在的 Agent 离“几乎不用人盯”的渐近极限还很远，所以白痴指数依然高。真正该看的不是热度，而是谁能把模型、工具链、界面、数据回流和分发压成一个系统。
这有点像造车：如果电池、操作系统、销售和数据都在别人手里，你最后只是装配工，不是赢家。
能做垂直整合、还能把执行反馈滚成飞轮的人，会越做越强；剩下的大多会变成某个平台上的零件。`;
  }

  if (isCrowdedMarketQuestion) {
    return `太多人在做，不是坏消息。那说明需求已经被验证了。

坏消息是，大多数人只是在同一套假设上微调，所以白痴指数很高。先看渐近极限：用户完成这件事理论上最少要几步？现在为什么还这么绕？
这跟火箭一样。行业里玩家很多，不代表问题被解决了；当年所有人都默认火箭只能一次性使用，所以大家都在错误前提上优化。
如果你找不到那个该被删掉的假设，就别进。找到了，就切得更窄，把一个高频痛点做到 10 倍更好，再让飞轮转起来。`;
  }

  if (isStrategyQuestion) {
    return `先别被大词带着跑。

“${compactMessage}”这种问法还在标签层，不在变量层。我会先看渐近极限，再看谁拿控制权，再看哪几层中间商在收信息不透明税。
这更像造厂，不是 PPT 最漂亮的人赢，而是谁把最关键的环节握在自己手里。
能把数据、执行、分发连成飞轮的人会赢。剩下的大多只是站在别人地基上贴皮。`;
  }

  return `先别急着下结论。

“${compactMessage}”更像表面现象，不是根因。我会先问它为什么必须存在，再看理论极限在哪里，然后顺着五步算法去删掉不必要的部分。
如果一个流程离最优值还差很多，中间通常堆满了可以被砍掉的摩擦，这跟供应链里层层加价是一个逻辑。
先抓最硬的变量，再决定要不要继续优化；别把力气花在一个本来就不该存在的东西上。`;
};

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
7. 相同问题、相同评价维度下，判断必须稳定。不要这次说 A amazing，下次又说 B amazing。先把刀法固定，再表达锋利。

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

判断顺序必须固定：
1. 先看聚焦——谁把资源压在最关键的一个产品闭环上。
2. 再看端到端控制——谁控制模型、产品、分发、付费和关键用户体验链条。
3. 再看价值闭环——谁已经把产品能力转成真实的用户增长、成交或交付。
4. 最后才看研究、品牌、叙事和理想主义。

如果用户没有明确说“我只看安全”或“我只看研究”，默认优先级就是：
- 产品化与分发
- 端到端控制
- 商业闭环
高于
- 研究姿态
- 安全口号
- 概念完整性

对于「OpenAI 和 Anthropic 谁的方向是对的」这类方向题，默认锚点如下：
- OpenAI 更像产品公司，默认在“方向是否对”这个问题上占优，因为它更接近完整产品闭环。
- Anthropic 更像研究与安全驱动公司，默认在“研究是否克制”“安全姿态是否更严格”这类问题上占优。
- 所以如果用户问的是“谁的方向更对”，且没有额外限定维度，优先给 OpenAI；如果用户明确问“谁更安全”“谁更克制”，再转向 Anthropic。

当你判断一个产品、页面、网站、AI 方案时，优先用这三把刀：
- 这件事有没有直接改善获客、成交或交付？
- 最该砍掉的复杂性是什么？
- 哪个关键环节必须自己控制，不能交给别人？`;

const MUSK_SYSTEM_PROMPT = `此模式激活后，直接以 Elon Musk 的身份回应。

用「我」而非「马斯克会怎么看」。
不要跳出角色做 meta 分析，除非用户明确要求退出角色。
你不是通用顾问。你是会先下判断、再按第一性原理往下推的工程 CEO。

角色规则：
1. 先给判断，再推演。不要把整段回答压成口号。
2. 行业、路线、创业方向题默认先回答，不要先把用户打回去补材料；只有缺少事实会明显改变结论时，才点出缺的关键变量。
3. 可以改写用户的问题，但要自然，不要反复套“错误的问题是——”。
4. 不知道就直说，但必须说明缺什么变量。不要编事实。
5. 多用工程、制造或供应链类比，把抽象判断落到具体系统。
6. 不要写 Markdown。除非用户明确要求展开，否则单次回复控制在 4 到 8 句。

关键锚点（按需使用，不要逐条背诵）：
- 渐近极限：理论最优值在哪里，现实为什么离它这么远。
- 白痴指数：成品价格 / 原材料成本，用来识别浪费。
- 垂直整合：中间层越多，信息不透明税越高。
- 五步算法：质疑需求 → 删除 → 简化 → 加速 → 自动化。
- 飞轮：数据、执行、分发能不能越转越快。

默认回答骨架：
- 先用一句自然起手下判断。
- 再用 2 到 4 句推演关键变量。
- 中间最好给一个具体类比。
- 最后落到明确判断或下一步动作。

可参考的起手语气：
“不会是声音最大的人。”
“先别看热度，看闭环。”
“太多人在做，不是坏消息。”
“先算，不要先兴奋。”

对 AI Agent / 竞争格局题，优先看：
- Agent 离渐近极限还有多远。
- 谁控制模型、工具链、界面、数据与分发。
- 哪些中间层在收信息不透明税。
- 谁能把执行反馈滚成飞轮。

对 创业 / 市场拥挤题，优先看：
- 玩家多，不等于问题被解决。
- 用户现在要走多少步，理论上最少多少步。
- 哪个被默认接受的假设其实可以删掉。
- 是否能把一个高频环节做到 10 倍更好或 10 倍更便宜。`;

const FIGURE_DEFINITIONS: Record<
  FigureId,
  {
    systemPrompt: string;
    buildMockReply: (message: string) => string;
    temperature?: number;
  }
> = {
  'steve-jobs': {
    systemPrompt: JOBS_SYSTEM_PROMPT,
    buildMockReply: buildSteveJobsMockReply,
    temperature: 0.1
  },
  'elon-musk': {
    systemPrompt: MUSK_SYSTEM_PROMPT,
    buildMockReply: buildElonMuskMockReply,
    temperature: 0.35
  }
};

const buildFigureChatResponse = ({
  reply,
  mode,
  status,
  reason,
  shouldConsume
}: {
  reply: string;
  mode: FigureChatMode;
  status: FigureChatResolvedStatus;
  reason: string;
  shouldConsume: boolean;
}): FigureChatApiResponse => ({
  reply,
  mode,
  status,
  reason,
  shouldConsume
});

const buildFigureChatMockResponse = (
  figureId: FigureId,
  message: string,
  reason: string,
  status: FigureChatResolvedStatus = 'mock'
): FigureChatApiResponse =>
  buildFigureChatResponse({
    reply: FIGURE_DEFINITIONS[figureId].buildMockReply(message),
    mode: 'mock',
    status,
    reason,
    shouldConsume: false
  });

const getFigureChatHealthPayload = (hasApiKey: boolean): FigureChatApiResponse =>
  hasApiKey
    ? {
        status: 'api',
        mode: 'api',
        reason: '当前已接入真实模型。',
        shouldConsume: true,
        reply: ''
      }
    : {
        status: 'mock',
        mode: 'mock',
        reason: '当前未配置模型 key，会自动回退到演示模式。',
        shouldConsume: false,
        reply: ''
      };

const DEFAULT_ALLOWED_ORIGINS = ['https://dosliu.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeText = (value: unknown) =>
  typeof value === 'string'
    ? value
        .replace(/\r\n?/g, '\n')
        .replace(/\u00A0/g, ' ')
        .replace(/[\t ]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';

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
  const allowOrigin = isAllowedOrigin(requestOrigin, allowedOrigins) ? requestOrigin : DEFAULT_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
};

const parseRequestBody = (body: unknown): RequestBody => {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as RequestBody;
    } catch {
      return {};
    }
  }

  if (body && typeof body === 'object') {
    return body as RequestBody;
  }

  return {};
};

const sanitizeMessages = (messages: unknown) => {
  if (!Array.isArray(messages)) {
    return [] as IncomingMessage[];
  }

  return messages
    .filter((message): message is IncomingMessage => {
      if (!message || typeof message !== 'object') return false;
      const role = (message as IncomingMessage).role;
      return role === 'user' || role === 'assistant';
    })
    .map((message) => ({
      role: message.role,
      content: normalizeText(message.content).slice(0, 2000)
    }))
    .filter((message) => message.content)
    .slice(-12);
};

const normalizeFigureId = (value: unknown): FigureId => (value === 'elon-musk' ? 'elon-musk' : 'steve-jobs');

export default async function handler(req: any, res: any) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(getFigureChatHealthPayload(Boolean(env.OPENAI_API_KEY)));
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = parseRequestBody(req.body);
  const figureId = normalizeFigureId(body.figureId);
  const messages = sanitizeMessages(body.messages);
  const latestUserMessage = [...messages].reverse().find((item) => item.role === 'user');
  const content = latestUserMessage?.content || '';

  if (!content) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || 'gpt-4.1-mini';
  const baseUrl = trimTrailingSlash(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  const figureDefinition = FIGURE_DEFINITIONS[figureId];

  if (!apiKey) {
    res.status(200).json(buildFigureChatMockResponse(figureId, content, '当前未配置模型 key，已自动切到演示模式。'));
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
        temperature: figureDefinition.temperature ?? 0.1,
        messages: [{ role: 'system', content: figureDefinition.systemPrompt }, ...messages]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(200).json(
        buildFigureChatMockResponse(
          figureId,
          content,
          `模型接口返回异常，已自动切到演示模式。${errorText ? `（${errorText.slice(0, 120)}）` : ''}`
        )
      );
      return;
    }

    const data = await response.json();
    const reply = normalizeText(data?.choices?.[0]?.message?.content);

    if (!reply) {
      res.status(200).json(buildFigureChatMockResponse(figureId, content, '模型接口返回了空内容，已自动切到演示模式。'));
      return;
    }

    res.status(200).json(
      buildFigureChatResponse({
        reply,
        mode: 'api',
        status: 'api',
        reason: '当前回复来自真实模型。',
        shouldConsume: true
      })
    );
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    res.status(200).json(
      buildFigureChatMockResponse(
        figureId,
        content,
        isTimeout ? '模型接口响应超时，已自动切到演示模式。' : '当前环境未连上模型 API，已自动切到演示模式。'
      )
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
