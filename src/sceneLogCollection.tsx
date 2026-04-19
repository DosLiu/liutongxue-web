import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneTeamLogPage from './pages/SceneTeamLogPage';
import { resolveSceneLogCollectionRoute } from './data/scene';
import './index.css';

const route = resolveSceneLogCollectionRoute(window.location.pathname);

if (!route) {
  throw new Error(`Unknown scene log collection route: ${window.location.pathname}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneTeamLogPage sceneKey={route.sceneKey} />
  </React.StrictMode>
);
