import React from 'react';
import ReactDOM from 'react-dom/client';
import SteveJobsChatPage from '../pages/SteveJobsChatPage';
import '../index.css';

export const renderSteveJobsChatPage = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SteveJobsChatPage />
    </React.StrictMode>
  );
};
