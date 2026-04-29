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
  notice: string;
  quotaHint: string;
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
    title: 'AI 乔布斯人物对话实验',
    description: '与一个受 Steve Jobs 公开表达风格启发的数字角色讨论产品定义、设计判断、用户体验与创新方法。',
    notice: '非官方、风格化数字角色，仅用于启发式对话，不代表乔布斯本人或其团队立场。',
    quotaHint: '先体验 5 次，登录后每日 10 次；不保存聊天记录。',
    assistantLabel: 'AI 乔布斯',
    panelAriaLabel: 'AI 乔布斯人物对话实验对话区域',
    storageKey: 'liutongxue-jobs-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildSteveJobsMockReply
  },
  'elon-musk': {
    id: 'elon-musk',
    title: 'AI 马斯克人物对话实验',
    description: '与一个受 Elon Musk 公开表达风格启发的数字角色讨论第一性原理、工程决策、创业判断与未来产业。',
    notice: '非官方、风格化数字角色，仅用于启发式对话，不代表马斯克本人或其团队立场。',
    quotaHint: '先体验 5 次，登录后每日 10 次；不保存聊天记录。',
    assistantLabel: 'AI 马斯克',
    panelAriaLabel: 'AI 马斯克人物对话实验对话区域',
    storageKey: 'liutongxue-elon-musk-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildElonMuskMockReply
  },
  'zhang-yiming': {
    id: 'zhang-yiming',
    title: 'AI 张一鸣人物对话实验',
    description: '与一个受张一鸣公开表达风格启发的数字角色讨论产品增长、组织效率、管理方法与全球化判断。',
    notice: '非官方、风格化数字角色，仅用于启发式对话，不代表张一鸣本人或其团队立场。',
    quotaHint: '先体验 5 次，登录后每日 10 次；不保存聊天记录。',
    assistantLabel: 'AI 张一鸣',
    panelAriaLabel: 'AI 张一鸣人物对话实验对话区域',
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
