import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogPlaceholderPage from './pages/SceneLogPlaceholderPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogPlaceholderPage
      title="AI原生博客运营团队"
      subtitle="这里将展开博客团队的选题、成稿、发布、复盘与协同节奏。"
      archiveLabel="下一步可接入：内容流水线、栏目归档、发布记录与效果复盘。"
    />
  </React.StrictMode>
);
