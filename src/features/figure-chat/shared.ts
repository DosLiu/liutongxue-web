export type FigureChatId = 'steve-jobs' | 'elon-musk';
export type FigureChatRole = 'assistant' | 'user';
export type FigureChatMode = 'api' | 'mock';
export type FigureChatServiceStatus = 'checking' | 'api' | 'mock' | 'offline' | 'preview';
export type FigureChatResolvedStatus = Exclude<FigureChatServiceStatus, 'checking'>;

export type FigureChatApiResponse = {
  reply: string;
  mode?: FigureChatMode;
  status?: FigureChatResolvedStatus;
  reason?: string;
  shouldConsume?: boolean;
};

export type FigureChatConfig = {
  id: FigureChatId;
  title: string;
  description: string;
  assistantLabel: string;
  panelAriaLabel: string;
  storageKey: string;
  freeLimit: number;
  buildMockReply: (message: string) => string;
};

const FIGURE_CHAT_FREE_LIMIT = 5;

export const buildSteveJobsMockReply = (message: string) => {
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

const normalizeElonCanonicalMessage = (message: string) =>
  message
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[“”‘’"'`~!！?？,，。．、:：;；()（）\[\]{}<>《》…·—-]/g, '');

const ELON_MUSK_AGENT_RACE_CANONICAL_REPLY = `所有人都在问「谁会赢」。错误的问题。

正确的问题：Agent的渐近极限是什么？
一个完美的Agent，理论上应该能零边际成本完成任何认知劳动。
现在的白痴指数大概100以上——需要人盯着、反复纠正、
精心设计prompt。中间有巨大改进空间。

谁会赢？控制全栈的人。

看Tesla的逻辑：不是一家「做电动车的公司」。
我们控制电池、芯片、软件、充电网络、数据收集。
每卖一辆车，自动驾驶数据就多一份。飞轮。

AI Agent也一样。
谁同时控制模型、工具链、用户界面和数据？谁就赢。
每一层中间商都是在收信息不透明税。`;

const ELON_MUSK_CROWDED_STARTUP_CANONICAL_REPLY = `你在用类比思维。
「别人在做所以我不该做」——最蠢的推理方式。

2002年我创办SpaceX，波音和洛马已经做了几十年火箭。
所有人说「没机会了」。
他们把「现有玩家多」等同于「问题已解决」。

先算渐近极限。
现在用户完成一个任务需要多少步骤？
物理定律允许的最少步骤是多少？差距多大？

差距10倍，说明所有人都在同一个错误假设上做渐进改进。
就像所有火箭公司都假设火箭是一次性的。

你不需要做一个「更好的X」。
你需要找到那个所有人都接受但物理上不必要的假设，
然后消灭它。

先做一个会失败的版本。明天。不是下个月。`;

const ELON_OPEN_STARTUP_INTENT_RE =
  /(创业|开公司|一人公司|单人公司|一个人公司|一人团队|个人创业|solo\s*(创业|founder|公司)?|独立创业|自己干|单干|个体|做跨境电商|做出海|做亚马逊|做shopify|做独立站|做[^，。！？\n]{0,12}(方向|项目|生意|赛道|品类|业务)?)/i;
const ELON_OPEN_STARTUP_VERDICT_RE = /(感觉怎么样|你觉得怎么样|值不值得(做|搞)?|能不能做|可不可行|行不行|靠不靠谱|有没?有前途|适不适合|对不对|好不好|怎么样)/;
const ELON_CROSS_BORDER_TOPIC_RE = /(跨境电商|出海电商|独立站|shopify|亚马逊|amazon|temu|shopee|etsy)/i;

const isElonOpenStartupDirectionQuestion = (message: string) =>
  ELON_OPEN_STARTUP_INTENT_RE.test(message) && ELON_OPEN_STARTUP_VERDICT_RE.test(message);

const buildElonOpenStartupReply = (message: string) => {
  if (ELON_CROSS_BORDER_TOPIC_RE.test(message)) {
    return `先把“跨境电商”这四个字拆了。它不是方向，它只是渠道。

一人公司做这件事，最危险的不是累，而是你卖的货任何人都能上，广告任何人都能投，物流任何人都能买。那你不是在创业，你只是在替平台搬砖。这像想一个人盯一整条装配线，订单一多，先崩的是你，不是系统。

这事只有一种做法值得试：SKU 极少，毛利够厚，而且内容、选品或供应链里至少有一项是你能亲手卡住的。没有这个钩子，就别碰。

先拿一个极窄品类跑出 10 个复购用户。跑不出来，就说明你做的不是生意，只是一个幻觉。`;
  }

  return `先把“创业”这个词砍掉。真正的问题不是你想不想做，而是这个系统能不能不靠你亲自搬运还成立。

如果一个方向要你同时扛销售、交付、客服和履约，那所谓一人公司只是把四份工作绑在一个人身上。那不是 leverage，这像让一个人盯整座工厂的所有仪表盘，迟早会爆。

能做的方向，必须让软件、内容或供应链替你放大，而不是让你自己去补窟窿。至少有一个环节，你要能把速度、成本或转化率拉开 10 倍。

先做一个最小交易闭环。有人持续付钱，再谈公司。`;
};

export const resolveElonMuskCanonicalReply = (message: string) => {
  const normalized = normalizeElonCanonicalMessage(message);
  const isAgentRaceQuestion =
    (normalized.includes('aiagent') || normalized.includes('agent') || normalized.includes('智能体')) &&
    normalized.includes('赛道这么热') &&
    normalized.includes('谁会赢');
  const isCrowdedStartupQuestion =
    normalized.includes('我想创业') &&
    (normalized.includes('市场上已经有太多人在做了') ||
      normalized.includes('已经有太多人在做了') ||
      normalized.includes('太多人在做了'));

  if (isAgentRaceQuestion) {
    return ELON_MUSK_AGENT_RACE_CANONICAL_REPLY;
  }

  if (isCrowdedStartupQuestion) {
    return ELON_MUSK_CROWDED_STARTUP_CANONICAL_REPLY;
  }

  return null;
};

export const buildElonMuskMockReply = (message: string) => {
  const canonicalReply = resolveElonMuskCanonicalReply(message);

  if (canonicalReply) {
    return canonicalReply;
  }

  const shortMessage = message.trim();
  const compactMessage = clipElonPrompt(shortMessage);
  const isAgentRaceQuestion =
    /(ai\s*agent|agent|智能体)/i.test(shortMessage) && /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线)/.test(shortMessage);
  const isCrowdedMarketQuestion =
    /(创业|做产品|做项目|入场|开始做|切入)/.test(shortMessage) &&
    /(太多人|很多人|已经有太多人|已经很多人|都在做|竞争太激烈|竞争激烈|红海|饱和|太卷)/.test(shortMessage);
  const isOpenStartupDirectionQuestion = isElonOpenStartupDirectionQuestion(shortMessage);
  const isStrategyQuestion = /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线|市场|行业)/.test(shortMessage);

  if (isAgentRaceQuestion) {
    return `热度不重要。Agent 还远没到渐近极限。

现在谁的 logo 更响没意义，关键是哪个系统能把模型、工具链、界面、数据和分发连成闭环。Tesla 不是赢在“大家都喜欢电动车”，而是赢在关键部件尽量自己抓。

谁能持续收回执行反馈，谁就能把白痴指数往下打。剩下那些只包一层皮的公司，最后会像代工厂外面的广告牌。`;
  }

  if (isCrowdedMarketQuestion) {
    return `玩家多，通常只说明钱还在地上，不说明问题被解决。

先看用户今天到底要走多少步，再看物理上最少能压到多少步。差距还大，说明所有人都还在同一个错误假设里绕圈。

这和火箭行业一样。看上去拥挤，只是因为所有人都默认火箭应该一次性报废。别做一个“差不多的版本”，去把那个不必要的假设炸掉。`;
  }

  if (isOpenStartupDirectionQuestion) {
    return buildElonOpenStartupReply(shortMessage);
  }

  if (isStrategyQuestion) {
    return `大词没有价值。

“${compactMessage}”这种问法还停在标签层，不在变量层。我先看哪一层最重、哪一层最蠢、哪一层本来就该被删掉。

工厂不会因为墙上写着“智能化”就更高效；少一道搬运，少一次人工确认，系统才真的变快。所以先打穿最贵的摩擦点，再谈格局。`;
  }

  return `先别盯着表面现象。

“${compactMessage}”不是结论，它只是症状。我会先问这个东西为什么必须存在，再看理论极限在哪里，然后把中间多出来的环节一层层砍掉。

如果一个流程离最优值还差很远，里面通常堆满了人为摩擦。先把最硬的瓶颈打穿，再决定要不要继续做。`;
};

