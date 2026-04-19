import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneLogDetailPage from './pages/SceneLogDetailPage';
import { getSceneLogByPublishedAt, resolveSceneLogDetailRoute } from './data/scene';
import './index.css';

const route = resolveSceneLogDetailRoute(window.location.pathname);

if (!route) {
  throw new Error(`Unknown scene log detail route: ${window.location.pathname}`);
}

const log = getSceneLogByPublishedAt(route.sceneKey, route.publishedAt);

if (!log || !log.detailContent) {
  throw new Error(`Scene log detail is missing: ${route.sceneKey} ${route.publishedAt}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneLogDetailPage
      logDate={log.publishedAt}
      logTitle={log.detailTitle ?? log.title}
      paragraphs={log.detailContent}
      imageSrc={log.detailImageSrc}
      imageAlt={log.detailImageAlt}
      imageCaption={log.detailImageCaption}
      sourceHref={log.sourceHref}
      sourceLabel={log.sourceLabel}
    />
  </React.StrictMode>
);
