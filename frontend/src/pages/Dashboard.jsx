import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { user, logout, hasPremiumAccess, isAdmin, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableDocs, setAvailableDocs] = useState({ free: [], premium: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingMessage, setBillingMessage] = useState(null);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout !== 'success' && checkout !== 'cancel') return;
    let cancelled = false;
    (async () => {
      if (checkout === 'success') {
        setBillingMessage('Paiement confirmé. Mise à jour de votre compte…');
        await fetchUser();
        if (!cancelled) setBillingMessage('Merci ! Votre compte Premium est actif.');
      } else if (checkout === 'cancel') {
        setBillingMessage('Paiement annulé.');
      }
      if (cancelled) return;
      const next = new URLSearchParams(searchParams);
      next.delete('checkout');
      setSearchParams(next, { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, fetchUser]);

  useEffect(() => {
    fetchAvailableDocs();
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchAvailableDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/api/documents/available`, { headers });
      setAvailableDocs(response.data);
    } catch (error) {
      console.error('Erreur récupération documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/documents/history`);
      setHistory(response.data.documents);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startCheckout = async () => {
    setBillingMessage(null);
    setBillingLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/billing/create-checkout-session`);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setBillingMessage('Réponse Stripe inattendue.');
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        'Impossible de démarrer le paiement.';
      setBillingMessage(msg);
    } finally {
      setBillingLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setBillingMessage(null);
    setBillingLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/billing/create-portal-session`);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setBillingMessage('Réponse Stripe inattendue.');
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        'Impossible d’ouvrir le portail de facturation.';
      setBillingMessage(msg);
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-inner">
          <h1>Mon Dashboard</h1>
          <div className="header-actions">
            <Link to="/" className="btn-link">Accueil</Link>
            {isAdmin() && <Link to="/admin" className="btn-link">Administration</Link>}
            <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {billingMessage && (
          <div className="billing-toast" style={{
            margin: '0 1rem 1rem',
            padding: '12px 16px',
            borderRadius: 8,
            background: '#eef6ff',
            border: '1px solid #c5d9f5',
            color: '#1a3a5c'
          }}>
            {billingMessage}
          </div>
        )}
        <div className="user-info-card">
          <div className="user-avatar">
            {user?.prenom?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="user-details">
            <h2>{user?.prenom} {user?.nom}</h2>
            <p>{user?.email}</p>
            <div className="user-badge">
              {user?.role === 'admin' && <span className="badge-admin">👑 Admin</span>}
              {user?.role === 'premium' && <span className="badge-premium">💎 Premium</span>}
              {user?.role === 'gratuit' && <span className="badge-free">🆓 Gratuit</span>}
            </div>
          </div>
        </div>

        {!hasPremiumAccess() && user?.role !== 'admin' && (
          <div className="upgrade-banner">
            <h3>💎 Passez Premium</h3>
            <p>Accédez à tous les documents CERFA, factures, garanties et plus encore</p>
            <p className="upgrade-features">
              ✓ Tous les documents CERFA<br/>
              ✓ Factures et garanties<br/>
              ✓ Historique illimité<br/>
              ✓ Support prioritaire
            </p>
            <button
              type="button"
              className="btn-upgrade"
              onClick={startCheckout}
              disabled={billingLoading}
            >
              {billingLoading ? 'Redirection…' : 'Passer Premium (paiement sécurisé)'}
            </button>
          </div>
        )}

        {hasPremiumAccess() && user?.role !== 'admin' && user?.stripeCustomerId && (
          <div className="upgrade-banner" style={{ borderColor: '#c8e6c9', background: '#f1faf1' }}>
            <h3>Abonnement</h3>
            <p>Modifier votre carte, consulter les factures ou gérer l’annulation.</p>
            <button
              type="button"
              className="btn-upgrade"
              onClick={openBillingPortal}
              disabled={billingLoading}
            >
              {billingLoading ? 'Ouverture…' : 'Gérer mon abonnement'}
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Documents disponibles</h3>
            <div className="documents-list">
              <div className="doc-section">
                <h4>Gratuits</h4>
                {availableDocs.free?.map(doc => (
                  <div key={doc.type} className="doc-item">
                    <span className="doc-name">{doc.label}</span>
                    <span className="doc-status available">✓ Disponible</span>
                  </div>
                ))}
              </div>
              <div className="doc-section">
                <h4>Premium {!hasPremiumAccess() && <span className="lock-icon">🔒</span>}</h4>
                {availableDocs.premium?.map(doc => (
                  <div key={doc.type} className="doc-item">
                    <span className="doc-name">{doc.label}</span>
                    <span className={`doc-status ${doc.available ? 'available' : 'locked'}`}>
                      {doc.available ? '✓ Disponible' : '🔒 Premium requis'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/generate" className="btn-generate-docs">
              Générer des documents
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Historique</h3>
            {history.length === 0 ? (
              <p className="empty-state">Aucun document généré</p>
            ) : (
              <div className="history-list">
                {history.map((doc, index) => (
                  <div key={index} className="history-item">
                    <div className="history-info">
                      <strong>{doc.fileName}</strong>
                      <span className="history-date">
                        {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