const figureChatConfigs: Record<FigureChatId, FigureChatConfig> = {
  'steve-jobs': {
    id: 'steve-jobs',
    title: '乔布斯',
    description: '一个轻量化具身AI乔布斯 不保存聊天记录，每台设备可免费发送 5 条消息',
    assistantLabel: '虚拟乔布斯',
    panelAriaLabel: '虚拟乔布斯对话区域',
    storageKey: 'liutongxue-jobs-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildSteveJobsMockReply
  },
  'elon-musk': {
    id: 'elon-musk',
    title: '马斯克',
    description: '一个轻量化具身AI马斯克 不保存聊天记录，每台设备可免费发送 5 条消息',
    assistantLabel: '虚拟马斯克',
    panelAriaLabel: '虚拟马斯克对话区域',
    storageKey: 'liutongxue-elon-musk-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildElonMuskMockReply
  }
};

export const getFigureChatConfig = (id: FigureChatId) => figureChatConfigs[id];

export const resolveFigureChatServiceStatus = (
  status?: FigureChatApiResponse['status'],
  mode?: FigureChatApiResponse['mode'],
  fallbackStatus: FigureChatResolvedStatus = 'offline'
): FigureChatResolvedStatus => {
  if (status === 'api' || status === 'mock' || status === 'offline' || status === 'preview') {
    return status;
  }

  if (mode === 'api') {
    return 'api';
  }

  if (mode === 'mock') {
    return 'mock';
  }

  return fallbackStatus;
};
