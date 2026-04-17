import { buildSteveJobsMockReply, type SteveJobsChatApiResponse, type SteveJobsChatMode, type SteveJobsChatResolvedStatus } from './shared';

export const buildSteveJobsChatResponse = ({
  reply,
  mode,
  status,
  reason,
  shouldConsume
}: {
  reply: string;
  mode: SteveJobsChatMode;
  status: SteveJobsChatResolvedStatus;
  reason: string;
  shouldConsume: boolean;
}): SteveJobsChatApiResponse => ({
  reply,
  mode,
  status,
  reason,
  shouldConsume
});

export const buildSteveJobsChatMockResponse = (
  message: string,
  reason: string,
  status: SteveJobsChatResolvedStatus = 'mock'
): SteveJobsChatApiResponse =>
  buildSteveJobsChatResponse({
    reply: buildSteveJobsMockReply(message),
    mode: 'mock',
    status,
    reason,
    shouldConsume: false
  });

export const getSteveJobsChatHealthPayload = (hasApiKey: boolean): SteveJobsChatApiResponse =>
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
