import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Requis seulement si pas d'authentification Google
    }
  },
  nom: {
    type: String,
    trim: true
  },
  prenom: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['gratuit', 'premium', 'admin'],
    default: 'gratuit'
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  googleEmail: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  subscriptionExpiresAt: {
    type: Date // Pour les comptes premium avec expiration
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
    trim: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
    trim: true
  },
  stripeSubscriptionStatus: {
    type: String,
    trim: true
  }
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour vérifier si l'utilisateur a accès premium
userSchema.methods.hasPremiumAccess = function() {
  if (this.role === 'admin') return true;
  if (this.role === 'premium') {
    if (this.subscriptionExpiresAt) {
      return this.subscriptionExpiresAt > new Date();
    }
    return true; // Premium sans expiration
  }
  return false;
};

// Méthode pour obtenir les infos publiques (sans mot de passe)
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;

