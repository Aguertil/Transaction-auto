import rateLimit from 'express-rate-limit';

const message = (texte) => ({ error: texte });

// Connexion / inscription : 20 tentatives par 15 min et par IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Trop de tentatives. Réessayez dans quelques minutes.')
});

// Génération de documents : 30 par 15 min et par IP
export const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Trop de générations. Réessayez dans quelques minutes.')
});

// OCR (coûteux en CPU) : 10 par 15 min et par IP
export const ocrLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Trop de lectures de documents. Réessayez dans quelques minutes.')
});
