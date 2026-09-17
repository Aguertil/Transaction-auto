/**
 * Articles du blog — ajouter un objet ici pour publier une nouvelle page.
 * slug = URL /blog/{slug}
 */
export const blogPosts = [
  {
    slug: 'comment-remplir-cerfa-15776',
    title: 'Comment remplir le CERFA 15776 (certificat de cession) en ligne',
    description:
      'Guide pratique pour remplir le certificat de cession CERFA 15776 : vendeur, acheteur, véhicule, date et génération PDF.',
    date: '2026-09-17',
    keywords: ['cerfa 15776', 'certificat de cession', 'acte de vente voiture'],
    content: [
      {
        type: 'p',
        text: 'Le CERFA 15776 est le certificat de cession officiel utilisé lors de la vente d’un véhicule d’occasion en France. Il formalise le transfert entre le vendeur et l’acheteur. Sur ActeDeVente.fr, vous pouvez le générer en quelques minutes, sans inscription pour la version de base.'
      },
      { type: 'h2', text: 'Quelles informations sont nécessaires ?' },
      {
        type: 'ul',
        items: [
          'Identité du vendeur (particulier ou professionnel : raison sociale et SIRET)',
          'Identité de l’acheteur (particulier ou société)',
          'Adresse des deux parties',
          'Données du véhicule : immatriculation, VIN, marque, modèle, kilométrage',
          'Date (et éventuellement heure) de la vente, lieu de signature, prix'
        ]
      },
      { type: 'h2', text: 'Étapes pour générer le document' },
      {
        type: 'ol',
        items: [
          'Indiquez si le vendeur et l’acheteur sont professionnels ou particuliers',
          'Remplissez les champs du formulaire (société ou nom/prénom selon le statut)',
          'Vérifiez l’immatriculation et le numéro VIN',
          'Téléchargez le PDF CERFA 15776 généré',
          'Faites signer les deux parties et conservez vos exemplaires'
        ]
      },
      { type: 'h2', text: 'Erreurs fréquentes à éviter' },
      {
        type: 'p',
        text: 'Une immatriculation incorrecte, un VIN incomplet ou une date de cession incohérente avec la carte grise retardent souvent les démarches. Relisez toujours le PDF avant signature. ActeDeVente.fr préremplit le formulaire : la responsabilité des données reste celle des parties.'
      },
      { type: 'h2', text: 'Passer au pack complet' },
      {
        type: 'p',
        text: 'Avec un compte gratuit, vous pouvez aussi générer mandat d’immatriculation, facture, contrat de vente, garantie et quitus fiscal selon votre situation.'
      }
    ]
  },
  {
    slug: 'documents-vente-pro-particulier',
    title: 'Vente de véhicule : documents selon pro ou particulier',
    description:
      'Quels documents préparer selon que le vendeur ou l’acheteur est un professionnel ou un particulier.',
    date: '2026-09-17',
    keywords: ['vente voiture professionnel', 'particulier', 'documents cession'],
    content: [
      {
        type: 'p',
        text: 'Une vente de véhicule d’occasion ne se traite pas de la même façon selon le statut des parties. Un garage et un particulier n’ont pas les mêmes mentions (SIRET, facture, garanties).'
      },
      { type: 'h2', text: 'Vendeur professionnel' },
      {
        type: 'p',
        text: 'Le professionnel indique généralement raison sociale et SIRET. Une facture de vente et, selon le cas, un contrat ou un bon de commande complètent le CERFA de cession. Les mentions TVA (souvent régime de la marge sur occasion) doivent être correctes.'
      },
      { type: 'h2', text: 'Vendeur particulier' },
      {
        type: 'p',
        text: 'Le particulier renseigne nom, prénom et adresse. Le certificat de cession reste obligatoire. Une facture n’est pas toujours attendue comme chez un pro, mais un écrit clair sur le prix et l’état du véhicule reste recommandé.'
      },
      { type: 'h2', text: 'Acheteur pro ou particulier' },
      {
        type: 'p',
        text: 'L’acheteur peut être une société (raison sociale, SIRET) ou une personne physique. Sur ActeDeVente.fr, vous choisissez le statut de chaque partie au début du formulaire : les champs et les PDF s’adaptent.'
      },
      { type: 'h2', text: 'En résumé' },
      {
        type: 'ul',
        items: [
          'CERFA 15776 : quasi systématique pour la cession',
          'Pro : SIRET, facture, éventuellement mandat et garanties',
          'Particulier : identité civile et adresses exactes',
          'Toujours vérifier les données avant signature'
        ]
      }
    ]
  },
  {
    slug: 'quitus-fiscal-vehicule-quand',
    title: 'Quitus fiscal véhicule : quand est-il nécessaire ?',
    description:
      'Comprendre le quitus fiscal (1993-PART-D) pour un véhicule acquis dans l’UE et comment préparer le formulaire.',
    date: '2026-09-17',
    keywords: ['quitus fiscal', 'véhicule UE', '1993-PART-D'],
    content: [
      {
        type: 'p',
        text: 'Le quitus fiscal (formulaire 1993-PART-D) intervient notamment lorsqu’un véhicule est acquis dans un autre État membre de l’Union européenne et doit être immatriculé en France. Il atteste du traitement fiscal de l’acquisition.'
      },
      { type: 'h2', text: 'Dans quels cas le demander ?' },
      {
        type: 'p',
        text: 'Typiquement : achat d’un véhicule d’occasion auprès d’un vendeur établi dans un autre pays de l’UE, avant immatriculation française. Les règles précises dépendent de votre situation ; en cas de doute, renseignez-vous auprès du service des impôts ou d’un professionnel.'
      },
      { type: 'h2', text: 'Informations souvent requises' },
      {
        type: 'ul',
        items: [
          'Identité et adresse de l’acquéreur',
          'Coordonnées du vendeur UE (raison sociale, n° TVA, adresse)',
          'Caractéristiques du véhicule',
          'Éventuellement le mandataire professionnel qui accompagne la démarche'
        ]
      },
      { type: 'h2', text: 'Sur ActeDeVente.fr' },
      {
        type: 'p',
        text: 'Avec un compte, vous pouvez générer le formulaire quitus fiscal et renseigner le bloc « vendeur UE » lorsque ce document est sélectionné. Le PDF généré reste à vérifier et à transmettre selon la procédure en vigueur. Pour la procédure ANTS ou l’envoi au SIE selon votre département, lisez notre guide dédié à la demande de quitus fiscal.'
      }
    ]
  },
  {
    slug: 'importer-voiture-ue-papiers-necessaires',
    title: 'Importer une voiture de l’UE : quels papiers préparer ?',
    description:
      'Liste des documents pour importer un véhicule d’occasion depuis un pays de l’Union européenne et l’immatriculer en France.',
    date: '2026-09-17',
    keywords: ['import voiture UE', 'papiers import auto', 'immatriculation véhicule étranger'],
    content: [
      {
        type: 'p',
        text: 'Importer une voiture depuis un autre pays de l’Union européenne (Allemagne, Belgique, Espagne, Italie, etc.) implique un dossier complet avant l’immatriculation française sur le site de l’ANTS. Sans les bons justificatifs, la demande de carte grise est refusée ou retardée.'
      },
      { type: 'h2', text: 'Documents liés à l’achat et à l’origine du véhicule' },
      {
        type: 'ul',
        items: [
          'Facture d’achat ou certificat de cession / contrat de vente du pays d’origine',
          'Certificat d’immatriculation étranger (carte grise) du véhicule',
          'Certificat de conformité européen (COC) ou attestation d’identification si exigé',
          'Justificatif d’identité et de domicile de l’acquéreur en France'
        ]
      },
      { type: 'h2', text: 'Contrôle technique' },
      {
        type: 'p',
        text: 'Selon l’âge et le type de véhicule, un contrôle technique français (ou reconnu) peut être demandé avant immatriculation. Vérifiez la validité des éventuels contrôles déjà réalisés à l’étranger et les règles ANTS en vigueur pour votre cas.'
      },
      { type: 'h2', text: 'Quitus fiscal (certificat fiscal)' },
      {
        type: 'p',
        text: 'Pour un véhicule acquis dans l’UE hors France, l’immatriculation française exige en principe un quitus fiscal (formulaire 1993-PART-D pour un particulier, ou équivalent professionnel). Il atteste de la situation du véhicule au regard de la TVA. La façon de le demander dépend de votre département (téléprocédure ANTS ou courriel au service des impôts — SIE).'
      },
      { type: 'h2', text: 'Puis demande d’immatriculation' },
      {
        type: 'ol',
        items: [
          'Réunir facture / cession, titre étranger et pièces d’identité',
          'Obtenir le quitus fiscal selon la procédure de votre département',
          'Effectuer la demande de certificat d’immatriculation sur ants.gouv.fr',
          'Conserver copies numériques et papier de tout le dossier'
        ]
      },
      { type: 'h2', text: 'Sur ActeDeVente.fr' },
      {
        type: 'p',
        text: 'Vous pouvez préparer le formulaire de demande de quitus fiscal et les documents de vente associés. Relisez toujours les pièces avant envoi à l’administration : ActeDeVente.fr facilite la rédaction, pas le dépôt officiel.'
      }
    ]
  },
  {
    slug: 'checklist-import-vehicule-occasion-etranger',
    title: 'Checklist import véhicule d’occasion : papiers étape par étape',
    description:
      'Checklist pratique des papiers pour un import de voiture d’occasion : achat à l’étranger, quitus, contrôle technique et ANTS.',
    date: '2026-09-17',
    keywords: ['checklist import voiture', 'documents import occasion', 'carte grise import'],
    content: [
      {
        type: 'p',
        text: 'Voici une checklist opérationnelle pour un import de véhicule d’occasion depuis l’étranger (UE). Cochez chaque point avant de lancer la demande d’immatriculation française.'
      },
      { type: 'h2', text: '1. Avant / pendant l’achat' },
      {
        type: 'ul',
        items: [
          'Vérifier le VIN, l’historique et la cohérence de la carte grise étrangère',
          'Obtenir une facture claire (vendeur, acheteur, véhicule, prix, date) ou un acte de cession',
          'Demander le certificat de conformité (COC) si disponible',
          'Conserver tous les échanges (mail, bon de commande)'
        ]
      },
      { type: 'h2', text: '2. Au retour en France' },
      {
        type: 'ul',
        items: [
          'Justificatif de domicile récent',
          'Pièce d’identité de l’acquéreur (et du mandataire si besoin)',
          'Éventuel contrôle technique français selon les règles applicables',
          'Assurance pour la circulation / immatriculation'
        ]
      },
      { type: 'h2', text: '3. Fiscalité — quitus' },
      {
        type: 'ul',
        items: [
          'Remplir le formulaire 1993-PART-D (particulier) ou 1993-PRO-D (professionnel)',
          'Joindre facture, titre étranger et pièces d’identité en PDF',
          'Suivre la procédure de votre département : ANTS (certains départements) ou mail au SIE (autres régions)',
          'Régler la TVA si elle est due, selon les modalités indiquées'
        ]
      },
      { type: 'h2', text: '4. Immatriculation ANTS' },
      {
        type: 'ol',
        items: [
          'Créer / se connecter à un compte sur ants.gouv.fr',
          'Déposer la demande d’immatriculation avec le numéro / justificatif de quitus',
          'Téléverser les pièces demandées',
          'Payer les taxes et attendre le titre définitif ou provisoire'
        ]
      },
      { type: 'h2', text: 'Erreurs qui font perdre du temps' },
      {
        type: 'ul',
        items: [
          'Facture sans SIRET / TVA du vendeur UE alors qu’elle est attendue',
          'PDF illisibles ou incomplets envoyés au SIE',
          'Confusion entre demande de quitus seule et immatriculation + quitus',
          'Mauvais service contacté (mauvais département / mauvaise adresse mail SIE)'
        ]
      },
      {
        type: 'p',
        text: 'Pour le détail ANTS (notamment certains départements du Grand Est) versus envoi au SIE ailleurs en France, consultez notre article sur la demande de quitus fiscal.'
      }
    ]
  },
  {
    slug: 'demande-quitus-fiscal-ants-grand-est-sie',
    title: 'Demande de quitus fiscal : ANTS (Grand Est) ou mail au SIE ?',
    description:
      'Comment demander un quitus fiscal véhicule UE : téléprocédure ANTS dans certains départements (dont Grand Est) et envoi par mail au SIE dans le reste de la France.',
    date: '2026-09-17',
    keywords: ['quitus fiscal ANTS', 'quitus fiscal SIE', 'Grand Est quitus', '1993-PART-D'],
    content: [
      {
        type: 'p',
        text: 'Le quitus fiscal (certificat fiscal) est en principe obligatoire pour immatriculer en France un véhicule acquis dans un autre État de l’UE. La procédure n’est pas la même partout : dans une partie du territoire (notamment certains départements du Grand Est), la demande passe par l’ANTS ; ailleurs, elle s’envoie le plus souvent par courriel au service des impôts des entreprises (SIE) compétent.'
      },
      { type: 'h2', text: 'Cas 1 — Demande via ANTS (dont une partie du Grand Est)' },
      {
        type: 'p',
        text: 'Selon l’administration fiscale, dans certains départements — notamment Moselle et Bas-Rhin (Grand Est), ainsi que Nord et Pas-de-Calais — la demande de quitus fiscal (et souvent l’immatriculation associée) se fait par téléprocédure sur le site de l’ANTS (ants.gouv.fr), rubrique Immatriculation. Des parcours du type « Immatriculer un véhicule et demander un quitus fiscal (véhicule acquis dans l’Union européenne) » sont proposés ; les professionnels peuvent aussi disposer d’une demande de quitus seule selon leur situation.'
      },
      {
        type: 'ul',
        items: [
          'Compte ANTS requis',
          'Pièces justificatives déposées en ligne dans la téléprocédure',
          'Paiement de la TVA éventuelle selon les modalités de la procédure',
          'Puis poursuite / finalisation de l’immatriculation selon le parcours choisi'
        ]
      },
      {
        type: 'p',
        text: 'Important : tous les départements du Grand Est ne sont pas nécessairement dans le même régime. Vérifiez toujours votre département de domicile (particulier) ou de siège social (professionnel) sur impots.gouv.fr ou ants.gouv.fr avant d’envoyer un dossier.'
      },
      { type: 'h2', text: 'Cas 2 — Envoi par mail au SIE (reste de la France)' },
      {
        type: 'p',
        text: 'Si vous n’êtes pas dans un département éligible à la téléprocédure ANTS pour le quitus, la demande se fait en général par courriel au SIE compétent, avec le formulaire Cerfa adapté :'
      },
      {
        type: 'ul',
        items: [
          'Particulier (ou mandataire) : formulaire 1993-PART-D-SD',
          'Professionnel : formulaire 1993-PRO-D-SD',
          'Pièces jointes en PDF : facture / cession, titre étranger, identité, domicile, etc.',
          'TVA éventuellement due réglée selon les consignes du service (souvent virement)'
        ]
      },
      {
        type: 'p',
        text: 'Les coordonnées du bon service se trouvent sur le site des impôts (« Trouver les coordonnées de mon service » / annuaire quitus par département). Exemple de type d’adresse : sie.[ville].quitus@dgfip.finances.gouv.fr — à confirmer pour votre département.'
      },
      { type: 'h2', text: 'Tableau récapitulatif' },
      {
        type: 'ul',
        items: [
          'Départements en téléprocédure ANTS (ex. Moselle, Bas-Rhin, Nord, Pas-de-Calais) → demande sur ants.gouv.fr',
          'Autres départements / reste des régions → formulaire 1993 + mail au SIE du domicile ou du siège',
          'Dans tous les cas → conserver l’accusé / le quitus pour l’immatriculation ANTS si elle est séparée'
        ]
      },
      { type: 'h2', text: 'Préparer le formulaire sur ActeDeVente.fr' },
      {
        type: 'p',
        text: 'Sur ActeDeVente.fr, générez le PDF de demande de quitus (1993-PART-D) avec les infos acquéreur, vendeur UE et véhicule. Ensuite : dépôt ANTS si votre département est concerné, ou envoi du PDF et des justificatifs par mail au SIE dans le reste de la France. Les règles évoluent : contrôlez toujours la consigne officielle au moment de votre dossier.'
      }
    ]
  }
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null;
}

export function getAllSlugs() {
  return blogPosts.map((p) => p.slug);
}
