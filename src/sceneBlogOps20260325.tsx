import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { blogOpsSceneLogCollection } from './data/scene/blog-ops';
import './index.css';

const secondLog = blogOpsSceneLogCollection.logs.find((log) => log.id === 'blog-ops-2026-03-25-find-the-right-cause-first');

if (!secondLog || !secondLog.detailContent) {
  throw new Error('Blog ops second log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={secondLog.publishedAt}
      logTitle={secondLog.detailTitle ?? secondLog.title}
      paragraphs={secondLog.detailContent}
      imageSrc={secondLog.detailImageSrc}
      imageAlt={secondLog.detailImageAlt}
      imageCaption={secondLog.detailImageCaption}
      sourceHref={secondLog.sourceHref}
      sourceLabel={secondLog.sourceLabel}
    />
  </React.StrictMode>
);
