import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { blogOpsSceneLogCollection } from './data/scene/blog-ops';
import './index.css';

const thirdLog = blogOpsSceneLogCollection.logs.find((log) => log.id === 'blog-ops-2026-03-25-keep-the-draft-flow-steady');

if (!thirdLog || !thirdLog.detailContent) {
  throw new Error('Blog ops third log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={thirdLog.publishedAt}
      logTitle={thirdLog.detailTitle ?? thirdLog.title}
      paragraphs={thirdLog.detailContent}
      imageSrc={thirdLog.detailImageSrc}
      imageAlt={thirdLog.detailImageAlt}
      imageCaption={thirdLog.detailImageCaption}
      sourceHref={thirdLog.sourceHref}
      sourceLabel={thirdLog.sourceLabel}
    />
  </React.StrictMode>
);
