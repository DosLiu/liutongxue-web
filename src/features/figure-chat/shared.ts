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

export const buildElonMuskMockReply = (message: string) => {
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
