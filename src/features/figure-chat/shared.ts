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

export const buildElonMuskMockReply = (message: string) => {
  const shortMessage = message.trim();
  const compactMessage = shortMessage.slice(0, 40);
  const isAgentRaceQuestion =
    /(ai\s*agent|agent|智能体)/i.test(shortMessage) && /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线)/.test(shortMessage);
  const isStrategyQuestion = /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线|市场|行业)/.test(shortMessage);

  if (isAgentRaceQuestion) {
    return `所有人都在问“谁会赢”。问题错了。

正确的问题是：谁最接近把认知劳动压到零边际成本？现在的 Agent 离这个渐近极限还很远，白痴指数高得离谱——还需要人盯着、反复纠错、写一堆 prompt。

谁会赢？控制全栈的人。模型、工具链、用户界面、数据回流、分发入口，谁能尽量抓在自己手里，谁就赢。
每一层中间商都在收信息不透明税。能做垂直整合的人，会把飞轮越转越快。

先做能闭环的产品，再快速迭代。只卖一层壳和几段工作流的人，最后会被压成薄利润。`;
  }

  if (isStrategyQuestion) {
    return `先把问题改对。

你这句“${compactMessage}${shortMessage.length > 40 ? '…' : ''}”还是标签，不是变量。
真正该问的是：理论极限在哪里？谁控制关键环节？哪一层中间商在收信息不透明税？

我的默认判断很简单：能做垂直整合、能把数据和执行做成飞轮、能快速迭代的人会赢。
没有控制权，只是在替别人抬轿。`;
  }

  return `先别急着补一堆材料。

你这句“${compactMessage}${shortMessage.length > 40 ? '…' : ''}”更像现象，不是决定结果的变量。
从第一性原理看，先问三件事：它为什么必须存在？理论极限在哪里？中间哪层人在收信息不透明税？

我会先给判断，再跑五步算法：质疑需求，删除多余，简化，缩短迭代，再自动化。
缺数据不会让我闭嘴，只会让我告诉你下一步最该补哪一个变量。`;
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
