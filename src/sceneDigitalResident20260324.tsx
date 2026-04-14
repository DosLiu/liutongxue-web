import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { digitalResidentSceneLogCollection } from './data/scene/digital-resident';
import './index.css';

const thirdLog = digitalResidentSceneLogCollection.logs.find((log) => log.id === 'resident-2026-03-24-memory-governance');

if (!thirdLog || !thirdLog.detailContent) {
  throw new Error('Digital resident third log detail is missing.');
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
