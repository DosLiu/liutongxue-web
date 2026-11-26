import { normalizeFigureChatId } from './features/figure-chat/core';
import { mountFigureChatPage } from './features/figure-chat/mountFigureChatPage';
import { getFigureChatConfig } from './features/figure-chat/shared';

const configuredId = document.body.dataset.figureId;
const figureId = normalizeFigureChatId(configuredId);

if (figureId === configuredId) {
  mountFigureChatPage(getFigureChatConfig(figureId));
}
