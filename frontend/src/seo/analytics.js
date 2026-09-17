/**
 * Google Analytics 4 (gtag)
 * Active si VITE_GA_MEASUREMENT_ID est défini (ex. G-XXXXXXXXXX)
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function initAnalytics() {
  if (!GA_ID || typeof window === 'undefined') return;
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
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
}

export function trackEvent(name, params = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

export function isAnalyticsEnabled() {
  return Boolean(GA_ID);
}
