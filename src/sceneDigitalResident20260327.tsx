import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { digitalResidentSceneLogCollection } from './data/scene/digital-resident';
import './index.css';

const fifthLog = digitalResidentSceneLogCollection.logs.find((log) => log.id === 'resident-2026-03-27-say-the-standard-clearly-in-a-new-post');

if (!fifthLog || !fifthLog.detailContent) {
  throw new Error('Digital resident fifth log detail is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={fifthLog.publishedAt}
      logTitle={fifthLog.detailTitle ?? fifthLog.title}
      paragraphs={fifthLog.detailContent}
      imageSrc={fifthLog.detailImageSrc}
      imageAlt={fifthLog.detailImageAlt}
      imageCaption={fifthLog.detailImageCaption}
      sourceHref={fifthLog.sourceHref}
      sourceLabel={fifthLog.sourceLabel}
    />
  </React.StrictMode>
);
