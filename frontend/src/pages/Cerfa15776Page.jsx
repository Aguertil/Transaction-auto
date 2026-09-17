import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import { usePageMeta } from '../seo/usePageMeta';
import '../components/SiteChrome.css';

export default function Cerfa15776Page() {
  usePageMeta({
    title: 'CERFA 15776 en ligne — certificat de cession véhicule',
    description:
      'Générez gratuitement votre certificat de cession CERFA 15776 en ligne. Formulaire vendeur / acheteur pro ou particulier, PDF immédiat.',
    path: '/cerfa-15776'
  });

  const faq = [
    {
      q: 'Le CERFA 15776 est-il obligatoire ?',
      a: 'Oui, le certificat de cession est le document standard pour déclarer la vente d’un véhicule d’occasion en France. Les deux parties doivent le conserver.'
    },
    {
      q: 'Faut-il créer un compte ?',
      a: 'Non pour le CERFA 15776 de base. Un compte gratuit débloque mandat, facture, contrat, garantie et quitus.'
    },
    {
      q: 'Puis-je vendre en tant que particulier ?',
      a: 'Oui. Choisissez le statut « Particulier » ou « Professionnel » pour le vendeur et l’acheteur avant de remplir le formulaire.'
    }
  ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <h1>CERFA 15776 en ligne — certificat de cession</h1>
        <p className="seo-lead">
          Remplissez et téléchargez votre certificat de cession véhicule (CERFA 15776) sur ActeDeVente.fr.
          Sans compte pour démarrer, adapté aux ventes entre particuliers et professionnels.
        </p>

        <div className="seo-cta-row">
          <Link to="/#cerfa" className="ac-btn ac-btn-accent">
            Générer mon CERFA 15776
          </Link>
          <Link to="/blog/comment-remplir-cerfa-15776" style={{ alignSelf: 'center', color: 'var(--accent-deep)' }}>
            Lire le guide complet
          </Link>
        </div>

        <h2>Pourquoi utiliser ActeDeVente.fr ?</h2>
        <ul>
          <li>Formulaire guidé vendeur / acheteur (pro ou particulier)</li>
          <li>PDF généré immédiatement</li>
          <li>Même outil pour étendre aux autres documents de vente</li>
        </ul>

        <h2>Comment ça marche ?</h2>
        <ol>
          <li>Ouvrez le générateur sur la page d’accueil</li>
          <li>Sélectionnez le statut des parties</li>
          <li>Saisissez véhicule et conditions de vente</li>
          <li>Téléchargez le ZIP contenant le CERFA</li>
        </ol>

        <h2>Questions fréquentes</h2>
        {faq.map((item) => (
          <div key={item.q} className="faq-item">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
