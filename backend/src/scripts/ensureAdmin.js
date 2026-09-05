import User from '../models/User.js';

/**
 * Crée ou met à jour un compte admin à partir de ADMIN_EMAIL / ADMIN_PASSWORD.
 * Appelé au démarrage du serveur (Render / local).
 */
export async function ensureAdminFromEnv() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('ℹ️  ADMIN_EMAIL / ADMIN_PASSWORD non définis — pas de bootstrap admin');
    return;
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.isActive = true;
      user.password = password; // hashé par le pre-save
      if (!user.prenom) user.prenom = 'Admin';
      if (!user.nom) user.nom = 'System';
      await user.save();
      console.log(`✅ Compte admin mis à jour: ${email}`);
      return;
    }

    user = new User({
      email,
      password,
      prenom: 'Admin',
      nom: 'System',
      role: 'admin',
      isActive: true
    });
    await user.save();
    console.log(`✅ Compte admin créé: ${email}`);
  } catch (error) {
    console.error('❌ Bootstrap admin échoué:', error.message);
  }
}
