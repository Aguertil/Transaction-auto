/**
 * Google Analytics 4 (gtag)
 * L’ID est lu au runtime (évite que Vite supprime tout le code si la variable
 * est absente au build). Définir VITE_GA_MEASUREMENT_ID sur Render puis redeploy.
 */

function getGaId() {
  if (typeof window !== 'undefined' && window.__GA_MEASUREMENT_ID__) {
    const fromWindow = String(window.__GA_MEASUREMENT_ID__).trim();
    if (fromWindow && fromWindow.startsWith('G-')) return fromWindow;
  }
  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (fromEnv && String(fromEnv).trim().startsWith('G-')) {
    return String(fromEnv).trim();
  }
  return '';
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const GA_ID = getGaId();
  if (!GA_ID) {
    if (import.meta.env.DEV) {
      console.info('[analytics] VITE_GA_MEASUREMENT_ID manquant — tracking désactivé');
    }
    return;
  }
  if (window.__gaInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,
    send_page_view: false
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.__gaInitialized = true;
}

export function trackPageView(path, title) {
  if (typeof window === 'undefined' || !window.gtag) return;
  const GA_ID = getGaId();
  if (!GA_ID) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!getGaId()) return;
  window.gtag('event', name, params);
}

export function isAnalyticsEnabled() {
  return Boolean(getGaId());
}
