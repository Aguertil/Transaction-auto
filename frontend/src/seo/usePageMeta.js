import { useEffect } from 'react';
import { DEFAULT_SEO, SITE_URL, BRAND_NAME } from '../brand';

/**
 * Calcule les balises SEO d'une page.
 */
export function buildPageMeta({
  title,
  description,
  path = '/',
  noIndex = false,
  type = 'website',
  image
} = {}) {
  const fullTitle = title
    ? (title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`)
    : DEFAULT_SEO.title;
  return {
    title: fullTitle,
    description: description || DEFAULT_SEO.description,
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    type,
    image: image || DEFAULT_SEO.ogImage
  };
}

/**
 * Met à jour title, meta description, canonical et Open Graph.
 *
 * Pendant le pré-rendu (scripts/prerender.mjs), les effets React ne
 * s'exécutent pas : les valeurs sont alors déposées dans
 * globalThis.__SSR_HEAD__ pour être écrites directement dans le HTML.
 */
export function usePageMeta(options = {}) {
  const { title, description, path = '/', noIndex = false, type = 'website', image } = options;

  if (typeof window === 'undefined' && globalThis.__SSR_HEAD__) {
    Object.assign(globalThis.__SSR_HEAD__, buildPageMeta(options));
  }

  useEffect(() => {
    const meta = buildPageMeta({ title, description, path, noIndex, type, image });

    document.title = meta.title;

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

    setMeta('name', 'description', meta.description);
    setMeta('name', 'robots', meta.robots);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'og:url', meta.url);
    setMeta('property', 'og:type', meta.type);
    setMeta('property', 'og:image', meta.image);
    setMeta('property', 'og:site_name', BRAND_NAME);
    setMeta('property', 'og:locale', 'fr_FR');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', meta.title);
    setMeta('name', 'twitter:description', meta.description);
    setMeta('name', 'twitter:image', meta.image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (noIndex) {
      // Pas de canonical sur une page non indexable (404, connexion…)
      if (canonical) canonical.remove();
      return;
    }
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.url);
  }, [title, description, path, noIndex, type, image]);
}
