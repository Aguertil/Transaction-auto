import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getConsent, setConsent, initAnalytics, trackPageView, isAnalyticsEnabled } from '../seo/analytics';

/**
 * Bandeau de consentement : la mesure d'audience (GA4) n'est chargée
 * qu'après « Accepter ». Refuser est aussi simple qu'accepter (exigence CNIL).
 * Le lien « Gérer les cookies » du pied de page rouvre le bandeau.
 */
export default function CookieBanner() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAnalyticsEnabled()) return undefined;
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener('adv-open-cookie-banner', reopen);
    return () => window.removeEventListener('adv-open-cookie-banner', reopen);
  }, []);

  if (!open) return null;

  const choose = (value) => {
    setConsent(value);
    setOpen(false);
    if (value === 'granted') {
      initAnalytics();
      trackPageView(`${location.pathname}${location.search}`, document.title);
    }
  };

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookies">
      <p>
        Nous utilisons des cookies de mesure d’audience pour améliorer le site. Aucun cookie publicitaire.{' '}
        <Link to="/confidentialite">En savoir plus</Link>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="ac-btn ac-btn-outline cookie-btn" onClick={() => choose('denied')}>
          Refuser
        </button>
        <button type="button" className="ac-btn ac-btn-accent cookie-btn" onClick={() => choose('granted')}>
          Accepter
        </button>
      </div>
    </div>
  );
}

export function openCookieBanner() {
  window.dispatchEvent(new Event('adv-open-cookie-banner'));
}
