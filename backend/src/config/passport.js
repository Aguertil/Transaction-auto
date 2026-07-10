import passport from 'passport';
import User from '../models/User.js';

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configuration Google OAuth sera faite dans les routes si nécessaire
export default passport;
