import Stripe from 'stripe';
import User from '../models/User.js';

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function customerId(subscription) {
  const c = subscription.customer;
  return typeof c === 'string' ? c : c?.id;
}

/**
 * Met à jour l'utilisateur à partir d'un abonnement Stripe.
 * Les comptes admin ne voient pas leur rôle modifié.
 */
export async function syncUserFromStripeSubscription(subscription) {
  const stripe = getStripe();
  if (!stripe || !subscription?.id) return;

  let userId = subscription.metadata?.userId;
  let user;
  if (userId) {
    user = await User.findById(userId);
  }
  if (!user) {
    const cid = customerId(subscription);
    if (cid) user = await User.findOne({ stripeCustomerId: cid });
  }
  if (!user) {
    console.warn('Stripe sync: aucun utilisateur pour la subscription', subscription.id);
    return;
  }

  const periodEnd = new Date(subscription.current_period_end * 1000);
  const grantingStatuses = ['active', 'trialing'];
  const hasAccess =
    grantingStatuses.includes(subscription.status) && periodEnd > new Date();

  user.stripeSubscriptionId = subscription.id;
  user.stripeSubscriptionStatus = subscription.status;
  user.subscriptionExpiresAt = periodEnd;
  const cid = customerId(subscription);
  if (cid) user.stripeCustomerId = cid;

  if (user.role !== 'admin') {
    user.role = hasAccess ? 'premium' : 'gratuit';
  }

  await user.save();
}

async function handleCheckoutSessionCompleted(stripe, session) {
  if (session.mode !== 'subscription' || !session.subscription) return;

  const userId = session.metadata?.userId;
  if (!userId) {
    console.warn('Stripe checkout: metadata.userId manquant', session.id);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.warn('Stripe checkout: utilisateur introuvable', userId);
    return;
  }

  if (typeof session.customer === 'string') {
    user.stripeCustomerId = session.customer;
    await user.save();
  }

  const sub = await stripe.subscriptions.retrieve(session.subscription);
  await syncUserFromStripeSubscription(sub);
}

export async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !whSecret) {
    console.warn('Stripe webhook: STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquant');
    return res.status(503).send('Stripe non configuré');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
  } catch (err) {
    console.error('Stripe webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripe, event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncUserFromStripeSubscription(event.data.object);
        break;
      default:
        break;
    }
  } catch (e) {
    console.error('Stripe webhook handler:', e);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  res.json({ received: true });
}
