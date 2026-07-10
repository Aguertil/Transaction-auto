import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    await connectDatabase();

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const nom = process.argv[4] || 'Admin';
    const prenom = process.argv[5] || 'System';

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('✅ Compte admin existe déjà:', email);
        return;
      } else {
        // Mettre à jour le rôle
        existingAdmin.role = 'admin';
        existingAdmin.password = password; // Sera hashé automatiquement
        await existingAdmin.save();
        console.log('✅ Compte mis à jour en admin:', email);
        return;
      }
    }

    // Créer l'admin
    const admin = new User({
      email,
      password,
      nom,
      prenom,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Compte admin créé avec succès!');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log('⚠️  Changez le mot de passe après la première connexion!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    process.exit(1);
  }
}

createAdmin();

