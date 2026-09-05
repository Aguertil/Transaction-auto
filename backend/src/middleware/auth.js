import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Middleware pour vérifier l'authentification JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Mode développement : compte admin par défaut
    if (decoded.userId === 'dev-admin-id') {
      req.user = {
        _id: 'dev-admin-id',
        email: 'admin@mbauto.fr',
        nom: 'Admin',
        prenom: 'MB-Auto',
        role: 'admin',
        isActive: true,
        hasPremiumAccess: function() { return true; },
        toPublicJSON: function() {
          return {
            _id: this._id,
            email: this.email,
            nom: this.nom,
            prenom: this.prenom,
            role: this.role,
            isActive: this.isActive
          };
        }
      };
      return next();
    }
    
    try {
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Utilisateur invalide ou inactif' });
      }
      req.user = user;
      next();
    } catch (dbError) {
      // Si erreur DB, rejeter (sauf pour le compte admin dev)
      return res.status(401).json({ error: 'Erreur d\'authentification' });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Middleware premium (paiement mis de côté).
 * Tout utilisateur authentifié a actuellement accès aux documents.
 */
export const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  return next();
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const userRole = req.user.role || (req.user.role === undefined && req.user._id === 'dev-admin-id' ? 'admin' : null);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Accès admin requis' });
  }

  next();
};

/**
 * Middleware optionnel : ajoute l'utilisateur si authentifié, mais ne bloque pas
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Mode développement : compte admin par défaut
      if (decoded.userId === 'dev-admin-id') {
        req.user = {
          _id: 'dev-admin-id',
          email: 'admin@mbauto.fr',
          nom: 'Admin',
          prenom: 'MB-Auto',
          role: 'admin',
          isActive: true,
          hasPremiumAccess: function() { return true; }
        };
        return next();
      }
      
      try {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (dbError) {
        // Si erreur DB et c'est le compte admin dev, utiliser le compte dev
        if (decoded.userId === 'dev-admin-id') {
          req.user = {
            _id: 'dev-admin-id',
            email: 'admin@mbauto.fr',
            nom: 'Admin',
            prenom: 'MB-Auto',
            role: 'admin',
            isActive: true,
            hasPremiumAccess: function() { return true; }
          };
        }
      }
    }
    next();
  } catch (error) {
    // En cas d'erreur, continuer sans utilisateur (accès gratuit)
    next();
  }
};

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

