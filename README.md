# Générateur de Documents Automobiles - Application Professionnelle

Application web pour générer automatiquement tous les documents obligatoires de vente de véhicules d'occasion en France.

## 📋 Documents Générés

1. **CERFA 15776*02** - Certificat de cession d'un véhicule (obligatoire)
2. **CERFA 13757*03** - Mandat d'immatriculation (optionnel)
3. **Facture de vente professionnelle** - TVA sur marge (article 297 A du CGI)
4. **Contrat de vente professionnel** - Vente professionnel à particulier
5. **Contrat de garantie commerciale 3 mois** - En complément de la garantie légale
6. **Notice d'information - garanties légales** - Obligatoire DGCCRF
7. **Procès-verbal de livraison** - Document de réception du véhicule

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm
- Les fichiers PDF CERFA officiels (à placer dans `backend/public/cerfa/`)

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
auto-documents-generator/
├── backend/
│   ├── src/
│   │   ├── routes/          # Routes Express
│   │   ├── services/        # Services de génération PDF
│   │   └── templates/       # Templates de documents
│   ├── public/
│   │   └── cerfa/          # PDFs CERFA officiels
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## ⚖️ Conformité Légale

- Respect strict des modèles CERFA officiels
- Mentions obligatoires DGCCRF
- Garantie légale de conformité (12 mois) mentionnée
- Garantie commerciale 3 mois distincte
- Aucune clause abusive
- TVA sur marge conforme à l'article 297 A du CGI

## 📝 Notes Importantes

- Les PDFs CERFA doivent être téléchargés depuis le site officiel du gouvernement
- Placez-les dans `backend/public/cerfa/` avec les noms :
  - `cerfa_15776_02.pdf`
  - `cerfa_13757_03.pdf`
- Aucune donnée n'est stockée de manière persistante
- Tous les documents sont générés à la demande

## 🔧 Configuration

Les informations de la société peuvent être préconfigurées dans le frontend (localStorage) ou dans un fichier de configuration.

## 🚀 Démarrage Rapide

### Option 1: Script automatique

```bash
./start.sh
```

### Option 2: Démarrage manuel

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Puis ouvrez `http://localhost:5173` dans votre navigateur.

## 📚 Documentation Complète

- **[INSTALLATION.md](INSTALLATION.md)** - Guide d'installation détaillé
- **[INSTRUCTIONS_CERFA.md](INSTRUCTIONS_CERFA.md)** - Comment obtenir les fichiers CERFA
- **[CONFORMITE_LEGALE.md](CONFORMITE_LEGALE.md)** - Documentation de conformité légale
- **[EXEMPLE_DONNEES.json](EXEMPLE_DONNEES.json)** - Exemple de structure de données

## 🔍 Inspection des Champs CERFA

Si vous devez adapter les noms de champs des formulaires CERFA (en cas de mise à jour), utilisez le script d'inspection :

```bash
cd backend
node src/utils/inspectCerfa.js ../public/cerfa/cerfa_15776_02.pdf
```

Ce script liste tous les champs disponibles dans le PDF pour faciliter l'adaptation du code.

## ⚠️ Important - Fichiers CERFA

**CRITIQUE :** Les fichiers PDF CERFA officiels doivent être téléchargés depuis le site du gouvernement et placés dans `backend/public/cerfa/` :

- `cerfa_15776_02.pdf` (obligatoire)
- `cerfa_13757_03.pdf` (optionnel)

Voir [INSTRUCTIONS_CERFA.md](INSTRUCTIONS_CERFA.md) pour les liens de téléchargement.

## 🛠️ Technologies Utilisées

- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express + Stripe (abonnements)
- **PDF:** pdf-lib (remplissage CERFA) + PDFKit (documents internes)
- **Archivage:** archiver (génération ZIP)

## 📝 Notes Techniques

- Les noms de champs dans les CERFA peuvent varier selon la version du formulaire
- Le code gère les erreurs si un champ n'existe pas (continue avec les autres)
- Tous les documents sont générés en mémoire (pas de stockage)
- Le ZIP est généré à la volée et téléchargé directement

## 💳 Paiement (Stripe) et mise en ligne

### 1. Stripe

1. Créez un compte sur [Stripe](https://stripe.com) et passez en **mode test** ou **live** selon vos besoins.
2. Créez un **produit** avec un prix **récurrent** (abonnement mensuel ou annuel) et copiez l’identifiant `price_...` dans `STRIPE_PRICE_ID` côté backend.
3. Renseignez dans `backend/.env` :
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET` (après création du webhook, voir ci-dessous)
4. Dans le [Dashboard Stripe → Webhooks](https://dashboard.stripe.com/webhooks), ajoutez un endpoint **POST** vers :  
   `https://<URL-de-votre-backend>/api/billing/webhook`  
   et sélectionnez au minimum les événements :  
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. Activez le **portail client** (Customer portal) dans Stripe pour que le bouton « Gérer mon abonnement » du tableau de bord fonctionne.

En local, vous pouvez relayer les webhooks avec la [Stripe CLI](https://stripe.com/docs/stripe-cli) :  
`stripe listen --forward-to localhost:3001/api/billing/webhook`

### 2. Variables d’environnement production

- **Backend** : voir `backend/.env.example` (`MONGODB_URI`, `JWT_SECRET`, `SESSION_SECRET`, `FRONTEND_URL`, clés Stripe, OAuth Google si utilisé).
- **Frontend** : `VITE_API_URL` doit pointer vers l’URL publique du backend (HTTPS).

### 3. Déploiement (exemple Render)

Un fichier `render.yaml` est fourni à la racine : service **Node** pour l’API et site **static** pour le build Vite. Créez une base [MongoDB Atlas](https://www.mongodb.com/atlas), configurez les variables secrètes sur Render, puis redéployez.

## 🐛 Dépannage

### Erreur "Fichier CERFA non trouvé"
- Vérifiez que les fichiers sont dans `backend/public/cerfa/`
- Vérifiez les noms exacts (sensible à la casse)
- Redémarrez le serveur backend

### Les champs CERFA ne se remplissent pas
- Les noms de champs peuvent avoir changé dans la nouvelle version du formulaire
- Utilisez `inspectCerfa.js` pour voir les noms actuels
- Adaptez le code dans `backend/src/services/documentGenerator.js`

## 📄 Licence

Application développée pour un usage professionnel conforme à la réglementation française.

