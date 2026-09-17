import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import { getPostBySlug, blogPosts } from '../content/blogPosts';
import { SITE_URL } from '../brand';
import '../components/SiteChrome.css';

function Block({ block }) {
  if (block.type === 'h2') return <h2>{block.text}</h2>;
  if (block.type === 'h3') return <h3>{block.text}</h3>;
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'ol') {
    return (
      <ol>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }
  return null;
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  usePageMeta({
    title: post?.title,
    description: post?.description,
    path: post ? `/blog/${post.slug}` : '/blog',
    type: 'article',
    noIndex: !post
  });

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'ActeDeVente.fr' },
    publisher: { '@type': 'Organization', name: 'ActeDeVente.fr' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
  };

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <p className="seo-meta">
          <Link to="/blog">Blog</Link>
          {' · '}
          {new Date(post.date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <h1>{post.title}</h1>
        <p className="seo-lead">{post.description}</p>

        {post.content.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        <div className="seo-cta-row">
          <Link to="/#cerfa" className="ac-btn ac-btn-accent">
            Générer le CERFA 15776
          </Link>
          <Link to="/register" className="ac-btn ac-btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}>
            Créer un compte
          </Link>
        </div>

        {related.length > 0 && (
          <>
            <h2>À lire aussi</h2>
            <div className="seo-card-grid">
              {related.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="seo-card">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
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
