import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader, { SiteFooter } from '../components/SiteChrome';
import ContentBlocks, { FaqList, faqJsonLd, breadcrumbJsonLd, JsonLd } from '../components/ContentBlocks';
import { usePageMeta } from '../seo/usePageMeta';
import { SITE_URL, BRAND_NAME } from '../brand';
import '../components/SiteChrome.css';

const FAQ = [
  {
    q: 'Le certificat de cession est-il gratuit sur ActeDeVente.fr ?',
    a: 'Oui. Le CERFA 15776 se génère gratuitement et sans inscription. Un compte gratuit débloque le pack complet (mandat, facture, contrat, garantie, quitus fiscal…).'
  },
  {
    q: 'ActeDeVente.fr déclare-t-il la cession à ma place ?',
    a: 'Non. ActeDeVente.fr n’est pas un service de l’ANTS : nous générons le document rempli. La déclaration de cession se fait gratuitement sur le site officiel de l’ANTS.'
  },
  {
    q: 'Faut-il un certificat de cession pour donner sa voiture à un proche ?',
    a: 'Oui. Un don est une cession à titre gratuit : le certificat de cession est obligatoire, comme pour une vente.'
  },
  {
    q: 'La carte grise a deux titulaires : qui signe ?',
    a: 'Les deux titulaires doivent signer le certificat de cession et barrer la carte grise.'
  },
  {
    q: 'Puis-je indiquer un vendeur particulier et un acheteur professionnel ?',
    a: 'Oui. Chaque partie a un sélecteur Particulier / Professionnel : les champs (nom et prénom, ou raison sociale et SIRET) et le PDF s’adaptent.'
  },
  {
    q: 'Combien de temps l’acheteur a-t-il pour refaire la carte grise ?',
    a: 'L’acheteur dispose d’un mois à compter de la vente pour immatriculer le véhicule à son nom.'
  }
];

const CONTENT = [
  { type: 'h2', text: 'À quoi sert le certificat de cession ?' },
  {
    type: 'p',
    text: 'Le certificat de cession atteste qu’un véhicule a changé de propriétaire, à une **date et une heure précises**. C’est ce moment qui sépare les responsabilités : à partir de là, les infractions commises avec le véhicule ne concernent plus le vendeur mais l’acheteur.'
  },
  {
    type: 'p',
    text: 'Il est obligatoire pour toute cession d’un véhicule d’occasion immatriculé en France : **vente, don** (même en famille) ou **cession pour destruction**. Le vendeur s’en sert pour déclarer la cession à l’ANTS, l’acheteur pour faire immatriculer le véhicule à son nom.'
  },
  { type: 'h2', text: 'Les informations à préparer' },
  {
    type: 'ul',
    items: [
      '**Le véhicule** (sur la carte grise) : immatriculation (case A), date de 1re immatriculation (case B), numéro VIN (case E), marque et modèle (cases D.1 à D.3), kilométrage au compteur',
      '**Le vendeur** : nom et prénom, ou raison sociale et SIRET pour un professionnel ; adresse',
      '**L’acheteur** : mêmes informations ; date et lieu de naissance pour un particulier',
      '**La cession** : date et **heure** de la vente, nature (vente, don ou destruction)'
    ]
  },
  { type: 'h2', text: 'Remplir le CERFA 15776 en 5 étapes' },
  {
    type: 'ol',
    items: [
      '**Choisissez le statut** du vendeur et de l’acheteur (particulier ou professionnel) : les champs s’adaptent',
      '**Saisissez les informations du véhicule** en recopiant la carte grise',
      '**Renseignez les deux parties**, vendeur puis acheteur',
      '**Indiquez la date et l’heure exactes** de la vente',
      '**Téléchargez le PDF**, imprimez-le en **deux exemplaires** et faites-les signer : chacun garde le sien'
    ]
  },
  { type: 'h2', text: 'Après la signature : les 3 obligations du vendeur' },
  {
    type: 'ol',
    items: [
      '**Barrer la carte grise** avec la mention « Vendu le [date] à [heure] » (ou « Cédé le… »), la signer et remettre le coupon détachable à l’acheteur',
      '**Remettre à l’acheteur** un **certificat de situation administrative** (ex-certificat de non-gage) de moins de 15 jours et, pour un véhicule de plus de 4 ans, le **procès-verbal de contrôle technique de moins de 6 mois** (moins de 2 mois en cas de contre-visite). Le contrôle technique n’est pas exigé en cas de vente à un professionnel de l’automobile',
      '**Déclarer la cession sur le site de l’ANTS dans les 15 jours** qui suivent la vente. Vous obtenez un **code de cession** à transmettre à l’acheteur'
    ]
  },
  {
    type: 'note',
    text: '⚠️ Tant que la cession n’est pas déclarée à l’ANTS, les avis de contravention liés au véhicule peuvent continuer à vous être adressés.'
  },
  { type: 'h2', text: 'Particulier ou professionnel : quels documents ?' },
  {
    type: 'table',
    head: ['Situation', 'Documents à prévoir'],
    rows: [
      ['Particulier → Particulier', 'Certificat de cession ; un écrit précisant prix et état du véhicule est conseillé'],
      ['Particulier → Professionnel', 'Certificat de cession ; le professionnel enregistre de son côté une déclaration d’achat'],
      ['Professionnel → Particulier', 'Certificat de cession + [facture](/facture-vente-vehicule-occasion) + [contrat de vente](/contrat-vente-vehicule-occasion) + [mandat d’immatriculation](/mandat-immatriculation-cerfa-13757) si le garage fait la carte grise'],
      ['Professionnel → Professionnel', 'Certificat de cession + facture']
    ]
  },
  {
    type: 'p',
    text: 'ActeDeVente.fr génère [l’ensemble de ces documents](/documents-vente-vehicule) à partir d’une seule saisie.'
  },
  { type: 'h2', text: 'Les erreurs les plus fréquentes' },
  {
    type: 'ul',
    items: [
      '**Oublier l’heure de la vente** : c’est elle qui délimite les responsabilités en cas d’infraction',
      '**Un numéro VIN erroné** : une seule erreur bloque l’immatriculation de l’acheteur ; recopiez la case E',
      '**Un seul exemplaire signé** : il en faut deux',
      '**Dépasser le délai de 15 jours** pour déclarer la cession à l’ANTS',
      '**Une date incohérente** avec celle inscrite sur la carte grise barrée'
    ]
  }
];

