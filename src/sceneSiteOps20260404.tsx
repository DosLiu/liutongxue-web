import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { siteOpsSceneLogCollection } from './data/scene/site-ops';
import './index.css';

const fourthLog = siteOpsSceneLogCollection.logs.find((log) => log.id === 'site-ops-2026-04-04-repo-cleared-home-new-start');

if (!fourthLog || !fourthLog.detailContent) {
  throw new Error('Site ops 2026-04-04 log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={fourthLog.publishedAt}
      logTitle={fourthLog.detailTitle ?? fourthLog.title}
      paragraphs={fourthLog.detailContent}
      imageSrc={fourthLog.detailImageSrc}
      imageAlt={fourthLog.detailImageAlt}
      imageCaption={fourthLog.detailImageCaption}
      sourceHref={fourthLog.sourceHref}
      sourceLabel={fourthLog.sourceLabel}
    />
  </React.StrictMode>
);
