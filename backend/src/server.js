import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import des routes
import documentRoutes from './routes/documents.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import billingRoutes from './routes/billing.js';
import ocrRoutes from './routes/ocr.js';
import { handleStripeWebhook } from './services/stripeBilling.js';

// Import de la base de données
import { connectDatabase } from './config/database.js';
import { ensureAdminFromEnv } from './scripts/ensureAdmin.js';
// Import Passport (sans Google OAuth au chargement)
import './config/passport.js';

// Configuration dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true
}));

// Webhook Stripe : corps brut requis pour la vérification de signature
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Configuration de la session (pour Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
  }
}));

// Initialisation Passport
app.use(passport.initialize());
app.use(passport.session());

// Connexion à la base de données + bootstrap admin (ADMIN_EMAIL / ADMIN_PASSWORD)
connectDatabase()
  .then(() => ensureAdminFromEnv())
  .catch(console.error);

// Routes publiques
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Auto Documents Generator API',
    version: '2.0.0',
    features: {
      public: true,
      authentication: true,
      premium: true,
      admin: true
    }
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Facturation / Stripe (checkout & portail client)
app.use('/api/billing', billingRoutes);

// Routes de documents
app.use('/api/documents', documentRoutes);

// Lecture OCR des pièces justificatives
app.use('/api/ocr', ocrRoutes);

// Routes d'administration
app.use('/api/admin', adminRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📄 Documents CERFA attendus dans: ${path.join(__dirname, '../public/cerfa')}`);
  console.log(`🔐 Mode authentification: ${process.env.MONGODB_URI ? 'Activé' : 'Désactivé (mode gratuit uniquement)'}`);
});
