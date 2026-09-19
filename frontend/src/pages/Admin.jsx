import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BRAND_NAME } from '../brand';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Admin() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState(null);
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

  const showMsg = (text, type = 'ok') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await axios.get(`${API_URL}/api/admin/users`);
        setUsers(response.data.users || []);
      } else if (activeTab === 'stats') {
        const response = await axios.get(`${API_URL}/api/admin/stats`);
        setStats(response.data);
      } else if (activeTab === 'documents') {
        const response = await axios.get(`${API_URL}/api/admin/documents`);
        setDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error('Erreur récupération données:', error);
      showMsg(error.response?.data?.error || 'Erreur de chargement', 'err');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      const hay = `${u.email} ${u.prenom || ''} ${u.nom || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, roleFilter]);

  const overview = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const active = users.filter((u) => u.isActive !== false).length;
    const google = users.filter((u) => u.googleId).length;
    const pros = users.filter((u) => u.accountType === 'pro').length;
    const particuliers = users.filter((u) => u.accountType !== 'pro').length;
    const docs = users.reduce((sum, u) => sum + (u.documentsCount || 0), 0);
    return { total, admins, active, google, pros, particuliers, docs };
  }, [users]);

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role });
      await fetchData();
      showMsg('Rôle mis à jour');
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erreur mise à jour du rôle', 'err');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/status`, { isActive });
      await fetchData();
      showMsg(`Utilisateur ${isActive ? 'activé' : 'désactivé'}`);
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erreur mise à jour du statut', 'err');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/users`, newUser);
      setShowCreateForm(false);
      setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'gratuit' });
      await fetchData();
      showMsg('Utilisateur créé');
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erreur création', 'err');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`);
      await fetchData();
      showMsg('Utilisateur supprimé');
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erreur suppression', 'err');
    }
  };

  const partyLabel = (party) => {
    if (!party) return '—';
    const company = party.raisonSociale?.trim();
    const person = [party.prenom, party.nom].filter(Boolean).join(' ').trim();
    return company || person || '—';
  };

  const downloadExcel = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/documents/export.xlsx`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `actedevente-saisies-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showMsg('Export Excel téléchargé');
    } catch (error) {
      showMsg(error.response?.data?.error || 'Erreur export Excel', 'err');
    } finally {
      setExporting(false);
    }
  };

  const openDocDetail = async (doc) => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/documents/${doc._id}`);
      setSelectedDoc(response.data.document || doc);
    } catch {
      setSelectedDoc(doc);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-inner">
          <div>
            <h1>Administration {BRAND_NAME}</h1>
            <p className="admin-header-sub">Base des inscrits et autorisations</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard" className="btn-link">Dashboard</Link>
            <Link to="/" className="btn-link">Accueil</Link>
            <button type="button" onClick={logout} className="btn-logout">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {message && (
          <div className={`admin-toast ${message.type === 'err' ? 'err' : 'ok'}`}>
            {message.text}
          </div>
        )}

        <div className="admin-tabs">
          <button type="button" className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Inscrits & droits
          </button>
          <button type="button" className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            Statistiques
          </button>
          <button type="button" className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
            Documents générés
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="admin-section">
                  <div className="overview-grid">
                    <div className="overview-card">
                      <span className="overview-label">Inscrits</span>
                      <strong className="overview-value">{overview.total}</strong>
                    </div>
                    <div className="overview-card">
                      <span className="overview-label">Actifs</span>
                      <strong className="overview-value">{overview.active}</strong>
                    </div>
                    <div className="overview-card">
                      <span className="overview-label">Admins</span>
                      <strong className="overview-value">{overview.admins}</strong>
                    </div>
                  <div className="overview-card">
                      <span className="overview-label">Pros</span>
                      <strong className="overview-value">{overview.pros}</strong>
                    </div>
                    <div className="overview-card">
                      <span className="overview-label">Particuliers</span>
                      <strong className="overview-value">{overview.particuliers}</strong>
                    </div>
                    <div className="overview-card">
                      <span className="overview-label">Via Google</span>
                      <strong className="overview-value">{overview.google}</strong>
                    </div>
                    <div className="overview-card">
                      <span className="overview-label">Docs générés</span>
                      <strong className="overview-value">{overview.docs}</strong>
                    </div>
                  </div>

                  <div className="admin-toolbar">
                    <h2>Tous les comptes</h2>
                    <div className="toolbar-actions">
                      <input
                        id="admin-search"
                        name="search"
                        type="search"
                        placeholder="Rechercher email, nom…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-search"
                      />
                      <select
                        id="admin-role-filter"
                        name="roleFilter"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="admin-filter"
                      >
                        <option value="all">Tous les rôles</option>
                        <option value="gratuit">Utilisateur</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn-create-user"
                      >
                        {showCreateForm ? 'Annuler' : '+ Créer un compte'}
                      </button>
                    </div>
                  </div>

                  {showCreateForm && (
                    <form onSubmit={createUser} className="create-user-form">
                      <h3>Nouveau compte</h3>
                      <div className="create-grid">
                        <input
                          id="new-user-email"
                          name="email"
                          type="email"
                          placeholder="Email *"
                          autoComplete="off"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                        />
                        <input
                          id="new-user-password"
                          name="password"
                          type="password"
                          placeholder="Mot de passe *"
                          autoComplete="new-password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                        />
                        <input
                          id="new-user-prenom"
                          name="prenom"
                          type="text"
                          placeholder="Prénom"
                          value={newUser.prenom}
                          onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                        />
                        <input
                          id="new-user-nom"
                          name="nom"
                          type="text"
                          placeholder="Nom"
                          value={newUser.nom}
                          onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                        />
                        <select
                          id="new-user-role"
                          name="role"
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                          <option value="gratuit">Utilisateur</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-primary-admin">Créer</button>
                    </form>
                  )}

                  <div className="permissions-legend">
                    <span><i className="dot ok" /> Connexion</span>
                    <span><i className="dot ok" /> Génération de tous les documents</span>
                    <span><i className="dot admin" /> Accès administration</span>
                  </div>

                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Compte</th>
                          <th>Type</th>
                          <th>Rôle</th>
                          <th>Autorisations</th>
                          <th>Auth</th>
                          <th>Docs</th>
                          <th>Inscription</th>
                          <th>Dernière connexion</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="empty-cell">Aucun utilisateur</td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const p = u.permissions || {};
                            return (
                              <tr key={u._id}>
                                <td>
                                  <div className="user-cell">
                                    <strong>{u.email}</strong>
                                    <span>
                                      {[u.prenom, u.nom].filter(Boolean).join(' ') || '—'}
                                      {u.accountType === 'pro' && u.societe?.raisonSociale
                                        ? ` · ${u.societe.raisonSociale}`
                                        : ''}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`chip ${u.accountType === 'pro' ? 'admin' : 'on'}`}>
                                    {p.accountTypeLabel || (u.accountType === 'pro' ? 'Professionnel' : 'Particulier')}
                                  </span>
                                </td>
                                <td>
                                  <select
                                    aria-label={`Rôle de ${u.email}`}
                                    value={u.role}
                                    onChange={(e) => updateUserRole(u._id, e.target.value)}
                                    className={`role-select role-${u.role}`}
                                  >
                                    <option value="gratuit">Utilisateur</option>
                                    <option value="premium">Premium</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td>
                                  <div className="perm-chips">
                                    <span className={`chip ${p.canLogin ? 'on' : 'off'}`}>
                                      {p.canLogin ? 'Connexion' : 'Bloqué'}
                                    </span>
                                    <span className={`chip ${p.canGenerateAllDocuments ? 'on' : 'off'}`}>
                                      Docs complets
                                    </span>
                                    <span className={`chip ${p.canAccessAdmin ? 'admin' : 'off'}`}>
                                      {p.canAccessAdmin ? 'Admin' : 'Pas admin'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="auth-badge">
                                    {p.authMethod === 'google' ? 'Google' :
                                      p.authMethod === 'google+password' ? 'Google + mdp' : 'Email / mdp'}
                                  </span>
                                </td>
                                <td>{u.documentsCount ?? 0}</td>
                                <td>
                                  {u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString('fr-FR')
                                    : '—'}
                                </td>
                                <td>
                                  {u.lastLogin
                                    ? new Date(u.lastLogin).toLocaleDateString('fr-FR')
                                    : 'Jamais'}
                                </td>
                                <td>
                                  <div className="row-actions">
                                    <button
                                      type="button"
                                      onClick={() => updateUserStatus(u._id, !u.isActive)}
                                      className={`btn-status ${u.isActive !== false ? 'deactivate' : 'activate'}`}
                                    >
                                      {u.isActive !== false ? 'Désactiver' : 'Activer'}
                                    </button>
                                    {String(u._id) !== String(currentUser?._id) && (
                                      <button
                                        type="button"
                                        onClick={() => deleteUser(u._id)}
                                        className="btn-delete"
                                      >
                                        Supprimer
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
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
                        <span>Utilisateurs: {stats.users.gratuit}</span>
                        <span>Premium: {stats.users.premium}</span>
                        <span>Admin: {stats.users.admin}</span>
                      </div>
                    </div>
                    <div className="stat-card alt">
                      <h3>Documents</h3>
                      <div className="stat-value">{stats.documents.total}</div>
                      <div className="stat-details">
                        <span>30 derniers jours: {stats.documents.last30Days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="admin-section">
                  <div className="admin-toolbar">
                    <h2>Saisies &amp; documents générés</h2>
                    <div className="toolbar-actions">
                      <button
                        type="button"
                        className="btn-create-user"
                        onClick={downloadExcel}
                        disabled={exporting || documents.length === 0}
                      >
                        {exporting ? 'Export…' : 'Télécharger Excel'}
                      </button>
                    </div>
                  </div>
                  <p className="admin-hint">
                    Chaque génération enregistre vendeur, acheteur, véhicule et vente.
                    Les formulaires publics (sans compte) sont aussi conservés.
                  </p>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Source</th>
                          <th>Type</th>
                          <th>Acheteur</th>
                          <th>Véhicule</th>
                          <th>Prix TTC</th>
                          <th>Compte</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="empty-cell">Aucune saisie enregistrée</td>
                          </tr>
                        ) : (
                          documents.map((doc) => (
                            <tr key={doc._id || `${doc.fileName}-${doc.createdAt}`}>
                              <td>
                                {doc.createdAt
                                  ? new Date(doc.createdAt).toLocaleString('fr-FR')
                                  : '—'}
                              </td>
                              <td>
                                <span className={`chip ${doc.source === 'public' ? 'off' : 'on'}`}>
                                  {doc.source === 'public' ? 'Public' : 'Compte'}
                                </span>
                              </td>
                              <td>{doc.type}</td>
                              <td>{partyLabel(doc.clientData)}</td>
                              <td>
                                {[doc.vehiculeData?.marque, doc.vehiculeData?.modele, doc.vehiculeData?.immatriculation]
                                  .filter(Boolean)
                                  .join(' · ') || '—'}
                              </td>
                              <td>
                                {doc.venteData?.prixTTC
                                  ? `${doc.venteData.prixTTC} €`
                                  : '—'}
                              </td>
                              <td>{doc.userId?.email || '(sans compte)'}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn-status activate"
                                  onClick={() => openDocDetail(doc)}
                                >
                                  Voir
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedDoc && (
                    <div className="doc-detail-overlay" role="dialog" aria-modal="true">
                      <div className="doc-detail-panel">
                        <div className="doc-detail-header">
                          <h3>Détail de la saisie</h3>
                          <button type="button" className="btn-link-dark" onClick={() => setSelectedDoc(null)}>
                            Fermer
                          </button>
                        </div>
                        <p className="doc-detail-meta">
                          {selectedDoc.type} ·{' '}
                          {selectedDoc.createdAt
                            ? new Date(selectedDoc.createdAt).toLocaleString('fr-FR')
                            : '—'}
                          {' · '}
                          {selectedDoc.userId?.email || 'Sans compte'}
                        </p>
                        <div className="doc-detail-grid">
                          <section>
                            <h4>Vendeur / société</h4>
                            <pre>{JSON.stringify(selectedDoc.societeData || {}, null, 2)}</pre>
                          </section>
                          <section>
                            <h4>Acheteur</h4>
                            <pre>{JSON.stringify(selectedDoc.clientData || {}, null, 2)}</pre>
                          </section>
                          <section>
                            <h4>Véhicule</h4>
                            <pre>{JSON.stringify(selectedDoc.vehiculeData || {}, null, 2)}</pre>
                          </section>
                          <section>
                            <h4>Vente</h4>
                            <pre>{JSON.stringify(selectedDoc.venteData || {}, null, 2)}</pre>
                          </section>
                          {selectedDoc.vendeurUEData && Object.keys(selectedDoc.vendeurUEData).length > 0 && (
                            <section>
                              <h4>Vendeur UE</h4>
                              <pre>{JSON.stringify(selectedDoc.vendeurUEData, null, 2)}</pre>
                            </section>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
