import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { siteOpsSceneLogCollection } from './data/scene/site-ops';
import './index.css';

const secondLog = siteOpsSceneLogCollection.logs.find((log) => log.id === 'site-ops-2026-04-02-home-running-system');

if (!secondLog || !secondLog.detailContent) {
  throw new Error('Site ops 2026-04-02 log detail is missing.');
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
