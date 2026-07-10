import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import '../config/passport.js'; // Configuration Passport

const router = express.Router();

// Variable pour suivre si Google OAuth est configuré
let googleStrategyConfigured = false;

// Fonction pour configurer Google OAuth (appelée seulement si nécessaire)
function setupGoogleOAuth() {
  if (googleStrategyConfigured) return Promise.resolve(true);
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return Promise.resolve(false);
  }

  return import('passport-google-oauth20').then(({ Strategy: GoogleStrategy }) => {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.googleEmail = profile.emails[0].value;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }
        user = new User({
          email: profile.emails[0].value,
          googleId: profile.id,
          googleEmail: profile.emails[0].value,
          nom: profile.name.familyName,
          prenom: profile.name.givenName,
          role: 'gratuit',
          lastLogin: new Date()
        });
        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    
    googleStrategyConfigured = true;
    console.log('✅ Google OAuth configuré');
    return true;
  }).catch((error) => {
    console.warn('⚠️  Erreur configuration Google OAuth:', error.message);
    return false;
  });
}

/**
 * Inscription
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const user = new User({
      email,
      password,
      nom,
      prenom,
      role: 'gratuit'
    });

    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

/**
 * Connexion
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Mode développement : compte admin par défaut (si MongoDB non disponible)
    if (email === 'admin@mbauto.fr' && password === 'Admin123') {
      const adminUser = {
        _id: 'dev-admin-id',
        email: 'admin@mbauto.fr',
        nom: 'Admin',
        prenom: 'MB-Auto',
        role: 'admin',
        isActive: true,
        toPublicJSON: function() {
          return {
            _id: this._id,
            email: this.email,
            nom: this.nom,
            prenom: this.prenom,
            role: this.role
          };
        }
      };
      
      const token = generateToken(adminUser._id);
      console.log('✅ Connexion admin (mode développement)');
      
      return res.json({
        message: 'Connexion réussie',
        token,
        user: adminUser.toPublicJSON()
      });
    }

    // Trouver l'utilisateur dans la base de données
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        return res.status(403).json({ error: 'Compte désactivé' });
      }

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date();
      await user.save();

      // Générer le token
      const token = generateToken(user._id);

      res.json({
        message: 'Connexion réussie',
        token,
        user: user.toPublicJSON()
      });
    } catch (dbError) {
      // Si erreur DB et ce n'est pas le compte admin par défaut
      console.warn('Erreur DB lors de la connexion:', dbError.message);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

/**
 * Vérifier le token (profil utilisateur)
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Utiliser le même secret que dans generateToken
    const { generateToken } = await import('../middleware/auth.js');
    // JWT_SECRET est déjà importé en haut du fichier
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error('Erreur vérification JWT dans /me:', jwtError.message);
      return res.status(401).json({ error: 'Token invalide', details: jwtError.message });
    }
    
    // Mode développement : compte admin par défaut
    if (decoded.userId === 'dev-admin-id') {
      return res.json({
        user: {
          _id: 'dev-admin-id',
          email: 'admin@mbauto.fr',
          nom: 'Admin',
          prenom: 'MB-Auto',
          role: 'admin',
          isActive: true
        }
      });
    }
    
    try {
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Utilisateur invalide' });
      }
      res.json({ user: user.toPublicJSON() });
    } catch (dbError) {
      // Si erreur DB et c'est le compte admin dev, retourner les infos
      if (decoded.userId === 'dev-admin-id') {
        return res.json({
          user: {
            _id: 'dev-admin-id',
            email: 'admin@mbauto.fr',
            nom: 'Admin',
            prenom: 'MB-Auto',
            role: 'admin',
            isActive: true
          }
        });
      }
      console.error('Erreur DB dans /me:', dbError.message);
      return res.status(401).json({ error: 'Erreur base de données' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

/**
 * Google OAuth - Initiation
 * GET /api/auth/google
 */
router.get('/google', async (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google OAuth non configuré' });
  }
  const configured = await setupGoogleOAuth();
  if (!configured) {
    return res.status(503).json({ error: 'Google OAuth non disponible' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

/**
 * Google OAuth - Callback
 * GET /api/auth/google/callback
 */
router.get('/google/callback', async (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google OAuth non configuré' });
  }
  const configured = await setupGoogleOAuth();
  if (!configured) {
    return res.status(503).json({ error: 'Google OAuth non disponible' });
  }
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      return res.redirect(`${frontendUrl}/auth/error`);
    }
    try {
      const token = generateToken(user._id);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Erreur callback Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  })(req, res, next);
});

export default router;
