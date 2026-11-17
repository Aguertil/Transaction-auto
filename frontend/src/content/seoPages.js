/**
 * Pages « document » optimisées SEO (rendu : src/pages/SeoDocPage.jsx).
 * Ajouter une page = ajouter un objet ici ; la route, le pré-rendu et le
 * sitemap sont générés automatiquement.
 *
 * Texte : **gras** et [lien](/chemin) sont pris en charge.
 */
export const seoPages = [
  {
    path: '/facture-vente-vehicule-occasion',
    breadcrumb: 'Facture véhicule d’occasion',
    title: 'Facture de vente véhicule d’occasion — TVA sur marge, modèle PDF',
    description:
      'Garages et marchands VO : générez une facture de vente de véhicule d’occasion avec les mentions obligatoires et la TVA sur marge. Numérotation automatique, PDF immédiat.',
    h1: 'Facture de vente de véhicule d’occasion',
    lead:
      'Vous vendez un véhicule d’occasion en tant que **professionnel** ? ActeDeVente.fr génère une facture complète à partir des informations du véhicule et du client, **avec le régime de TVA sur marge**, dans le même pack que le certificat de cession, le contrat et le PV de livraison.',
    cta: { to: '/register', label: 'Créer mon compte gratuit' },
    cta2: { to: '/documents-vente-vehicule', label: 'Voir tout le pack' },
    content: [
      { type: 'h2', text: 'Les mentions obligatoires d’une facture de vente VO' },
      {
        type: 'ul',
        items: [
          'Date d’émission et **numéro unique**, selon une suite chronologique continue',
          'Identité du vendeur : raison sociale, adresse, **SIREN / SIRET**, numéro de TVA intracommunautaire',
          'Identité et adresse de l’acheteur',
          'Désignation du véhicule : marque, modèle, **immatriculation, numéro VIN**, date de 1re mise en circulation, **kilométrage**',
          'Prix et régime de TVA applicable',
          'Date de la vente et conditions de paiement'
        ]
      },
      { type: 'h2', text: 'TVA sur marge ou TVA classique ?' },
      {
        type: 'p',
        text: 'Lorsqu’un professionnel revend un véhicule d’occasion acheté sans TVA récupérable (par exemple auprès d’un particulier), il applique en général le **régime de la TVA sur la marge** (article 297 A du CGI) : la TVA ne porte que sur la différence entre le prix de vente et le prix d’achat.'
      },
      {
        type: 'p',
        text: 'Dans ce cas, la facture **ne fait pas apparaître de TVA déductible** pour l’acheteur et porte une mention du type « Régime particulier – biens d’occasion ». Si la TVA a été récupérée à l’achat, la TVA s’applique au contraire sur le prix de vente total.'
      },
      {
        type: 'note',
        text: 'En cas de doute sur votre situation (véhicule importé, achat auprès d’un autre professionnel…), rapprochez-vous de votre expert-comptable. Les obligations de facturation électronique évoluent : vérifiez votre calendrier sur le site de l’administration fiscale.'
      },
      { type: 'h2', text: 'Ce que génère ActeDeVente.fr pour une vente en garage' },
      {
        type: 'table',
        head: ['Document', 'Rôle'],
        rows: [
          ['Facture de vente', 'Pièce comptable, TVA sur marge'],
          ['[Certificat de cession CERFA 15776](/cerfa-15776)', 'Formalise le transfert de propriété'],
          ['Bon de commande', 'Engagement du client avant livraison'],
          ['Contrat de vente + garantie commerciale', 'Conditions de vente et garanties'],
          ['PV de livraison', 'Preuve de remise du véhicule'],
          ['[Mandat d’immatriculation CERFA 13757](/mandat-immatriculation-cerfa-13757)', 'Pour faire la carte grise à la place du client']
        ]
      },
      {
        type: 'p',
        text: 'Les informations de votre entreprise sont enregistrées une fois : pour chaque vente, il ne reste qu’à saisir le véhicule et le client.'
      },
      { type: 'h2', text: 'Et entre particuliers ?' },
      {
        type: 'p',
        text: 'Un particulier n’émet pas de facture. Le [certificat de cession](/cerfa-15776), accompagné d’un écrit précisant le prix, l’état du véhicule et le mode de paiement, suffit.'
      }
    ],
    faq: [
      {
        q: 'La numérotation des factures est-elle automatique ?',
        a: 'Oui, ActeDeVente.fr numérote vos factures de façon chronologique.'
      },
      {
        q: 'Puis-je générer la facture sans compte ?',
        a: 'Non : la facture fait partie du pack complet, accessible avec un compte. Seul le certificat de cession CERFA 15776 est disponible sans inscription.'
      },
      {
        q: 'La facture convient-elle à un acheteur professionnel ?',
        a: 'Oui. Choisissez le statut « Professionnel » pour l’acheteur : sa raison sociale et son SIRET apparaissent sur les documents.'
      }
    ],
    related: [
      { to: '/cerfa-15776', title: 'Certificat de cession', text: 'CERFA 15776 gratuit, sans compte' },
      { to: '/blog/documents-vente-pro-particulier', title: 'Pro ou particulier ?', text: 'Quels documents selon le statut' }
    ]
  },

  {
    path: '/contrat-vente-vehicule-occasion',
    breadcrumb: 'Contrat de vente VO',
    title: 'Contrat de vente de véhicule d’occasion pour garages — PDF',
    description:
      'Contrat de vente de véhicule d’occasion pour professionnels : objet, prix, essai, garanties légales et commerciales, livraison. Généré avec la facture et le PV de livraison.',
    h1: 'Contrat de vente de véhicule d’occasion (vendeur professionnel)',
    lead:
      'Le certificat de cession officialise le changement de propriétaire, mais il ne dit rien du **prix**, de l’**état du véhicule**, des **garanties** ou de la **livraison**. Le contrat de vente fixe ces points noir sur blanc et protège le garage comme son client.',
    cta: { to: '/register', label: 'Générer mes documents de vente' },
    cta2: { to: '/documents-vente-vehicule', label: 'Voir tout le pack' },
    content: [
      { type: 'h2', text: 'Ce que contient le contrat' },
      {
        type: 'ol',
        items: [
          '**Les parties** : le vendeur (raison sociale, SIRET, adresse) et l’acheteur',
          '**L’objet** : marque, modèle, immatriculation, numéro VIN, date de 1re immatriculation, **kilométrage déclaré**',
          '**Le prix** TTC et le mode de paiement',
          '**L’essai préalable** et l’état constaté du véhicule',
          '**Les garanties** : garantie légale de conformité et, le cas échéant, garantie commerciale',
          '**La livraison** et le **transfert de propriété**',
          '**Les signatures**, en double exemplaire'
        ]
      },
      { type: 'h2', text: 'Garantie légale de conformité : une obligation du professionnel' },
      {
        type: 'p',
        text: 'Lorsqu’un professionnel vend un véhicule d’occasion à un consommateur, il doit la **garantie légale de conformité** (articles L. 217-3 et suivants du Code de la consommation). Pour un bien d’occasion, le défaut qui apparaît dans les **12 mois** suivant la livraison est présumé exister au moment de la vente.'
      },
      {
        type: 'p',
        text: 'Une **garantie commerciale** (par exemple 3 mois sur les organes mécaniques) peut s’y ajouter : elle ne remplace jamais la garantie légale et doit préciser clairement ce qui est couvert et exclu. ActeDeVente.fr génère un contrat de garantie séparé avec ces listes.'
      },
      { type: 'h2', text: 'Les documents à remettre au client' },
      {
        type: 'ul',
        items: [
          'la carte grise barrée, avec la mention « Vendu le … à … (heure) » et signée',
          'le [certificat de cession CERFA 15776](/cerfa-15776), signé par les deux parties',
          'un **certificat de situation administrative** de moins de 15 jours',
          'pour un véhicule de plus de 4 ans, le **procès-verbal de contrôle technique de moins de 6 mois** (moins de 2 mois en cas de contre-visite)',
          'la [facture de vente](/facture-vente-vehicule-occasion)'
        ]
      },
      {
        type: 'note',
        text: 'Le contrat s’adapte au statut du vendeur. Pour un vendeur **particulier**, la garantie légale de conformité ne s’applique pas : le contrat ne prévoit aucune garantie commerciale et rappelle la garantie des vices cachés. Le contrat de garantie et la notice des garanties sont réservés aux vendeurs professionnels.'
      }
    ],
    faq: [
      {
        q: 'Le contrat de vente est-il obligatoire ?',
        a: 'Le certificat de cession est obligatoire ; le contrat ne l’est pas, mais il est fortement recommandé pour prouver ce qui a été convenu (prix, état, garanties).'
      },
      {
        q: 'Combien d’exemplaires faut-il signer ?',
        a: 'Deux : un pour le vendeur, un pour l’acheteur.'
      },
      {
        q: 'Le contrat est-il généré avec les autres documents ?',
        a: 'Oui, il fait partie du pack : facture, bon de commande, contrat, garantie, PV de livraison, mandat et certificat de cession, à partir d’une seule saisie.'
      }
    ],
    related: [
      { to: '/facture-vente-vehicule-occasion', title: 'Facture VO', text: 'Mentions obligatoires et TVA sur marge' },
      { to: '/cerfa-15776', title: 'Certificat de cession', text: 'CERFA 15776 gratuit, sans compte' }
    ]
  },

  {
    path: '/mandat-immatriculation-cerfa-13757',
    breadcrumb: 'Mandat d’immatriculation',
    title: 'Mandat d’immatriculation CERFA 13757*03 — pré-rempli en ligne',
    description:
      'Générez le mandat d’immatriculation CERFA 13757*03 pré-rempli : le client confie la démarche de carte grise à un professionnel. Inclus dans le pack vente véhicule.',
    h1: 'Mandat d’immatriculation (CERFA 13757*03)',
    lead:
      'Le **mandat d’immatriculation** permet au titulaire d’un véhicule de confier sa démarche de carte grise à un tiers, le plus souvent un **professionnel de l’automobile habilité**. ActeDeVente.fr le pré-remplit à partir des informations de la vente.',
    cta: { to: '/register', label: 'Générer le mandat' },
    cta2: { to: '/documents-vente-vehicule', label: 'Voir tout le pack' },
    content: [
      { type: 'h2', text: 'À quoi sert le CERFA 13757 ?' },
      {
        type: 'p',
        text: 'Lorsque vous vendez un véhicule et que votre client souhaite que vous vous occupiez de sa carte grise, il vous signe un mandat. Ce document vous autorise à effectuer la démarche d’immatriculation **en son nom**.'
      },
      { type: 'h2', text: 'Les informations à renseigner' },
      {
        type: 'ul',
        items: [
          '**Le mandant** (le client) : nom, prénom ou raison sociale, adresse',
          '**Le mandataire** (le professionnel) : raison sociale, SIRET, adresse',
          '**Le véhicule** : immatriculation, numéro VIN, marque',
          '**La démarche** confiée (changement de titulaire, par exemple)',
          'Date et **signatures** des deux parties'
        ]
      },
      { type: 'h2', text: 'Les pièces qui accompagnent le mandat' },
      {
        type: 'p',
        text: 'Le professionnel conserve en général une copie de la pièce d’identité du client, son justificatif de domicile, son attestation d’assurance et, le cas échéant, le permis de conduire correspondant à la catégorie du véhicule. Pour un changement de titulaire, la [demande d’immatriculation (CERFA 13750)](/documents-vente-vehicule) et le [certificat de cession](/cerfa-15776) complètent le dossier.'
      },
      {
        type: 'note',
        text: 'ActeDeVente.fr génère le mandat pré-rempli ; il n’effectue pas la démarche d’immatriculation auprès de l’ANTS.'
      }
    ],
    faq: [
      {
        q: 'Le mandat d’immatriculation est-il obligatoire ?',
        a: 'Uniquement si un tiers réalise la démarche de carte grise à la place du titulaire.'
      },
      {
        q: 'Quelle version du formulaire est utilisée ?',
        a: 'ActeDeVente.fr remplit le CERFA 13757*03.'
      }
    ],
    related: [
      { to: '/cerfa-15776', title: 'Certificat de cession', text: 'CERFA 15776 gratuit, sans compte' },
      { to: '/facture-vente-vehicule-occasion', title: 'Facture VO', text: 'Mentions obligatoires et TVA sur marge' }
    ]
  }
];
