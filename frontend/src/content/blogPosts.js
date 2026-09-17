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
        text: 'Avec un compte, vous pouvez générer le formulaire quitus fiscal et renseigner le bloc « vendeur UE » lorsque ce document est sélectionné. Le PDF généré reste à vérifier et à transmettre selon la procédure en vigueur.'
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
