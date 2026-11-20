import dotenv from 'dotenv';

dotenv.config();

const DEV_FALLBACK = 'dev-only-secret-not-for-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET doit être défini en production');
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET absent : secret de développement utilisé (ne pas utiliser en production)');
}

export const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK;
