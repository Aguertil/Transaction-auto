import express from 'express';
import User from '../models/User.js';
import Document from '../models/Document.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes admin nécessitent l'authentification admin
router.use(requireAdmin);

/**
 * Liste tous les utilisateurs
 * GET /api/admin/users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

/**
 * Modifier le rôle d'un utilisateur
 * PUT /api/admin/users/:userId/role
 */
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, subscriptionExpiresAt } = req.body;

    if (!['gratuit', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.role = role;
    if (subscriptionExpiresAt) {
      user.subscriptionExpiresAt = new Date(subscriptionExpiresAt);
    }
    await user.save();

    res.json({ message: 'Rôle mis à jour', user: user.toPublicJSON() });
  } catch (error) {
    console.error('Erreur modification rôle:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du rôle' });
  }
});

/**
 * Activer/Désactiver un utilisateur
 * PUT /api/admin/users/:userId/status
 */
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: `Utilisateur ${isActive ? 'activé' : 'désactivé'}`, user: user.toPublicJSON() });
  } catch (error) {
    console.error('Erreur modification statut:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du statut' });
  }
});

/**
 * Créer un nouvel utilisateur
 * POST /api/admin/users
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, nom, prenom, role = 'gratuit', subscriptionExpiresAt } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (!['gratuit', 'premium', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      nom,
      prenom,
      role,
      isActive: true
    });

    if (subscriptionExpiresAt) {
      user.subscriptionExpiresAt = new Date(subscriptionExpiresAt);
    }

    await user.save();

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès', 
      user: user.toPublicJSON() 
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur', message: error.message });
  }
});

/**
 * Supprimer un utilisateur
 * DELETE /api/admin/users/:userId
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Empêcher la suppression de soi-même
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

/**
 * Obtenir les détails d'un utilisateur
 * GET /api/admin/users/:userId
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

/**
 * Statistiques générales
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersGratuit = await User.countDocuments({ role: 'gratuit' });
    const usersPremium = await User.countDocuments({ role: 'premium' });
    const usersAdmin = await User.countDocuments({ role: 'admin' });
    const totalDocuments = await Document.countDocuments();
    const documentsLast30Days = await Document.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      users: {
        total: totalUsers,
        gratuit: usersGratuit,
        premium: usersPremium,
        admin: usersAdmin
      },
      documents: {
        total: totalDocuments,
        last30Days: documentsLast30Days
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

/**
 * Historique des documents
 * GET /api/admin/documents
 */
router.get('/documents', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const documents = await Document.find({})
      .populate('userId', 'email nom prenom role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Document.countDocuments();

    res.json({ documents, total });
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

export default router;

