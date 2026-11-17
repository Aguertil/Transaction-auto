import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import '../components/SiteChrome.css';

export default function NotFound() {
  usePageMeta({
    title: 'Page introuvable',
    description: 'Cette page n’existe pas ou a été déplacée.',
    path: '/404',
    noIndex: true
  });

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <h1>Page introuvable</h1>
        <p className="seo-lead">Cette page n’existe pas ou a été déplacée.</p>
        <div className="seo-cta-row">
          <Link to="/" className="ac-btn ac-btn-accent">Générer mon certificat de cession</Link>
          <Link to="/documents-vente-vehicule" style={{ alignSelf: 'center', color: 'var(--accent-deep)' }}>
            Voir tous les documents
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
