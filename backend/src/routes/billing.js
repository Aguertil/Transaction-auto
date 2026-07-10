import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { getStripe } from '../services/stripeBilling.js';

const router = express.Router();

/**
 * POST /api/billing/create-checkout-session
 * Crée une session Stripe Checkout (abonnement) et renvoie l'URL de paiement.
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    const stripe = getStripe();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

    if (!stripe || !priceId) {
      return res.status(503).json({
        error: 'Paiement non configuré',
        message: 'STRIPE_SECRET_KEY et STRIPE_PRICE_ID doivent être définis sur le serveur'
      });
    }

    if (req.user._id === 'dev-admin-id') {
      return res.status(400).json({
        error: 'Compte de démonstration',
        message: 'Créez un compte utilisateur réel pour tester le paiement.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?checkout=success`,
      cancel_url: `${frontendUrl}/dashboard?checkout=cancel`,
      metadata: { userId: user._id.toString() },
      subscription_data: {
        metadata: { userId: user._id.toString() }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto' }
    });

    if (!session.url) {
      return res.status(500).json({ error: 'Session Stripe sans URL' });
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error('create-checkout-session:', error);
    res.status(500).json({
      error: 'Impossible de créer la session de paiement',
      message: error.message
    });
  }
});

/**
 * POST /api/billing/create-portal-session
 * Portail client Stripe (modifier carte, annuler, etc.)
 */
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const stripe = getStripe();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

    if (!stripe) {
      return res.status(503).json({ error: 'Stripe non configuré' });
    }

    if (req.user._id === 'dev-admin-id') {
      return res.status(400).json({ error: 'Non disponible pour le compte de démo' });
    }

    const user = await User.findById(req.user._id);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({
        error: 'Aucun client Stripe',
        message: 'Abonnez-vous d’abord via le bouton Premium.'
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${frontendUrl}/dashboard`
    });

    res.json({ url: portal.url });
  } catch (error) {
    console.error('create-portal-session:', error);
    res.status(500).json({
      error: 'Impossible d’ouvrir le portail de facturation',
      message: error.message
    });
  }
});

export default router;
