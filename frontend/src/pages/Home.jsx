import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Home() {
  const { user, hasPremiumAccess } = useAuth();
  const [formData, setFormData] = useState({
    societe: {
      raisonSociale: '',
      siret: '',
      adresse: '',
      codePostal: '',
      ville: '',
      telephone: '',
      email: ''
    },
    client: {
      nom: '',
      prenom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      telephone: '',
      email: ''
    },
    vehicule: {
      marque: '',
      modele: '',
      immatriculation: '',
      vin: '',
      datePremiereImmat: '',
      kilometrage: '',
      couleur: ''
    },
    vente: {
      dateVente: todayLocalISO(),
      dateSignature: todayLocalISO(),
      lieuSignature: '',
      prixTTC: '',
      modePaiement: 'Espèces'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');

  useEffect(() => {
    const saved = localStorage.getItem('societeData');
    if (saved) {
      const societe = JSON.parse(saved);
      setFormData(prev => ({ ...prev, societe }));
    }
    requestGeolocation();
  }, []);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error('geo');
          const json = await res.json();
          const addr = json.address || {};
          const ville = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
          if (ville) {
            setFormData(prev => ({
              ...prev,
              vente: { ...prev.vente, lieuSignature: String(ville).toUpperCase() }
            }));
            setGeoStatus('ok');
          } else setGeoStatus('error');
        } catch {
          setGeoStatus('error');
        }
      },
      (err) => setGeoStatus(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/documents/public/generate`,
        formData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cerfa-15776.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>📄 Auto Documents Generator</h1>
          <p>Générez vos documents automobiles en quelques clics</p>
          <div className="header-actions">
            {user ? (
              <Link to="/dashboard" className="btn-header">
                {hasPremiumAccess() ? 'Dashboard Premium' : 'Mon Compte'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-header-secondary">Connexion</Link>
                <Link to="/register" className="btn-header">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="container">
          <div className="home-content">
            <div className="home-info">
              <h2>Génération gratuite du CERFA 15776</h2>
              <p>
                Utilisez notre service gratuit pour générer le certificat de cession (CERFA 15776).
                Aucune inscription requise !
              </p>
              {!user && (
                <div className="premium-banner">
                  <strong>💎 Passez Premium</strong>
                  <p>Accédez à tous les documents CERFA, factures, garanties et plus encore</p>
                  <Link to="/register" className="btn-premium">Découvrir Premium</Link>
                </div>
              )}
            </div>

            <div className="form-container">
              <form onSubmit={handleSubmit} className="document-form">
                <h3>Informations de la vente</h3>

                <section className="form-section">
                  <h4>Société vendeur</h4>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Raison sociale"
                      value={formData.societe.raisonSociale}
                      onChange={(e) => handleChange('societe', 'raisonSociale', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="SIRET"
                      value={formData.societe.siret}
                      onChange={(e) => handleChange('societe', 'siret', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formData.societe.adresse}
                      onChange={(e) => handleChange('societe', 'adresse', e.target.value)}
                      className="span-2"
                    />
                    <input
                      type="text"
                      placeholder="Code postal"
                      value={formData.societe.codePostal}
                      onChange={(e) => handleChange('societe', 'codePostal', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Ville"
                      value={formData.societe.ville}
                      onChange={(e) => handleChange('societe', 'ville', e.target.value)}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h4>Client acheteur</h4>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={formData.client.prenom}
                      onChange={(e) => handleChange('client', 'prenom', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nom"
                      value={formData.client.nom}
                      onChange={(e) => handleChange('client', 'nom', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Adresse"
                      value={formData.client.adresse}
                      onChange={(e) => handleChange('client', 'adresse', e.target.value)}
                      className="span-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Code postal"
                      value={formData.client.codePostal}
                      onChange={(e) => handleChange('client', 'codePostal', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ville"
                      value={formData.client.ville}
                      onChange={(e) => handleChange('client', 'ville', e.target.value)}
                      required
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h4>Véhicule</h4>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Marque"
                      value={formData.vehicule.marque}
                      onChange={(e) => handleChange('vehicule', 'marque', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Modèle"
                      value={formData.vehicule.modele}
                      onChange={(e) => handleChange('vehicule', 'modele', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Immatriculation"
                      value={formData.vehicule.immatriculation}
                      onChange={(e) => handleChange('vehicule', 'immatriculation', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="VIN"
                      value={formData.vehicule.vin}
                      onChange={(e) => handleChange('vehicule', 'vin', e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      placeholder="Date première immat"
                      value={formData.vehicule.datePremiereImmat}
                      onChange={(e) => handleChange('vehicule', 'datePremiereImmat', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Kilométrage"
                      value={formData.vehicule.kilometrage}
                      onChange={(e) => handleChange('vehicule', 'kilometrage', e.target.value)}
                    />
                  </div>
                </section>

                <section className="form-section">
                  <h4>Vente &amp; signature</h4>
                  <div className="form-grid">
                    <input
                      type="date"
                      title="Date de vente"
                      value={formData.vente.dateVente}
                      onChange={(e) => handleChange('vente', 'dateVente', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Prix TTC (€)"
                      value={formData.vente.prixTTC}
                      onChange={(e) => handleChange('vente', 'prixTTC', e.target.value)}
                      step="0.01"
                      required
                    />
                    <input
                      type="date"
                      title="Date de signature"
                      value={formData.vente.dateSignature}
                      onChange={(e) => handleChange('vente', 'dateSignature', e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Lieu de signature (ville)"
                        value={formData.vente.lieuSignature}
                        onChange={(e) => handleChange('vente', 'lieuSignature', e.target.value)}
                        style={{ flex: 1 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={requestGeolocation}
                        disabled={geoStatus === 'loading'}
                        title="Utiliser ma position"
                        style={{ width: 44, cursor: 'pointer' }}
                      >
                        {geoStatus === 'loading' ? '…' : '📍'}
                      </button>
                    </div>
                    <select
                      value={formData.vente.modePaiement}
                      onChange={(e) => handleChange('vente', 'modePaiement', e.target.value)}
                      className="span-2"
                    >
                      <option>Espèces</option>
                      <option>Chèque</option>
                      <option>Virement</option>
                      <option>Carte bancaire</option>
                    </select>
                  </div>
                </section>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" disabled={loading} className="btn-generate">
                  {loading ? 'Génération...' : '📄 Générer le CERFA 15776 (Gratuit)'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

