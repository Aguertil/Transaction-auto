import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const gaFromEnv = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
if (gaFromEnv.startsWith('G-') && !window.__GA_MEASUREMENT_ID__) {
  window.__GA_MEASUREMENT_ID__ = gaFromEnv;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);




