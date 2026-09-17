import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import '../components/SiteChrome.css';

const DOCS = [
  { name: 'Certificat de cession CERFA 15776', free: true },
  { name: 'Mandat d’immatriculation CERFA 13757', free: false },
  { name: 'Formulaire immatriculation CERFA 13750', free: false },
  { name: 'Bon de commande', free: false },
  { name: 'Facture de vente', free: false },
  { name: 'Contrat de vente', free: false },
  { name: 'Contrat de garantie', free: false },
  { name: 'PV de livraison', free: false },
  { name: 'Quitus fiscal 1993-PART-D', free: false }
];

export default function DocumentsPage() {
  usePageMeta({
    title: 'Documents de vente véhicule — CERFA, facture, mandat',
    description:
      'Liste des documents générés par ActeDeVente.fr : CERFA cession, mandat, facture, contrat, garantie, quitus fiscal. Compte gratuit pour le pack complet.',
    path: '/documents-vente-vehicule'
  });

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <h1>Documents de vente de véhicule</h1>
        <p className="seo-lead">
          ActeDeVente.fr centralise les principaux papiers d’une cession automobile : du CERFA 15776
          gratuit au pack complet pour garages et particuliers.
        </p>

        <div className="seo-cta-row">
          <Link to="/register" className="ac-btn ac-btn-accent">
            Créer un compte gratuit
          </Link>
          <Link to="/#cerfa" className="ac-btn ac-btn-outline" style={{ color: 'var(--ink)', borderColor: 'var(--line)' }}>
            CERFA 15776 sans compte
          </Link>
        </div>

        <h2>Documents disponibles</h2>
        <ul>
          {DOCS.map((doc) => (
            <li key={doc.name}>
              <strong>{doc.name}</strong>
              {doc.free ? ' — accessible sans compte' : ' — avec compte gratuit'}
            </li>
          ))}
        </ul>

        <h2>Pro ou particulier</h2>
        <p>
          Chaque génération permet de choisir le statut du vendeur et de l’acheteur. Les champs
          (raison sociale / SIRET ou nom / prénom) et le contenu des PDF s’adaptent automatiquement.
        </p>

        <h2>Pour aller plus loin</h2>
        <div className="seo-card-grid">
          <Link to="/cerfa-15776" className="seo-card">
            <h3>Guide CERFA 15776</h3>
            <p>Certificat de cession en ligne</p>
          </Link>
          <Link to="/blog/documents-vente-pro-particulier" className="seo-card">
            <h3>Pro vs particulier</h3>
            <p>Quels documents selon le statut</p>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
