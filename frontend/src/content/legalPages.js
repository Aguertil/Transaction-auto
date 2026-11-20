import { LEGAL_INFO as L } from './legalInfo';

export const legalPages = [
  {
    path: '/mentions-legales',
    title: 'Mentions légales',
    description: 'Mentions légales du site ActeDeVente.fr : éditeur, hébergeur, propriété intellectuelle et responsabilité.',
    h1: 'Mentions légales',
    updated: L.updated,
    content: [
      { type: 'h2', text: 'Éditeur du site' },
      {
        type: 'ul',
        items: [
          `**Éditeur** : ${L.editeur} — ${L.formeJuridique}${L.capital ? `, au capital de ${L.capital}` : ''}`,
          `**Siège** : ${L.adresse}`,
          `**Immatriculation** : ${L.siren}`,
          `**TVA intracommunautaire** : ${L.tva}`,
          `**Directeur de la publication** : ${L.directeurPublication}`,
          `**Contact** : ${L.email}`
        ]
      },
      { type: 'h2', text: 'Hébergement' },
      {
        type: 'p',
        text: 'Le site et son application sont hébergés par **Render Services, Inc.**, 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis — [render.com](https://render.com). Les serveurs applicatifs sont situés dans la région de Francfort (Allemagne).'
      },
      { type: 'h2', text: 'Objet du site' },
      {
        type: 'p',
        text: 'ActeDeVente.fr est un outil d’aide à la rédaction de documents liés à la vente d’un véhicule (certificat de cession CERFA 15776, mandat d’immatriculation, facture, contrat de vente…).'
      },
      {
        type: 'note',
        text: '**ActeDeVente.fr n’est pas un service de l’État et n’est pas affilié à l’ANTS.** Le site génère des documents pré-remplis à partir des informations saisies ; il ne réalise aucune démarche administrative. L’utilisateur reste responsable de l’exactitude des informations, de la vérification des documents et de leur dépôt auprès des administrations compétentes.'
      },
      { type: 'h2', text: 'Propriété intellectuelle' },
      {
        type: 'p',
        text: 'Les textes, l’interface, les logos et le code du site sont la propriété de l’éditeur, sauf mention contraire. Toute reproduction sans autorisation écrite préalable est interdite. Les formulaires CERFA sont des documents administratifs officiels.'
      },
      { type: 'h2', text: 'Responsabilité' },
      {
        type: 'p',
        text: 'L’éditeur s’efforce de fournir des informations exactes et à jour, sans pouvoir garantir l’absence d’erreur ni l’adéquation des documents à chaque situation. Les articles du blog sont informatifs et ne constituent pas un conseil juridique.'
      },
      { type: 'h2', text: 'Données personnelles' },
      { type: 'p', text: 'Voir notre [politique de confidentialité](/confidentialite).' },
      { type: 'h2', text: 'Droit applicable' },
      { type: 'p', text: 'Les présentes mentions légales sont soumises au droit français.' }
    ]
  },
  {
    path: '/confidentialite',
    title: 'Politique de confidentialité',
    description:
      'Comment ActeDeVente.fr collecte, utilise et protège vos données personnelles (RGPD) : données traitées, durées de conservation, cookies, vos droits.',
    h1: 'Politique de confidentialité',
    updated: L.updated,
    content: [
      {
        type: 'p',
        text: 'Les documents de vente d’un véhicule contiennent des informations personnelles (identité, adresse, immatriculation). Cette page explique quelles données nous traitons, pourquoi et pendant combien de temps, conformément au Règlement général sur la protection des données (RGPD).'
      },
      { type: 'h2', text: 'Responsable du traitement' },
      { type: 'p', text: `${L.editeur}, ${L.adresse} — contact : ${L.email}.` },
      { type: 'h2', text: 'Données traitées' },
      {
        type: 'table',
        head: ['Usage', 'Données', 'Base légale', 'Conservation'],
        rows: [
          [
            'Génération d’un CERFA sans compte',
            'Informations saisies : vendeur, acheteur, véhicule, vente',
            'Exécution du service demandé',
            L.conservationPublic
          ],
          [
            'Compte utilisateur',
            'E-mail, nom, mot de passe (chiffré) ou connexion Google, historique des documents générés',
            'Exécution du contrat',
            `Pendant la vie du compte, puis ${L.conservationCompte}`
          ],
          [
            'Paiement',
            'Données de facturation ; les données bancaires sont traitées uniquement par Stripe',
            'Exécution du contrat, obligations comptables',
            '10 ans pour les pièces comptables'
          ],
          [
            'Statistiques de visite (sans cookies)',
            'Pages consultées, provenance, type d’appareil, pays ; aucun cookie, aucune donnée permettant de vous identifier (Umami)',
            'Intérêt légitime (mesure d’audience exemptée de consentement)',
            '6 mois'
          ],
          [
            'Mesure d’audience',
            'Pages consultées, données techniques (Google Analytics 4, adresse IP anonymisée)',
            'Votre consentement',
            '13 mois maximum'
          ],
          [
            'Localisation (facultative)',
            'Position approximative, uniquement si vous l’autorisez dans le navigateur, pour pré-remplir la ville de signature',
            'Votre consentement',
            'Non conservée'
          ]
        ]
      },
      {
        type: 'p',
        text: 'Nous ne vendons ni ne louons vos données et ne les utilisons pas à des fins publicitaires.'
      },
      { type: 'h2', text: 'Sous-traitants' },
      {
        type: 'ul',
        items: [
          'Hébergement : Render Services, Inc. (serveurs en Allemagne)',
          'Base de données : MongoDB',
          'Paiement : Stripe',
          'Connexion avec Google (facultative) : Google',
          'Statistiques de visite sans cookies : Umami Software, Inc. (données hébergées dans l’Union européenne)',
          'Mesure d’audience : Google Ireland Ltd — uniquement si vous l’acceptez',
          'Localisation de la ville (facultative) : OpenStreetMap / Nominatim'
        ]
      },
      {
        type: 'p',
        text: 'Lorsque des données sont transférées hors de l’Union européenne, ce transfert est encadré par les mécanismes prévus par le RGPD (clauses contractuelles types ou Data Privacy Framework).'
      },
      { type: 'h2', text: 'Cookies' },
      {
        type: 'ul',
        items: [
          '**Stockage nécessaire** : session de connexion et préférences de formulaire — sans consentement',
          '**Statistiques de visite** (Umami) — sans cookie et sans donnée permettant de vous identifier, donc sans consentement',
          '**Mesure d’audience** (Google Analytics 4) — **uniquement après votre accord** via le bandeau'
        ]
      },
      { type: 'p', text: 'Vous pouvez modifier votre choix à tout moment via le lien « Gérer les cookies » en bas de page.' },
      { type: 'h2', text: 'Sécurité' },
      { type: 'p', text: 'Les échanges sont chiffrés (HTTPS) et les mots de passe sont stockés sous forme chiffrée.' },
      { type: 'h2', text: 'Vos droits' },
      {
        type: 'p',
        text: `Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, ainsi que du droit de retirer votre consentement à tout moment. Écrivez-nous à ${L.email} ; nous répondons sous un mois. Vous pouvez aussi saisir la CNIL ([cnil.fr](https://www.cnil.fr)).`
      }
    ]
  }
];
