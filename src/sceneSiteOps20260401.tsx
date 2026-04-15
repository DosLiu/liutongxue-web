import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { siteOpsSceneLogCollection } from './data/scene/site-ops';
import './index.css';

const firstLog = siteOpsSceneLogCollection.logs.find((log) => log.id === 'site-ops-2026-04-01-team-roles-and-handoff-chain');

if (!firstLog || !firstLog.detailContent) {
  throw new Error('Site ops 2026-04-01 log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={firstLog.publishedAt}
      logTitle={firstLog.detailTitle ?? firstLog.title}
      paragraphs={firstLog.detailContent}
      imageSrc={firstLog.detailImageSrc}
      imageAlt={firstLog.detailImageAlt}
      imageCaption={firstLog.detailImageCaption}
      sourceHref={firstLog.sourceHref}
      sourceLabel={firstLog.sourceLabel}
    />
  </React.StrictMode>
);
