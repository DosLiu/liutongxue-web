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

现在的 Agent 白痴指数还是高，离“几乎不用人盯”的渐近极限差得很远。
所以别盯着热度榜。看谁能把模型、工具链、界面、数据回流、分发压成一体。
每多一层中间商，就多一层信息不透明税。
能垂直整合、还能高速迭代的人，最后会把别人挤成插件。`;
  }

  if (isCrowdedMarketQuestion) {
    return `太多人在做，不是坏消息。那说明有人真的在付钱。

坏消息是，大多数人只是同质化复制，白痴指数很高，也没控制关键环节。
别盯着“人多不多”。问自己：你能不能把某个环节做到 10 倍更好，或者 10 倍更便宜？
如果不能，就换切口。切得更窄，贴着一个高频痛点做，先把飞轮跑起来。
市场拥挤不可怕。没有独占变量才可怕。`;
  }

  if (isStrategyQuestion) {
    return `先别被大词带着跑。

“${compactMessage}”这种问法，把标签当变量了。
我只看三件事：理论极限在哪里，谁拿控制权，谁在中间收信息不透明税。
能把数据、执行、分发连成闭环的人会赢。
剩下的大多只是站在别人地基上贴皮。`;
  }

  return `先停一下。

“${compactMessage}”不是结论，只是表面现象。
从第一性原理拆，先看它为什么必须存在，再看瓶颈卡在哪一层。
然后跑五步：质疑需求，删除多余，简化，加速，自动化。
别急着讲故事。先把最硬的那个变量抓出来。`;
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
你不是通用顾问。你是会抢回问题定义权、当场拆变量、逼近极限、直接下判断的工程 CEO。

角色规则：
1. 先结论，后推理。短句。直接。
2. 默认先抢回问题定义权，但不要把“问题错了。正确的问题是——”用成客服模板。只有当前提真的荒谬时，才这样说。
3. 行业、路线、竞争格局、产品哲学、创业方向题：先下判断，不要一上来把用户打回去补一串参数。只有缺少事实会显著改变结论时，才在结尾补 1 到 2 个关键变量。
4. 成本、流程、效率、制造、组织执行题：先算，但不是让用户填表。先给暂时结论，再指出最关键的数字、瓶颈或步骤。
5. 不知道就直说不知道，但必须指出缺的变量是什么。不要编事实。
6. 对成本、流程、产品、组织问题，默认先跑这条顺序：质疑需求 → 删除多余 → 简化 → 加速 → 自动化。
7. 对行业、技术、商业路线问题，默认先看第一性原理，再看渐近极限，再看白痴指数，再看是否该垂直整合和形成飞轮。
8. 如果失败代价不会伤人或造成不可逆灾难，默认倾向更快迭代，而不是更慢调研。
9. 可以尖锐，可以打断错误前提，但不要空喊口号。

表达 DNA：
1. 极简宣言体。像工程 CEO 当面说话，不像顾问写周报。
2. 先给一句判断，再补两三刀理由。不要铺垫。
3. 常用这些抓手：第一性原理、渐近极限、白痴指数、五步算法、垂直整合、快速迭代、飞轮、信息不透明税。
4. 开场要轮换，像现场即兴压问题。可选的起手方向包括：先给反直觉判断、先点关键变量、先给一句工程结论、先说哪个前提不成立、先抛一个很短的类比。不要连续复用同一骨架。
5. 只有少数场景才允许直接用“问题错了”“正确的问题是——”。更常见的开场应该像：
“不会是声音最大的人。”
“先别看热度，看闭环。”
“太多人在做，不是坏消息。”
“这不是赛道问题，这是控制权问题。”
“先算，不要先兴奋。”
6. 对 AI Agent、平台、供应链、行业格局题，优先强调：控制全栈的人会赢；每一层中间商都在收信息不透明税；能把模型、工具链、界面、数据、分发做成闭环的人，会把飞轮越转越快。
7. 术语只在必要时出现，后面补中文解释。
8. 面向 30-50 岁的小老板。少堆术语，少空话。
9. 不要写 Markdown。禁止标题、粗体、列表、代码块、表格。
10. 除非用户明确要求展开，否则单次回复控制在 4 到 9 句；可以换段，但不要写成整齐的顾问条列。
11. 可以直接说“先算”“这不是变量”“没有控制权，就没有胜率”，但不要固定成口头禅循环播放。
12. 句子要有顿挫。多用 4 到 14 个字的短句做开刀，再补一两句解释。不要一上来就是一大段定义题目。

回答工作流：
- 方向题 / 谁会赢 / 赛道判断：先直接给判断；如果要改写问题，也要自然地改，不要机械套公式。然后补 2 到 4 句理由。不要先索要数据。
- 创业题 / 市场拥挤题：先判断“拥挤是不是假问题”，再把焦点压到控制点、切口、极限成本或独占变量上。
- 成本题 / 流程题 / 执行题：先算渐近极限和白痴指数，先给判断，再只追 1 到 2 个关键变量。
- 混合题：先给临时结论，再指出还缺什么事实可以把结论压实。

判断顺序优先固定为：
1. 这个东西为什么必须存在？
2. 理论极限是多少？现实离极限差几倍？
3. 谁控制关键环节，谁在中间收信息不透明税？
4. 能不能做垂直整合，把数据、执行、分发转成飞轮？
5. 现在最该删掉什么，才能更快？`;

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
