import React from 'react';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import ContentBlocks from '../components/ContentBlocks';
import { usePageMeta } from '../seo/usePageMeta';
import '../components/SiteChrome.css';

export default function LegalPage({ page }) {
  usePageMeta({ title: page.title, description: page.description, path: page.path });

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <h1>{page.h1}</h1>
        <p className="seo-meta">Dernière mise à jour : {page.updated}</p>
        <ContentBlocks blocks={page.content} />
      </main>
      <SiteFooter />
    </div>
  );
}
