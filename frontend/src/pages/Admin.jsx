import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Admin() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'gratuit'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await axios.get(`${API_URL}/api/admin/users`);
        setUsers(response.data.users);
      } else if (activeTab === 'stats') {
        const response = await axios.get(`${API_URL}/api/admin/stats`);
        setStats(response.data);
      } else if (activeTab === 'documents') {
        const response = await axios.get(`${API_URL}/api/admin/documents`);
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Erreur récupération données:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role });
      fetchData();
      alert('Rôle mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/status`, { isActive });
      fetchData();
      alert(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/users`, newUser);
      setShowCreateForm(false);
      setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'gratuit' });
      fetchData();
      alert('Utilisateur créé avec succès');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      fetchData();
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-inner">
          <h1>👑 Administration</h1>
          <div className="header-actions">
            <Link to="/dashboard" className="btn-link">Dashboard</Link>
            <Link to="/" className="btn-link">Accueil</Link>
            <button onClick={logout} className="btn-logout">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-tabs">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Statistiques
          </button>
          <button
            className={activeTab === 'documents' ? 'active' : ''}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="admin-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Gestion des utilisateurs</h2>
                    <button 
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="btn-create-user"
                      style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      {showCreateForm ? 'Annuler' : '+ Créer un utilisateur'}
                    </button>
                  </div>

                  {showCreateForm && (
                    <form onSubmit={createUser} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                      <h3>Créer un nouvel utilisateur</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="email"
                          placeholder="Email *"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                          type="password"
                          placeholder="Mot de passe *"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                          type="text"
                          placeholder="Prénom"
                          value={newUser.prenom}
                          onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                          type="text"
                          placeholder="Nom"
                          value={newUser.nom}
                          onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="gratuit">Gratuit</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Créer l'utilisateur
                      </button>
                    </form>
                  )}

                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Nom</th>
                          <th>Rôle</th>
                          <th>Statut</th>
                          <th>Dernière connexion</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user.email}</td>
                            <td>{user.prenom} {user.nom}</td>
                            <td>
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                className="role-select"
                              >
                                <option value="gratuit">Gratuit</option>
                                <option value="premium">Premium</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                {user.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td>
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                                : 'Jamais'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button
                                  onClick={() => updateUserStatus(user._id, !user.isActive)}
                                  className={`btn-status ${user.isActive ? 'deactivate' : 'activate'}`}
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                >
                                  {user.isActive ? 'Désactiver' : 'Activer'}
                                </button>
                                {user._id !== currentUser?._id && (
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="admin-section">
                  <h2>Statistiques</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h3>Utilisateurs</h3>
                      <div className="stat-value">{stats.users.total}</div>
                      <div className="stat-details">
                        <span>Gratuit: {stats.users.gratuit}</span>
                        <span>Premium: {stats.users.premium}</span>
                        <span>Admin: {stats.users.admin}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <h3>Documents</h3>
                      <div className="stat-value">{stats.documents.total}</div>
                      <div className="stat-details">
                        <span>Derniers 30 jours: {stats.documents.last30Days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="admin-section">
                  <h2>Historique des documents</h2>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Fichier</th>
                          <th>Utilisateur</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => (
                          <tr key={index}>
                            <td>{doc.type}</td>
                            <td>{doc.fileName}</td>
                            <td>
                              {doc.userId?.email || 'N/A'}
                              {doc.userId?.role && (
                                <span className="user-role-badge">{doc.userId.role}</span>
                              )}
                            </td>
                            <td>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

