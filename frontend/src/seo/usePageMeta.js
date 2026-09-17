import { useEffect } from 'react';
import { DEFAULT_SEO, SITE_URL, BRAND_NAME } from '../brand';

/**
 * Met à jour title, meta description, canonical et Open Graph.
 */
export function usePageMeta({
  title,
  description,
  path = '/',
  noIndex = false,
  type = 'website'
} = {}) {
  useEffect(() => {
    const fullTitle = title
      ? (title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`)
      : DEFAULT_SEO.title;
    const desc = description || DEFAULT_SEO.description;
    const url = `${SITE_URL}${path === '/' ? '' : path}`;

    document.title = fullTitle;

    const setMeta = (attr, key, value) => {
      if (!value) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', BRAND_NAME);
    setMeta('property', 'og:locale', 'fr_FR');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, path, noIndex, type]);
}
