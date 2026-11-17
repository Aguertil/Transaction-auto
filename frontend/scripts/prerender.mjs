/**
 * Pré-rendu statique après `vite build` :
 *  - écrit dist/<route>/index.html avec le contenu, le title, la description,
 *    la canonical et l'Open Graph propres à chaque page ;
 *  - écrit dist/404.html (servi par Render pour les URL inconnues) ;
 *  - génère dist/sitemap.xml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE_URL = 'https://www.actedevente.fr';

const { render, routes } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headTags(h) {
  return [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<meta name="robots" content="${esc(h.robots)}" />`,
    h.robots.startsWith('noindex') ? '' : `<link rel="canonical" href="${esc(h.url)}" />`,
    `<meta property="og:type" content="${esc(h.type)}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:site_name" content="ActeDeVente.fr" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${esc(h.url)}" />`,
    `<meta property="og:image" content="${esc(h.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    `<meta name="twitter:image" content="${esc(h.image)}" />`
  ]
    .filter(Boolean)
    .join('\n    ');
}

function page(url) {
  const { html, head } = render(url);
  if (!head.title) throw new Error(`Aucune balise SEO pour ${url} (usePageMeta manquant ?)`);
  if (!template.includes('<!--app-head-->') || !template.includes('<div id="root"></div>')) {
    throw new Error('index.html : marqueurs <!--app-head--> ou <div id="root"></div> introuvables');
  }
  return {
    head,
    out: template
      .replace('<!--app-head-->', headTags(head))
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  };
}

let count = 0;
for (const r of routes) {
  const { out, head } = page(r.path);
  const expected = `${SITE_URL}${r.path === '/' ? '/' : r.path}`;
  if (head.url !== expected) throw new Error(`Canonical incohérente pour ${r.path} : ${head.url}`);
  const file = r.path === '/' ? path.join(dist, 'index.html') : path.join(dist, r.path, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  count++;
}

// 404
fs.writeFileSync(path.join(dist, '404.html'), page('/__page-introuvable__').out);

// Coquille vide pour les routes applicatives (connexion, espace client…)
// servies par réécriture : pas de contenu, noindex.
const shell = template.replace(
  '<!--app-head-->',
  '<title>ActeDeVente.fr</title>\n    <meta name="robots" content="noindex, nofollow" />'
);
fs.writeFileSync(path.join(dist, 'app.html'), shell);

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${r.lastmod || today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);

// Contrôle : chaque page (hors accueil) doit avoir sa réécriture dans render.yaml
const renderYamlPath = path.join(root, '..', 'render.yaml');
if (fs.existsSync(renderYamlPath)) {
  const yaml = fs.readFileSync(renderYamlPath, 'utf8');
  const missing = routes
    .filter((r) => r.path !== '/')
    .filter((r) => !yaml.includes(`source: ${r.path}\n`));
  if (missing.length) {
    console.warn('\n⚠️  Pages sans règle de réécriture dans render.yaml (et le tableau de bord Render) :');
    missing.forEach((r) => console.warn(`   - ${r.path}  →  ${r.path}/index.html`));
    console.warn('   Sans cette règle, ces pages renverront une erreur 404 en production.\n');
  }
}

fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`✓ Pré-rendu : ${count} pages + 404.html + app.html + sitemap.xml`);
