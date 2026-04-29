import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneTeamLogPage from './pages/SceneTeamLogPage';
import { resolveSceneLogCollectionRoute } from './data/scene';
import { loadSceneLogCollection } from './data/scene/runtime';
import './index.css';

async function mount() {
  const route = resolveSceneLogCollectionRoute(window.location.pathname);

  if (!route) {
    throw new Error(`Unknown scene log collection route: ${window.location.pathname}`);
  }

  const collection = await loadSceneLogCollection(route.sceneKey);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SceneTeamLogPage collection={collection} />
    </React.StrictMode>
  );
}

void mount();
