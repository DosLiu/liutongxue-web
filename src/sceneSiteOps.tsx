import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogPlaceholderPage from './pages/SceneLogPlaceholderPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogPlaceholderPage
      title="AI原生建站运营团队"
      subtitle="这里将补齐建站运营团队的需求流、迭代记录、上线过程与维护节奏。"
      archiveLabel="下一步可接入：版本历史、需求池、交付节点与协同纪要。"
    />
  </React.StrictMode>
);