export default function Cerfa15776Page() {
  usePageMeta({
    title: 'Certificat de cession CERFA 15776 en ligne — PDF gratuit, sans inscription',
    description:
      'Remplissez votre certificat de cession (CERFA 15776) en ligne et téléchargez le PDF prêt à signer. Gratuit, sans inscription, vendeur particulier ou professionnel. Guide et obligations.',
    path: '/cerfa-15776'
  });

  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `Générateur de certificat de cession CERFA 15776 — ${BRAND_NAME}`,
    url: `${SITE_URL}/cerfa-15776`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'fr-FR',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL }
  };

  return (
    <div className="seo-page">
      <SiteHeader />
      <main className="seo-main">
        <JsonLd data={appLd} />
        <JsonLd data={faqJsonLd(FAQ)} />
        <JsonLd
          data={breadcrumbJsonLd(SITE_URL, [
            { name: 'Accueil', path: '/' },
            { name: 'Certificat de cession CERFA 15776', path: '/cerfa-15776' }
          ])}
        />

        <h1>Certificat de cession CERFA 15776 : remplissez-le en ligne, gratuitement</h1>
        <p className="seo-lead">
          Vous vendez ou donnez un véhicule ? Le <strong>certificat de cession (CERFA n°15776)</strong> est
          le document obligatoire qui officialise le changement de propriétaire. Remplissez-le en ligne :
          le PDF est généré immédiatement, <strong>sans inscription</strong>, que le vendeur et l’acheteur
          soient particuliers ou professionnels.
        </p>

        <div className="seo-cta-row">
          <Link to="/#cerfa" className="ac-btn ac-btn-accent">
            Générer mon certificat de cession
          </Link>
          <Link to="/blog/comment-remplir-cerfa-15776" style={{ alignSelf: 'center', color: 'var(--accent-deep)' }}>
            Lire le guide de remplissage
          </Link>
        </div>

        <ContentBlocks blocks={CONTENT} />

        <h2>Questions fréquentes</h2>
        <FaqList faq={FAQ} />

        <div className="seo-cta-row">
          <Link to="/#cerfa" className="ac-btn ac-btn-accent">
            Générer mon certificat de cession
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
