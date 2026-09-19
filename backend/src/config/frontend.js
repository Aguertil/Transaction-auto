/**
 * Origines frontend autorisées (CORS + redirections OAuth / Stripe).
 * actedevente.fr + URL Render + localhost.
 */

const HARDCODED = [
  'https://www.actedevente.fr',
  'https://actedevente.fr',
  'https://auto-documents-web.onrender.com',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

function splitEnvList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function getAllowedOrigins() {
  return [...new Set([
    ...HARDCODED,
    ...splitEnvList(process.env.FRONTEND_URL),
    ...splitEnvList(process.env.FRONTEND_URLS)
  ])];
}

/** URL canonique du site (redirections après login Google / Stripe). */
export function getFrontendBaseUrl() {
  const primary = (process.env.FRONTEND_PRIMARY_URL || '').trim().replace(/\/$/, '');
  if (primary) return primary;

  const fromEnv = splitEnvList(process.env.FRONTEND_URL);
  const actedevente = fromEnv.find((u) => u.includes('actedevente.fr'));
  if (actedevente) return actedevente;

  return 'https://www.actedevente.fr';
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (getAllowedOrigins().includes(normalized)) return true;
  // Autres déploiements Render du même projet
  if (/^https:\/\/[\w-]+\.onrender\.com$/i.test(normalized)) return true;
  return false;
}
