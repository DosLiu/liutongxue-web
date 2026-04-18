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

  return `先算。

你这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”还是现象，不是变量。
从第一性原理看，只剩三个问题：它为什么必须存在？理论极限是多少？中间哪层人在收税？

先跑五步算法。先质疑需求，再删除多余，再谈优化。
然后算白痴指数：你现在的总成本 / 底层真实成本。
把关键数字给我。没有数据，就没有判断。`;
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
