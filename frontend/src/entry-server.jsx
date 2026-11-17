/**
 * Point d'entrée du pré-rendu (build uniquement — voir scripts/prerender.mjs).
 * Rend chaque page publique en HTML statique pour les moteurs de recherche.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { blogPosts } from './content/blogPosts';
import { seoPages } from './content/seoPages';
import { legalPages } from './content/legalPages';

/** Pages publiques à pré-rendre et à déclarer dans le sitemap. */
export const routes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/cerfa-15776', priority: '0.9', changefreq: 'monthly' },
  { path: '/documents-vente-vehicule', priority: '0.8', changefreq: 'monthly' },
  ...seoPages.map((p) => ({ path: p.path, priority: '0.8', changefreq: 'monthly' })),
  { path: '/blog', priority: '0.7', changefreq: 'weekly' },
  ...blogPosts.map((p) => ({
    path: `/blog/${p.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: p.updated || p.date
  })),
  ...legalPages.map((p) => ({ path: p.path, priority: '0.2', changefreq: 'yearly', noSitemap: false }))
];

export function render(url) {
  globalThis.__SSR_HEAD__ = {};
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
  const head = globalThis.__SSR_HEAD__;
  delete globalThis.__SSR_HEAD__;
  return { html, head };
}
