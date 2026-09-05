import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../components/Auth.css';

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Connexion Google échouée';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Erreur de connexion</h2>
        <p className="auth-subtitle">Google n’a pas pu finaliser l’authentification.</p>
        <div className="error-message">{message}</div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Vérifie dans Google Cloud que l’URI de redirection est exactement :
          <br />
          <code>https://auto-documents-api.onrender.com/api/auth/google/callback</code>
          <br />
          Si l’app OAuth est en mode « Testing », ton email Google doit être ajouté comme utilisateur de test.
        </p>
        <p className="auth-footer">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
