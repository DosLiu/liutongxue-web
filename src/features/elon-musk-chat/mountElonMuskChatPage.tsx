import { mountFigureChatPage } from '../figure-chat/mountFigureChatPage';
import { getFigureChatConfig } from '../figure-chat/shared';

export const mountElonMuskChatPage = () => {
  mountFigureChatPage(getFigureChatConfig('elon-musk'));
};
