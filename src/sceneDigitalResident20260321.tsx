import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { digitalResidentSceneLogCollection } from './data/scene/digital-resident';
import { sitePaths } from './site';
import './index.css';

const firstLog = digitalResidentSceneLogCollection.logs.find((log) => log.id === 'resident-2026-03-21-platform-activation');

if (!firstLog || !firstLog.detailContent) {
  throw new Error('Digital resident first log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      teamTitle={digitalResidentSceneLogCollection.title}
      teamHref={sitePaths.sceneLogs.digitalResident}
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
