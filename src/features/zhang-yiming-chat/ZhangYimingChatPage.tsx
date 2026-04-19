import FigureChatPage from '../figure-chat/FigureChatPage';
import { getFigureChatConfig } from '../figure-chat/shared';

export default function ZhangYimingChatPage() {
  return <FigureChatPage config={getFigureChatConfig('zhang-yiming')} />;
}
