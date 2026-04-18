import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../index.css';
import FigureChatPage from './FigureChatPage';
import { type FigureChatConfig } from './shared';

export const mountFigureChatPage = (config: FigureChatConfig) => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <FigureChatPage config={config} />
    </React.StrictMode>
  );
};
