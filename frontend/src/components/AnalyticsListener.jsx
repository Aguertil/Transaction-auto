import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../seo/analytics';

/**
 * Initialise GA4 et envoie un page_view à chaque navigation SPA.
 */
export default function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
    // Premier page_view après init (titre parfois mis à jour juste après)
    const path = `${location.pathname}${location.search}`;
    const t = window.setTimeout(() => {
      trackPageView(path, document.title);
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once on mount
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackPageView(path, document.title);
  }, [location.pathname, location.search]);

  return null;
}
