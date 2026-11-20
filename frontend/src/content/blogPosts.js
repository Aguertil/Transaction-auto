/**
 * Articles du blog — ajouter un objet ici pour publier une nouvelle page.
 * slug = URL /blog/{slug}
 */
export const blogPosts = [
  {
    slug: 'code-de-cession-ants',
    title: 'Code de cession ANTS : comment l’obtenir et le transmettre',
    description:
      'Code de cession : à quoi il sert, comment l’obtenir sur le site de l’ANTS, sa durée de validité de 15 jours et que faire s’il est perdu ou expiré.',
    date: '2026-11-20',
    keywords: ['code de cession', 'code de cession ANTS', 'déclaration de cession', 'vendre voiture ANTS'],
    content: [
      {
        type: 'p',
        text: 'Quand vous vendez ou donnez votre véhicule, vous devez déclarer la cession sur le site de l’ANTS. À la fin de cette démarche, le site affiche un code de cession. C’est ce code qui permet à l’acheteur de faire sa carte grise à son nom sans attendre.'
      },
      { type: 'h2', text: 'À quoi sert le code de cession ?' },
      {
        type: 'ul',
        items: [
          'Pour le vendeur : il prouve que la vente est enregistrée. Vous n’êtes plus responsable du véhicule (amendes, stationnement…) à partir de la date et de l’heure déclarées.',
          'Pour l’acheteur : il le saisit sur le site de l’ANTS lors de sa demande de carte grise pour un véhicule d’occasion.',
          'Il est valable 15 jours : remettez-le à l’acheteur le jour de la vente.'
        ]
      },
      { type: 'h2', text: 'Comment obtenir le code de cession, étape par étape' },
      {
        type: 'ol',
        items: [
          'Connectez-vous au site de l’ANTS, idéalement avec FranceConnect ou l’application France Identité.',
          'Choisissez la démarche « Vendre ou donner mon véhicule ». Vous pouvez la commencer avant le jour de la vente.',
          'Saisissez l’immatriculation, le code confidentiel reçu avec la carte grise et l’identité de l’acheteur (nom de naissance, prénom, date et lieu de naissance).',
          'Le code de cession s’affiche à l’écran : notez-le et transmettez-le à l’acheteur.',
          'Dans les 15 jours qui suivent la signature du certificat de cession, finalisez la déclaration : date et heure de la vente, kilométrage et adresse complète de l’acheteur.',
          'Téléchargez l’accusé d’enregistrement et conservez-le.'
        ]
      },
      { type: 'h2', text: 'Les documents à remettre à l’acheteur avec le code' },
      {
        type: 'ul',
        items: [
          'Le certificat de cession (CERFA 15776) rempli et signé en 2 exemplaires : l’acheteur garde l’exemplaire n° 2.',
          'La carte grise barrée, avec la mention « Vendu le » suivie de la date et de l’heure, et votre signature. Ne découpez pas le coupon détachable : remplissez-le et remettez la carte entière.',
          'Le certificat de situation administrative (non-gage) de moins de 15 jours, à télécharger sur HistoVec.',
          'Le procès-verbal de contrôle technique de moins de 6 mois si la voiture a plus de 4 ans.'
        ]
      },
      { type: 'h2', text: 'Code de cession perdu, expiré ou jamais reçu' },
      {
        type: 'p',
        text: 'Pas de panique : l’acheteur peut faire sa demande de carte grise sans le code, à condition que le vendeur ait bien déclaré la vente. Il devra alors fournir lui-même les justificatifs (certificat de cession, carte grise barrée…). Si vous êtes le vendeur et n’avez pas terminé la déclaration, reconnectez-vous à votre espace ANTS (« Mes démarches en cours ») pour la finaliser.'
      },
      { type: 'h2', text: 'Sans internet ?' },
      {
        type: 'p',
        text: 'Vous pouvez vous faire aider dans un point numérique de préfecture ou une maison France Services, ou confier la démarche à un professionnel de l’automobile habilité. Il vous demandera un mandat (CERFA 13757) et votre code confidentiel.'
      },
      {
        type: 'p',
        text: 'Sur ActeDeVente.fr, préparez le CERFA 15776 gratuitement avant le rendez-vous : vous aurez déjà toutes les informations à reporter sur le site de l’ANTS. Les règles peuvent évoluer : vérifiez toujours la fiche officielle « Vendre ou donner son véhicule » sur service-public.gouv.fr.'
      }
    ]
  },
  {
    slug: 'vendre-vehicule-proche-decede',
    title: 'Vendre la voiture d’un proche décédé : démarches et documents',
    description:
      'Héritiers : quand faut-il refaire la carte grise avant de vendre ? Délai de 3 mois, justificatifs de succession, certificat de cession et déclaration ANTS.',
    date: '2026-11-20',
    keywords: ['vendre voiture personne décédée', 'véhicule succession', 'carte grise héritier', 'certificat de cession héritiers'],
    content: [
      {
        type: 'p',
        text: 'Après le décès d’un proche, ses héritiers peuvent vendre, donner ou faire détruire son véhicule. Dans la plupart des cas, il n’est pas nécessaire de refaire la carte grise avant la vente. Tout dépend du délai écoulé et du fait que la voiture a roulé ou non depuis le décès.'
      },
      { type: 'h2', text: 'Faut-il refaire la carte grise avant de vendre ?' },
      {
        type: 'ul',
        items: [
          'Décès depuis moins de 3 mois : vous pouvez vendre sans modifier la carte grise.',
          'Plus de 3 mois, mais le véhicule n’a pas circulé depuis le décès : vous pouvez aussi vendre sans modifier la carte grise. Une attestation sur l’honneur des héritiers certifiant que le véhicule n’a pas roulé est demandée.',
          'Plus de 3 mois et le véhicule a circulé : il faut d’abord l’immatriculer au nom d’un héritier, puis le vendre comme un véhicule ordinaire.',
          'Carte grise perdue : faites d’abord refaire la carte grise (duplicata), comme si vous conserviez le véhicule.'
        ]
      },
      { type: 'h2', text: 'Prouver votre qualité d’héritier' },
      {
        type: 'p',
        text: 'L’acheteur aura besoin de l’un de ces justificatifs pour faire sa carte grise :'
      },
      {
        type: 'ul',
        items: [
          'Une attestation du notaire mentionnant la marque et l’immatriculation du véhicule.',
          'Ou un acte de notoriété établi par un notaire.',
          'Ou un certificat de décès accompagné d’une attestation signée par tous les héritiers, certifiant qu’il n’existe ni testament, ni autre héritier, ni contrat de mariage, ni contestation en cours.'
        ]
      },
      { type: 'h2', text: 'Les documents à remettre à l’acheteur' },
      {
        type: 'ol',
        items: [
          'Le certificat de cession (CERFA 15776) au nom des héritiers, avec leurs adresses, signé : l’acheteur garde l’exemplaire n° 2.',
          'La carte grise portant la mention « Vendu le » ou « Cédé le » avec la date, signée par les héritiers.',
          'Le justificatif de succession (voir ci-dessus).',
          'Le certificat de situation administrative de moins de 15 jours.',
          'Le contrôle technique de moins de 6 mois si le véhicule a plus de 4 ans (moins de 2 mois en cas de contre-visite).',
          'Le code de cession obtenu sur le site de l’ANTS.'
        ]
      },
      { type: 'h2', text: 'La déclaration de cession' },
      {
        type: 'p',
        text: 'Comme pour toute vente, les héritiers déclarent la cession sur le site de l’ANTS (connexion par FranceConnect ou France Identité). Ils saisissent les informations de l’acheteur, obtiennent un code de cession valable 15 jours, puis finalisent la déclaration dans les 15 jours avec la date, l’heure, le kilométrage et l’adresse de l’acheteur.'
      },
      {
        type: 'p',
        text: 'Le CERFA 15776 se prépare gratuitement sur ActeDeVente.fr : indiquez les héritiers comme vendeurs. Ces règles sont résumées à partir de la fiche « Carte grise : hériter d’un véhicule immatriculé en France » de service-public.gouv.fr : en cas de doute (plusieurs héritiers en désaccord, testament, notaire), demandez conseil au notaire chargé de la succession.'
      }
    ]
  },
  {
    slug: 'vendre-voiture-carte-grise-deux-noms',
    title: 'Vendre une voiture avec une carte grise à deux noms (cotitulaires)',
    description:
      'Carte grise à deux noms : qui doit signer le certificat de cession et la carte grise barrée, comment remplir le CERFA 15776 et déclarer la vente.',
    date: '2026-11-20',
    keywords: ['carte grise deux noms', 'cotitulaire carte grise vente', 'certificat de cession deux propriétaires'],
    content: [
      {
        type: 'p',
        text: 'Une carte grise peut être établie au nom de plusieurs personnes : un couple, des parents et un enfant, deux associés… Ce sont les cotitulaires. La rubrique C.1 indique le titulaire principal et la rubrique C.4.1 le nombre de cotitulaires et le nom du premier d’entre eux.'
      },
      { type: 'h2', text: 'La règle : tous les titulaires signent' },
      {
        type: 'p',
        text: 'Seul le propriétaire peut vendre le véhicule. S’il y a plusieurs cotitulaires, la signature de toutes les personnes mentionnées sur le certificat d’immatriculation est obligatoire. Concrètement :'
      },
      {
        type: 'ul',
        items: [
          'Le certificat de cession (CERFA 15776) mentionne chaque vendeur et porte la signature de chacun.',
          'La carte grise est barrée avec la mention « Vendu le », la date et l’heure, puis signée par chaque cotitulaire.'
        ]
      },
      { type: 'h2', text: 'Si un cotitulaire ne peut pas être présent' },
      {
        type: 'p',
        text: 'En pratique, le cotitulaire absent peut donner une procuration écrite à l’autre pour signer en son nom (avec une copie de sa pièce d’identité). Selon votre situation (couple marié, séparation, désaccord), les exigences peuvent différer : en cas de doute, renseignez-vous auprès de l’ANTS ou d’un professionnel habilité avant la vente, pour ne pas bloquer la carte grise de l’acheteur.'
      },
      { type: 'h2', text: 'Déclarer la vente sur le site de l’ANTS' },
      {
        type: 'ol',
        items: [
          'Un des cotitulaires se connecte au site de l’ANTS et lance « Vendre ou donner mon véhicule ».',
          'Il saisit l’identité de l’acheteur et obtient le code de cession (valable 15 jours).',
          'Il finalise la déclaration dans les 15 jours suivant la signature du certificat : date, heure, kilométrage et adresse de l’acheteur.'
        ]
      },
      { type: 'h2', text: 'Ce que l’acheteur doit recevoir' },
      {
        type: 'ul',
        items: [
          'L’exemplaire n° 2 du certificat de cession signé par tous les vendeurs',
          'La carte grise barrée et signée par tous les cotitulaires',
          'Le code de cession',
          'Le certificat de situation administrative de moins de 15 jours',
          'Le contrôle technique de moins de 6 mois si la voiture a plus de 4 ans'
        ]
      },
      {
        type: 'p',
        text: 'Astuce : générez le CERFA 15776 sur ActeDeVente.fr avec le titulaire principal, ajoutez le nom du second titulaire, puis faites signer les deux. Relisez toujours le document avant de le signer.'
      }
    ]
  },
  {
    slug: 'vendre-voiture-sans-carte-grise',
    title: 'Vendre une voiture sans carte grise : perdue, volée ou abîmée',
    description:
      'Carte grise perdue ou volée avant une vente : pourquoi faire un duplicata d’abord, la démarche ANTS, le prix (13,76 €) et le certificat provisoire.',
    date: '2026-11-20',
    keywords: ['vendre voiture sans carte grise', 'carte grise perdue vente', 'duplicata carte grise', 'cerfa 13753'],
    content: [
      {
        type: 'p',
        text: 'Pour vendre un véhicule à un particulier, vous devez lui remettre la carte grise barrée et signée : sans elle, il ne pourra pas faire sa propre carte grise. Si elle est perdue, volée ou abîmée, commencez par demander un duplicata.'
      },
      { type: 'h2', text: 'Étape 1 : demander un duplicata' },
      {
        type: 'ol',
        items: [
          'En cas de vol : déclarez d’abord le vol au commissariat ou à la gendarmerie.',
          'Faites la demande en ligne sur le site de l’ANTS (compte ANTS, FranceConnect ou France Identité, et carte bancaire), ou chez un professionnel de l’automobile habilité. Le dépôt en préfecture n’est plus possible.',
          'Préparez : une pièce d’identité, un justificatif de domicile de moins de 6 mois, la déclaration de perte ou de vol (CERFA 13753) et le contrôle technique si le véhicule n’en est pas dispensé. Si la carte est abîmée, joignez-la à la place de la déclaration.',
          'Payez 13,76 € (taxe fixe de 11 € et 2,76 € d’acheminement). Un professionnel peut ajouter ses frais.'
        ]
      },
      { type: 'h2', text: 'Le certificat provisoire (CPI)' },
      {
        type: 'p',
        text: 'À la fin de la démarche en ligne, vous imprimez un certificat provisoire d’immatriculation. Il permet de circuler 1 mois, en France uniquement. Le duplicata arrive ensuite par lettre suivie, en quelques jours à quelques semaines selon les périodes.'
      },
      { type: 'h2', text: 'Étape 2 : vendre normalement' },
      {
        type: 'p',
        text: 'Une fois le duplicata reçu, la vente se déroule comme d’habitude : certificat de cession en 2 exemplaires, carte grise barrée avec « Vendu le », la date et l’heure, certificat de situation administrative de moins de 15 jours, contrôle technique si nécessaire, puis déclaration de cession sur le site de l’ANTS pour obtenir le code de cession.'
      },
      { type: 'h2', text: 'Cas particuliers' },
      {
        type: 'ul',
        items: [
          'Héritiers : si la carte grise du défunt est introuvable, il faut aussi la faire refaire avant la vente.',
          'Véhicule vendu pour destruction : la démarche passe par un centre VHU agréé, qui vous indiquera les justificatifs acceptés.'
        ]
      },
      {
        type: 'p',
        text: 'Préparez dès maintenant votre certificat de cession sur ActeDeVente.fr pour gagner du temps le jour de la vente. Ces informations reprennent la fiche officielle « Perte, vol ou détérioration du certificat d’immatriculation » de service-public.gouv.fr, à vérifier au moment de votre démarche.'
      }
    ]
  }
,
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
