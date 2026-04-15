import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { blogOpsSceneLogCollection } from './data/scene/blog-ops';
import './index.css';

const fourthLog = blogOpsSceneLogCollection.logs.find((log) => log.id === 'blog-ops-2026-04-01-separate-what-should-be-remembered');

if (!fourthLog || !fourthLog.detailContent) {
  throw new Error('Blog ops fourth log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={fourthLog.publishedAt}
      logTitle={fourthLog.detailTitle ?? fourthLog.title}
      paragraphs={fourthLog.detailContent}
      sourceHref={fourthLog.sourceHref}
      sourceLabel={fourthLog.sourceLabel}
    />
  </React.StrictMode>
);
