import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogPlaceholderPage from './pages/SceneLogPlaceholderPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogPlaceholderPage
      title="AI原生数字居民"
      subtitle="这里将收纳 AI 原生数字居民的真实工作日志、阶段节点与长期生活轨迹。"
      archiveLabel="下一步可接入：日更记录、互动片段、长期观察与状态变化。"
    />
  </React.StrictMode>
);
