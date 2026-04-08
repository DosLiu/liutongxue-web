import React from 'react';
import ReactDOM from 'react-dom/client';
import SceneTeamLogPage from './pages/SceneTeamLogPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SceneTeamLogPage sceneKey="blogOps" />
  </React.StrictMode>
);
