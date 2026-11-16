import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import ContentBlocks, { FaqList, faqJsonLd, breadcrumbJsonLd, JsonLd, RichText } from '../components/ContentBlocks';
import { usePageMeta } from '../seo/usePageMeta';
import { SITE_URL, BRAND_NAME } from '../brand';
import '../components/SiteChrome.css';

/**
 * Page « document » générique (contrat, facture, mandat…), pilotée par
 * src/content/seoPages.js.
 */
export default function SeoDocPage({ page }) {
  usePageMeta({
    title: page.title,
    description: page.description,
    path: page.path
  });

  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${page.h1} — ${BRAND_NAME}`,
    url: `${SITE_URL}${page.path}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr-FR',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL }
  };

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <JsonLd data={appLd} />
        <JsonLd
          data={breadcrumbJsonLd(SITE_URL, [
            { name: 'Accueil', path: '/' },
            { name: 'Documents', path: '/documents-vente-vehicule' },
            { name: page.breadcrumb, path: page.path }
          ])}
        />
        {page.faq && <JsonLd data={faqJsonLd(page.faq)} />}

        <p className="seo-meta">
          <Link to="/">Accueil</Link> › <Link to="/documents-vente-vehicule">Documents</Link> › {page.breadcrumb}
        </p>
        <h1>{page.h1}</h1>
        <p className="seo-lead"><RichText text={page.lead} /></p>

        <div className="seo-cta-row">
          <Link to={page.cta.to} className="ac-btn ac-btn-accent">{page.cta.label}</Link>
          {page.cta2 && (
            <Link to={page.cta2.to} style={{ alignSelf: 'center', color: 'var(--accent-deep)' }}>
              {page.cta2.label}
            </Link>
          )}
        </div>

        <ContentBlocks blocks={page.content} />

        {page.faq && (
          <>
            <h2>Questions fréquentes</h2>
            <FaqList faq={page.faq} />
          </>
        )}

        <div className="seo-cta-row">
          <Link to={page.cta.to} className="ac-btn ac-btn-accent">{page.cta.label}</Link>
        </div>

        {page.related && (
          <>
            <h2>Pour aller plus loin</h2>
            <div className="seo-card-grid">
              {page.related.map((r) => (
                <Link key={r.to} to={r.to} className="seo-card">
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
