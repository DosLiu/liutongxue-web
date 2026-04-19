import { mountFigureChatPage } from '../figure-chat/mountFigureChatPage';
import { getFigureChatConfig } from '../figure-chat/shared';

export const mountZhangYimingChatPage = () => {
  mountFigureChatPage(getFigureChatConfig('zhang-yiming'));
};
