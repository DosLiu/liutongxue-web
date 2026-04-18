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

const clipElonPrompt = (message: string, max = 32) => {
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
    return `所有人都在问「谁会赢」。错误的问题。

正确的问题是：Agent的渐近极限是什么？

一个完美的AI Agent，理论上应该能做到什么？答案：零边际成本地完成任何认知劳动。输入一个目标，输出结果。中间不需要人。

现在离这个极限有多远？非常远。白痴指数大概在100以上。现有的Agent需要人在旁边盯着、需要反复纠正、需要精心设计prompt。这说明什么？说明中间有巨大的改进空间。

谁会赢？控制全栈的人。

看Tesla的逻辑：我们不是一家「做电动车的公司」。我们控制电池、芯片、软件、充电网络、数据收集。每卖一辆车，自动驾驶数据就多一份。飞轮效应。

AI Agent也一样。谁同时控制模型、工具链、用户界面和数据？谁就赢。

如果是我？我会垂直整合。自己做模型推理、自己做执行环境、自己收集反馈数据。不依赖任何中间层。每一层中间商都是在收信息不透明税。`;
  }

  if (isCrowdedMarketQuestion) {
    return `你在用类比思维。「别人在做所以我不该做」——这是我最鄙视的推理方式。

2002年我创办SpaceX的时候，波音和洛克希德·马丁已经做了几十年火箭。每个人都告诉我：「火箭行业已经很成熟了，没有机会了。」

他们错在哪？他们把「现有玩家很多」等同于「问题已被解决」。

先算渐近极限。现在的AI应用，用户完成一个任务需要多少步骤？物理定律允许的最少步骤是多少？差距有多大？

如果差距是10倍，说明现有玩家全是在同一个错误假设上做渐进式改进。就像所有火箭公司都假设火箭是一次性的。没人质疑这个假设，因为「一直都是这样做的」。

你不需要做一个「更好的AI应用」。你需要找到那个所有人都接受但物理上不必要的假设，然后消灭它。

你可能会失败。SpaceX前三枚火箭都炸了。但我从每次爆炸中学到的比在PPT里规划十年学到的多。

先做一个会失败的版本。明天。不是下个月。`;
  }

  if (isStrategyQuestion) {
    return `先别被热词带着跑。

“${compactMessage}”如果只是标签，不是变量，就没有分析价值。
我会先看渐近极限，再看白痴指数，再看谁控制关键环节。
如果供应链或平台中间隔了很多层，那些层都在收信息不透明税。
能做垂直整合、把数据、执行、分发做成飞轮的人，通常会赢。`;
  }

  return `先算。

“${compactMessage}”先别当结论。当输入。
先问三个问题：这个东西为什么必须存在？理论极限是多少？谁在中间收信息不透明税？
如果现实离物理定律允许的最优值差了5倍以上，中间就一定有大量可消除的浪费。
然后跑五步算法：质疑需求，删除，简化优化，加速，自动化。
优化一个不该存在的东西，是最常见的工程错误。`;
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
