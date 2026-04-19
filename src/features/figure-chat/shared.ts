import {
  buildElonMuskMockReply,
  buildFigureChatResponse,
  buildFigureChatMockResponse,
  buildSteveJobsMockReply,
  buildZhangYimingMockReply,
  getFigureChatHealthPayload,
  getFigureChatModelDefinition,
  polishZhangYimingReply,
  resolveElonMuskDirectReply,
  resolveFigureChatDirectReply,
  resolveFigureChatServiceStatus,
  resolveZhangYimingDirectReply,
  type FigureChatApiResponse,
  type FigureChatId,
  type FigureChatMode,
  type FigureChatResolvedStatus,
  type FigureChatRole,
  type FigureChatServiceStatus,
  type FigureDirectReply,
  type IncomingMessage,
  type RequestBody
} from './core';

export type {
  FigureChatApiResponse,
  FigureChatId,
  FigureChatMode,
  FigureChatResolvedStatus,
  FigureChatRole,
  FigureChatServiceStatus,
  FigureDirectReply,
  IncomingMessage,
  RequestBody
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
  },
  'zhang-yiming': {
    id: 'zhang-yiming',
    title: '张一鸣',
    description: '一个轻量化具身AI张一鸣 不保存聊天记录，每台设备可免费发送 5 条消息',
    assistantLabel: '虚拟张一鸣',
    panelAriaLabel: '虚拟张一鸣对话区域',
    storageKey: 'liutongxue-zhang-yiming-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildZhangYimingMockReply
  }
};

export const getFigureChatConfig = (id: FigureChatId) => figureChatConfigs[id];

export const resolveElonMuskCanonicalReply = (message: string) => resolveElonMuskDirectReply(message)?.reply ?? null;
export const resolveZhangYimingCanonicalReply = (message: string) => resolveZhangYimingDirectReply(message)?.reply ?? null;

export {
  buildElonMuskMockReply,
  buildFigureChatResponse,
  buildFigureChatMockResponse,
  buildSteveJobsMockReply,
  buildZhangYimingMockReply,
  getFigureChatHealthPayload,
  getFigureChatModelDefinition,
  polishZhangYimingReply,
  resolveFigureChatDirectReply,
  resolveFigureChatServiceStatus
};
