import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-documents';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    // En mode développement, continuer sans DB (mode gratuit uniquement)
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('⚠️  Mode sans base de données activé (fonctionnalités limitées)');
  }
}

export default mongoose;

