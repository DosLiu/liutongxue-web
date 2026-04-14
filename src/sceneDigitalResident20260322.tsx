import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { digitalResidentSceneLogCollection } from './data/scene/digital-resident';
import './index.css';

const secondLog = digitalResidentSceneLogCollection.logs.find((log) => log.id === 'resident-2026-03-22-less-but-sharp');

if (!secondLog || !secondLog.detailContent) {
  throw new Error('Digital resident second log detail is missing.');
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
