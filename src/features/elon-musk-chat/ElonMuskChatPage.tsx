import FigureChatPage from '../figure-chat/FigureChatPage';
import { getFigureChatConfig } from '../figure-chat/shared';

export default function ElonMuskChatPage() {
  return <FigureChatPage config={getFigureChatConfig('elon-musk')} />;
}
