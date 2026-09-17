import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import { blogPosts } from '../content/blogPosts';
import '../components/SiteChrome.css';

export default function BlogIndex() {
  usePageMeta({
    title: 'Blog — guides CERFA et vente de véhicules',
    description:
      'Guides pratiques ActeDeVente.fr : CERFA 15776, documents pro/particulier, quitus fiscal et bonnes pratiques de cession.',
    path: '/blog'
  });

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main seo-main-wide">
        <h1>Blog ActeDeVente.fr</h1>
        <p className="seo-lead">
          Guides pour remplir vos CERFA, comprendre les documents de vente et sécuriser vos cessions de véhicules.
        </p>
        <div className="seo-card-grid">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="seo-card">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <p className="seo-meta" style={{ marginTop: '0.75rem' }}>
                {new Date(post.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
