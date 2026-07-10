import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GenerateDocuments.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function GenerateDocuments() {
  const { user, hasPremiumAccess } = useAuth();
  const navigate = useNavigate();
  const [availableDocs, setAvailableDocs] = useState({ free: [], premium: [] });
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
      email: '',
      dateNaissance: '',
      lieuNaissance: ''
    },
    vehicule: {
      marque: '',
      modele: '',
      immatriculation: '',
      vin: '',
      datePremiereImmat: '',
      kilometrage: '',
      couleur: '',
      denominationCommerciale: '',
      typeVarianteVersion: '',
      genreNational: ''
    },
    vente: {
      dateVente: todayLocalISO(),
      dateSignature: todayLocalISO(),
      lieuSignature: '',
      prixTTC: '',
      modePaiement: 'Espèces',
      numeroFacture: '',
      heure: ''
    },
    vendeurUE: {
      raisonSociale: '',
      numeroTVA: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: '',
      telephone: '',
      email: ''
    },
    options: {
      selectedDocuments: [],
      editable: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrWarnings, setOcrWarnings] = useState([]);
  const [ocrPreviews, setOcrPreviews] = useState([]);
  const [ocrFields, setOcrFields] = useState([]);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | ok | denied | error
  const [uploads, setUploads] = useState({
    'carte-grise': null,
    kbis: null,
    cni: null,
    domicile: null
  });

  useEffect(() => {
    fetchAvailableDocs();
    const saved = localStorage.getItem('societeData');
    if (saved) {
      const societe = JSON.parse(saved);
      setFormData(prev => ({ ...prev, societe }));
    }
    // Demander la localisation au chargement pour le lieu de signature
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
          // Nominatim (OpenStreetMap) — reverse geocoding gratuit
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
          const res = await fetch(url, {
            headers: { Accept: 'application/json' }
          });
          if (!res.ok) throw new Error('reverse geocode failed');
          const json = await res.json();
          const addr = json.address || {};
          const ville =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            '';
          if (ville) {
            setFormData(prev => ({
              ...prev,
              vente: { ...prev.vente, lieuSignature: String(ville).toUpperCase() }
            }));
            setGeoStatus('ok');
          } else {
            setGeoStatus('error');
          }
        } catch {
          setGeoStatus('error');
        }
      },
      (err) => {
        setGeoStatus(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  };

  const fetchAvailableDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/api/documents/available`, { headers });
      setAvailableDocs(response.data);
      
      // Sélectionner les documents par défaut selon l'accès
      const defaultDocs = hasPremiumAccess()
        ? [...response.data.free, ...response.data.premium]
            .filter(doc => doc.available)
            .map(doc => doc.type)
        : response.data.free.map(doc => doc.type);
      
      setFormData(prev => ({
        ...prev,
        options: { ...prev.options, selectedDocuments: defaultDocs }
      }));
    } catch (error) {
      console.error('Erreur récupération documents:', error);
    }
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

  const handleFileSelect = (docType, file) => {
    setUploads(prev => ({ ...prev, [docType]: file || null }));
    setOcrWarnings([]);
  };

  const applyExtractedData = (data) => {
    setFormData(prev => ({
      ...prev,
      societe: { ...prev.societe, ...filterEmpty(data.societe) },
      client: { ...prev.client, ...filterEmpty(data.client) },
      vehicule: { ...prev.vehicule, ...filterEmpty(data.vehicule) }
    }));
  };

  const filterEmpty = (obj = {}) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));

  const handleOcrExtract = async () => {
    const filesToSend = Object.entries(uploads).filter(([, file]) => file);
    if (!filesToSend.length) {
      setError('Ajoutez au moins un document à lire.');
      return;
    }

    setOcrLoading(true);
    setError(null);
    setOcrWarnings([]);
    setOcrPreviews([]);
    setOcrFields([]);

    try {
      const form = new FormData();
      filesToSend.forEach(([docType, file]) => {
        form.append(docType, file);
      });

      const response = await axios.post(`${API_URL}/api/ocr/extract`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000
      });

      applyExtractedData(response.data.data);
      setOcrWarnings(response.data.warnings || []);
      setOcrFields(response.data.extractedFields || []);
      setOcrPreviews(
        (response.data.documents || []).map((d) => ({
          type: d.type,
          method: d.method,
          confidence: d.ocrConfidence,
          preview: d.textPreview
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la lecture OCR');
    } finally {
      setOcrLoading(false);
    }
  };

  const toggleDocument = (docType) => {
    setFormData(prev => {
      const selected = prev.options.selectedDocuments;
      const newSelected = selected.includes(docType)
        ? selected.filter(t => t !== docType)
        : [...selected, docType];
      return {
        ...prev,
        options: { ...prev.options, selectedDocuments: newSelected }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = hasPremiumAccess()
        ? `${API_URL}/api/documents/generate`
        : `${API_URL}/api/documents/public/generate`;

      const response = await axios.post(endpoint, formData, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'documents.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const allDocuments = [...availableDocs.free, ...availableDocs.premium];

  return (
    <div className="generate-container">
      <header className="generate-header">
        <h1>Génération de documents</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Retour
        </button>
      </header>

      <main className="generate-main">
        <form onSubmit={handleSubmit} className="generate-form">
          <section className="form-section ocr-section">
            <h3>Lecture automatique des pièces (gratuit)</h3>
            <p className="ocr-hint">
              Uploadez la <strong>carte grise</strong> pour le véhicule, ou le trio{' '}
              <strong>KBIS + carte d&apos;identité + justificatif de domicile</strong> pour l&apos;acheteur
              et la société. Les champs seront pré-remplis — vérifiez-les avant génération.
            </p>
            <div className="ocr-upload-grid">
              {[
                { key: 'carte-grise', label: 'Carte grise', hint: 'Véhicule' },
                { key: 'kbis', label: 'KBIS', hint: 'Société vendeur' },
                { key: 'cni', label: "Carte d'identité", hint: 'Acheteur' },
                { key: 'domicile', label: 'Justificatif de domicile', hint: 'Adresse acheteur' }
              ].map(({ key, label, hint }) => (
                <label key={key} className="ocr-upload-card">
                  <span className="ocr-upload-title">{label}</span>
                  <span className="ocr-upload-sub">{hint}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(e) => handleFileSelect(key, e.target.files?.[0] || null)}
                  />
                  <span className="ocr-file-name">
                    {uploads[key] ? uploads[key].name : 'JPG, PNG ou PDF'}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn-ocr"
              onClick={handleOcrExtract}
              disabled={ocrLoading}
            >
              {ocrLoading ? 'Lecture en cours (peut prendre 30–90 s)...' : 'Lire les documents'}
            </button>
            {ocrFields.length > 0 && (
              <p className="ocr-success">
                {ocrFields.length} champ(s) prérempli(s). Vérifiez le formulaire ci-dessous.
              </p>
            )}
            {ocrWarnings.length > 0 && (
              <ul className="ocr-warnings">
                {ocrWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
            {ocrPreviews.length > 0 && (
              <details className="ocr-preview-box">
                <summary>Texte lu par l’OCR (aperçu)</summary>
                {ocrPreviews.map((p) => (
                  <div key={p.type} className="ocr-preview-item">
                    <strong>
                      {p.type}
                      {p.method ? ` · ${p.method}` : ''}
                      {p.confidence != null ? ` · ${p.confidence}%` : ''}
                    </strong>
                    <pre>{p.preview || '(vide)'}</pre>
                  </div>
                ))}
              </details>
            )}
          </section>

          <section className="form-section">
            <h3>Documents à générer</h3>
            <div className="documents-selector">
              {allDocuments.map(doc => (
                <label key={doc.type} className={`doc-checkbox ${!doc.available ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.options.selectedDocuments.includes(doc.type)}
                    onChange={() => toggleDocument(doc.type)}
                    disabled={!doc.available}
                  />
                  <span>{doc.label}</span>
                  {!doc.available && <span className="lock-icon">🔒</span>}
                </label>
              ))}
            </div>
            <div className="form-option">
              <label>
                <input
                  type="checkbox"
                  checked={formData.options.editable}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    options: { ...prev.options, editable: e.target.checked }
                  }))}
                />
                Mode Éditable (PDFs modifiables)
              </label>
            </div>
          </section>

          <section className="form-section">
            <h3>Société vendeur</h3>
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
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.societe.telephone}
                onChange={(e) => handleChange('societe', 'telephone', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.societe.email}
                onChange={(e) => handleChange('societe', 'email', e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Client acheteur</h3>
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
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.client.telephone}
                onChange={(e) => handleChange('client', 'telephone', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.client.email}
                onChange={(e) => handleChange('client', 'email', e.target.value)}
              />
              <input
                type="date"
                placeholder="Date de naissance"
                value={formData.client.dateNaissance}
                onChange={(e) => handleChange('client', 'dateNaissance', e.target.value)}
              />
              <input
                type="text"
                placeholder="Lieu de naissance"
                value={formData.client.lieuNaissance}
                onChange={(e) => handleChange('client', 'lieuNaissance', e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Véhicule</h3>
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
              <input
                type="text"
                placeholder="Couleur"
                value={formData.vehicule.couleur}
                onChange={(e) => handleChange('vehicule', 'couleur', e.target.value)}
              />
            </div>
          </section>

          <section className="form-section">
            <h3>Vente &amp; signature</h3>
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
              <div className="lieu-signature-field">
                <input
                  type="text"
                  placeholder="Lieu de signature (ville)"
                  value={formData.vente.lieuSignature}
                  onChange={(e) => handleChange('vente', 'lieuSignature', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-geo"
                  onClick={requestGeolocation}
                  disabled={geoStatus === 'loading'}
                  title="Utiliser la position de cet appareil"
                >
                  {geoStatus === 'loading' ? '…' : '📍'}
                </button>
              </div>
              {geoStatus === 'ok' && (
                <p className="geo-hint span-2">Position détectée — lieu prérempli (modifiable).</p>
              )}
              {geoStatus === 'denied' && (
                <p className="geo-hint warn span-2">
                  Localisation refusée. Autorisez l&apos;accès dans le navigateur ou saisissez la ville.
                </p>
              )}
              {geoStatus === 'error' && (
                <p className="geo-hint warn span-2">
                  Impossible de détecter la position. Saisissez le lieu manuellement.
                </p>
              )}
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
              <input
                type="text"
                placeholder="Numéro de facture (optionnel)"
                value={formData.vente.numeroFacture}
                onChange={(e) => handleChange('vente', 'numeroFacture', e.target.value)}
                className="span-2"
              />
            </div>
          </section>

          {formData.options.selectedDocuments.includes('quitus-fiscal') && (
            <section className="form-section">
              <h3>Vendeur UE (quitus fiscal)</h3>
              <p className="ocr-hint">
                Vendeur domicilié dans un autre État membre de l&apos;UE — requis pour le formulaire 1993-PART-D.
              </p>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Nom / raison sociale"
                  value={formData.vendeurUE.raisonSociale}
                  onChange={(e) => handleChange('vendeurUE', 'raisonSociale', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="N° TVA intracommunautaire"
                  value={formData.vendeurUE.numeroTVA}
                  onChange={(e) => handleChange('vendeurUE', 'numeroTVA', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={formData.vendeurUE.adresse}
                  onChange={(e) => handleChange('vendeurUE', 'adresse', e.target.value)}
                  className="span-2"
                />
                <input
                  type="text"
                  placeholder="Code postal"
                  value={formData.vendeurUE.codePostal}
                  onChange={(e) => handleChange('vendeurUE', 'codePostal', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={formData.vendeurUE.ville}
                  onChange={(e) => handleChange('vendeurUE', 'ville', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Pays"
                  value={formData.vendeurUE.pays}
                  onChange={(e) => handleChange('vendeurUE', 'pays', e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.vendeurUE.telephone}
                  onChange={(e) => handleChange('vendeurUE', 'telephone', e.target.value)}
                />
              </div>
            </section>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading || formData.options.selectedDocuments.length === 0} className="btn-generate">
            {loading ? 'Génération...' : `Générer ${formData.options.selectedDocuments.length} document(s)`}
          </button>
        </form>
      </main>
    </div>
  );
}

