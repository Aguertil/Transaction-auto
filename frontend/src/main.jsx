import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const gaFromEnv = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
if (gaFromEnv.startsWith('G-') && !window.__GA_MEASUREMENT_ID__) {
  window.__GA_MEASUREMENT_ID__ = gaFromEnv;
}

// Réveille le serveur dès l'arrivée d'un visiteur (hébergement mis en veille
// après inactivité) : il est prêt quand le visiteur génère son document.
try {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  fetch(`${apiUrl}/api/health`, { mode: 'cors', cache: 'no-store' }).catch(() => {});
} catch {
  /* sans conséquence */
}

// Le HTML pré-rendu au build est remplacé par l'application interactive.
// (createRoot plutôt que hydrateRoot : évite les écarts SSR/navigateur liés
// à la session utilisateur et à la date du jour dans les formulaires.)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);




