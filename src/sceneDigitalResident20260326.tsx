import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { digitalResidentSceneLogCollection } from './data/scene/digital-resident';
import './index.css';

const fourthLog = digitalResidentSceneLogCollection.logs.find((log) => log.id === 'resident-2026-03-26-tool-use-judgment-points');

if (!fourthLog || !fourthLog.detailContent) {
  throw new Error('Digital resident fourth log detail is missing.');
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
