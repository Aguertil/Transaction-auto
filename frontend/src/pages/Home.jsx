import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  BRAND_NAME,
  BRAND_HEADLINE,
  BRAND_SUPPORT
} from '../brand';
import PartyTypeToggle from '../components/PartyTypeToggle';
import { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import './Home.css';
import '../components/SiteChrome.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Home() {
  const { user } = useAuth();

  usePageMeta({
    title: 'ActeDeVente.fr — CERFA 15776 & actes de vente auto en ligne',
    description:
      'Générez en ligne votre certificat de cession CERFA 15776, mandat, facture et contrat de vente véhicule. Gratuit pour démarrer — pro ou particulier.',
    path: '/'
  });

  const [formData, setFormData] = useState({
    societe: {
      type: 'pro',
      raisonSociale: '',
      siret: '',
      nom: '',
      prenom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      telephone: '',
      email: ''
    },
    client: {
      type: 'particulier',
      nom: '',
      prenom: '',
      raisonSociale: '',
      siret: '',
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
      localStorage.setItem('societeData', JSON.stringify(formData.societe));
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
    <div className="home-page">
      <nav className="ac-nav" aria-label="Navigation principale">
        <div className="ac-nav-links">
          <a href="#cerfa" className="ac-nav-skip">CERFA 15776</a>
          <Link to="/documents-vente-vehicule" className="ac-nav-skip">Documents</Link>
          <Link to="/blog" className="ac-nav-skip">Blog</Link>
        </div>
        <div className="ac-nav-actions">
          {user ? (
            <Link to="/dashboard" className="ac-btn ac-btn-ghost">Mon espace</Link>
          ) : (
            <>
              <Link to="/login" className="ac-btn ac-btn-ghost">Connexion</Link>
              <Link to="/register" className="ac-btn ac-btn-solid">Inscription</Link>
            </>
          )}
        </div>
      </nav>

      <header className="ac-hero">
        <div className="ac-hero-media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80"
            alt=""
          />
          <div className="ac-hero-veil" />
        </div>

        <div className="ac-hero-content">
          <h1 className="ac-brand">
            {BRAND_NAME}
            <span className="ac-brand-sub">{BRAND_HEADLINE}</span>
          </h1>
          <p className="ac-support">{BRAND_SUPPORT}</p>
          <div className="ac-hero-ctas">
            <a href="#cerfa" className="ac-btn ac-btn-accent">Générer le CERFA 15776</a>
            {user ? (
              <Link to="/generate" className="ac-btn ac-btn-outline">Tous les documents</Link>
            ) : (
              <Link to="/register" className="ac-btn ac-btn-outline">Créer un compte</Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section id="cerfa" className="ac-section ac-cerfa">
          <div className="ac-section-inner">
            <div className="ac-section-intro">
              <h2>Certificat de cession — CERFA 15776</h2>
              <p>
                Remplissez les informations de la vente. Le PDF réglementaire est généré immédiatement, sans inscription.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="ac-form">
              <fieldset className="ac-fieldset">
                <legend>Vendeur</legend>
                <PartyTypeToggle
                  id="vendeur-type"
                  label="Statut du vendeur"
                  value={formData.societe.type}
                  onChange={(type) => handleChange('societe', 'type', type)}
                />
                <div className="ac-grid">
                  {formData.societe.type === 'pro' ? (
                    <>
                      <input
                        name="societe-raison"
                        type="text"
                        placeholder="Raison sociale"
                        value={formData.societe.raisonSociale}
                        onChange={(e) => handleChange('societe', 'raisonSociale', e.target.value)}
                        required
                      />
                      <input
                        name="societe-siret"
                        type="text"
                        placeholder="SIRET"
                        value={formData.societe.siret}
                        onChange={(e) => handleChange('societe', 'siret', e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        name="societe-prenom"
                        type="text"
                        placeholder="Prénom"
                        value={formData.societe.prenom}
                        onChange={(e) => handleChange('societe', 'prenom', e.target.value)}
                        required
                      />
                      <input
                        name="societe-nom"
                        type="text"
                        placeholder="Nom"
                        value={formData.societe.nom}
                        onChange={(e) => handleChange('societe', 'nom', e.target.value)}
                        required
                      />
                    </>
                  )}
                  <input
                    name="societe-adresse"
                    type="text"
                    placeholder="Adresse"
                    value={formData.societe.adresse}
                    onChange={(e) => handleChange('societe', 'adresse', e.target.value)}
                    className="span-2"
                  />
                  <input
                    name="societe-cp"
                    type="text"
                    placeholder="Code postal"
                    value={formData.societe.codePostal}
                    onChange={(e) => handleChange('societe', 'codePostal', e.target.value)}
                  />
                  <input
                    name="societe-ville"
                    type="text"
                    placeholder="Ville"
                    value={formData.societe.ville}
                    onChange={(e) => handleChange('societe', 'ville', e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="ac-fieldset">
                <legend>Acheteur</legend>
                <PartyTypeToggle
                  id="acheteur-type"
                  label="Statut de l’acheteur"
                  value={formData.client.type}
                  onChange={(type) => handleChange('client', 'type', type)}
                />
                <div className="ac-grid">
                  {formData.client.type === 'pro' ? (
                    <>
                      <input
                        name="client-raison"
                        type="text"
                        placeholder="Raison sociale"
                        value={formData.client.raisonSociale}
                        onChange={(e) => handleChange('client', 'raisonSociale', e.target.value)}
                        required
                      />
                      <input
                        name="client-siret"
                        type="text"
                        placeholder="SIRET"
                        value={formData.client.siret}
                        onChange={(e) => handleChange('client', 'siret', e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <input
                        name="client-prenom"
                        type="text"
                        placeholder="Prénom"
                        autoComplete="given-name"
                        value={formData.client.prenom}
                        onChange={(e) => handleChange('client', 'prenom', e.target.value)}
                        required
                      />
                      <input
                        name="client-nom"
                        type="text"
                        placeholder="Nom"
                        autoComplete="family-name"
                        value={formData.client.nom}
                        onChange={(e) => handleChange('client', 'nom', e.target.value)}
                        required
                      />
                    </>
                  )}
                  <input
                    name="client-adresse"
                    type="text"
                    placeholder="Adresse"
                    value={formData.client.adresse}
                    onChange={(e) => handleChange('client', 'adresse', e.target.value)}
                    className="span-2"
                    required
                  />
                  <input
                    name="client-cp"
                    type="text"
                    placeholder="Code postal"
                    value={formData.client.codePostal}
                    onChange={(e) => handleChange('client', 'codePostal', e.target.value)}
                    required
                  />
                  <input
                    name="client-ville"
                    type="text"
                    placeholder="Ville"
                    value={formData.client.ville}
                    onChange={(e) => handleChange('client', 'ville', e.target.value)}
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="ac-fieldset">
                <legend>Véhicule</legend>
                <div className="ac-grid">
                  <input
                    name="vehicule-marque"
                    type="text"
                    placeholder="Marque"
                    value={formData.vehicule.marque}
                    onChange={(e) => handleChange('vehicule', 'marque', e.target.value)}
                    required
                  />
                  <input
                    name="vehicule-modele"
                    type="text"
                    placeholder="Modèle"
                    value={formData.vehicule.modele}
                    onChange={(e) => handleChange('vehicule', 'modele', e.target.value)}
                    required
                  />
                  <input
                    name="vehicule-immat"
                    type="text"
                    placeholder="Immatriculation"
                    value={formData.vehicule.immatriculation}
                    onChange={(e) => handleChange('vehicule', 'immatriculation', e.target.value)}
                    required
                  />
                  <input
                    name="vehicule-vin"
                    type="text"
                    placeholder="VIN"
                    value={formData.vehicule.vin}
                    onChange={(e) => handleChange('vehicule', 'vin', e.target.value)}
                    required
                  />
                  <input
                    name="vehicule-date-immat"
                    type="date"
                    title="Date première immatriculation"
                    value={formData.vehicule.datePremiereImmat}
                    onChange={(e) => handleChange('vehicule', 'datePremiereImmat', e.target.value)}
                  />
                  <input
                    name="vehicule-km"
                    type="number"
                    placeholder="Kilométrage"
                    value={formData.vehicule.kilometrage}
                    onChange={(e) => handleChange('vehicule', 'kilometrage', e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="ac-fieldset">
                <legend>Vente &amp; signature</legend>
                <div className="ac-grid">
                  <input
                    name="vente-date"
                    type="date"
                    title="Date de vente"
                    value={formData.vente.dateVente}
                    onChange={(e) => handleChange('vente', 'dateVente', e.target.value)}
                    required
                  />
                  <input
                    name="vente-prix"
                    type="number"
                    placeholder="Prix TTC (€)"
                    value={formData.vente.prixTTC}
                    onChange={(e) => handleChange('vente', 'prixTTC', e.target.value)}
                    step="0.01"
                    required
                  />
                  <input
                    name="vente-date-signature"
                    type="date"
                    title="Date de signature"
                    value={formData.vente.dateSignature}
                    onChange={(e) => handleChange('vente', 'dateSignature', e.target.value)}
                    required
                  />
                  <div className="ac-geo-row">
                    <input
                      name="vente-lieu"
                      type="text"
                      placeholder="Lieu de signature (ville)"
                      value={formData.vente.lieuSignature}
                      onChange={(e) => handleChange('vente', 'lieuSignature', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="ac-btn-geo"
                      onClick={requestGeolocation}
                      disabled={geoStatus === 'loading'}
                      title="Utiliser ma position"
                    >
                      {geoStatus === 'loading' ? '…' : 'GPS'}
                    </button>
                  </div>
                  <select
                    name="vente-paiement"
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
              </fieldset>

              {error && <div className="ac-error" role="alert">{error}</div>}

              <button type="submit" disabled={loading} className="ac-btn ac-btn-accent ac-btn-block">
                {loading ? 'Génération en cours…' : 'Générer le CERFA 15776'}
              </button>
            </form>
          </div>
        </section>

        <section className="ac-section ac-seo-block" aria-labelledby="why-title">
          <div className="ac-section-inner">
            <h2 id="why-title">Actes de vente et CERFA pour garages et particuliers</h2>
            <p>
              ActeDeVente.fr vous aide à produire un certificat de cession (CERFA 15776), un mandat
              d’immatriculation, une facture ou un contrat selon que le vendeur et l’acheteur sont
              professionnels ou particuliers.
            </p>
            <ul className="ac-seo-list">
              <li>
                <Link to="/cerfa-15776">Guide CERFA 15776</Link> — certificat de cession en ligne
              </li>
              <li>
                <Link to="/documents-vente-vehicule">Tous les documents</Link> — pack vente véhicule
              </li>
              <li>
                <Link to="/blog">Blog</Link> — conseils et procédures
              </li>
            </ul>
          </div>
        </section>

        <section className="ac-section ac-account">
          <div className="ac-section-inner ac-account-inner">
            <h2>{user ? 'Votre pack documents est prêt' : 'Un compte pour tous les CERFA'}</h2>
            <p>
              {user
                ? 'Mandat, facture, garantie, quitus fiscal et plus — disponibles dans votre espace.'
                : 'Créez un compte gratuit pour générer l’ensemble des documents de transaction automobile.'}
            </p>
            {user ? (
              <Link to="/generate" className="ac-btn ac-btn-accent">Ouvrir la génération</Link>
            ) : (
              <Link to="/register" className="ac-btn ac-btn-accent">Créer mon compte</Link>
            )}
          </div>
        </section>

        <section className="ac-section ac-faq" aria-labelledby="faq-title">
          <div className="ac-section-inner">
            <h2 id="faq-title">Questions fréquentes</h2>
            <div className="faq-item">
              <h3>Le CERFA 15776 est-il gratuit sur ActeDeVente.fr ?</h3>
              <p>Oui. Le certificat de cession de base se génère sans inscription. Le pack complet nécessite un compte gratuit.</p>
            </div>
            <div className="faq-item">
              <h3>Puis-je indiquer un vendeur particulier et un acheteur professionnel ?</h3>
              <p>Oui. Chaque partie a un sélecteur Particulier / Professionnel : les champs et les PDF s’adaptent.</p>
            </div>
            <div className="faq-item">
              <h3>Les documents remplacent-ils une démarche ANTS officielle ?</h3>
              <p>Non. Nous générons des formulaires remplis à vérifier et à utiliser dans vos démarches. La responsabilité des données vous appartient.</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
