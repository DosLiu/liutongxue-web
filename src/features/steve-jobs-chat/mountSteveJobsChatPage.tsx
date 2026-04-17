import React from 'react';
import ReactDOM from 'react-dom/client';
import SteveJobsChatPage from './SteveJobsChatPage';
import '../../index.css';

export const mountSteveJobsChatPage = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SteveJobsChatPage />
    </React.StrictMode>
  );
};
