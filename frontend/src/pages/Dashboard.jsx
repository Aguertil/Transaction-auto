import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [availableDocs, setAvailableDocs] = useState({ free: [], premium: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  const allDocs = [...(availableDocs.free || []), ...(availableDocs.premium || [])];

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
        <div className="user-info-card">
          <div className="user-avatar">
            {user?.prenom?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="user-details">
            <h2>{user?.prenom} {user?.nom}</h2>
            <p>{user?.email}</p>
            <div className="user-badge">
              {user?.role === 'admin' && <span className="badge-admin">Admin</span>}
              {user?.role !== 'admin' && <span className="badge-free">Compte actif</span>}
            </div>
          </div>
        </div>

        {/* (Paiement / abonnement Stripe : mis de côté pour l’instant) */}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Documents disponibles</h3>
            <p style={{ marginBottom: '1rem', color: '#555', fontSize: '0.95rem' }}>
              Avec votre compte, vous pouvez générer tous les documents.
            </p>
            <div className="documents-list">
              <div className="doc-section">
                {allDocs.map(doc => (
                  <div key={doc.type} className="doc-item">
                    <span className="doc-name">{doc.label}</span>
                    <span className="doc-status available">Disponible</span>
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
