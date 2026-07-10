# Plateforme Auto Documents Generator

## 🚀 Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Créez un fichier `.env` à la racine du backend avec :
```env
MONGODB_URI=mongodb://localhost:27017/auto-documents
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:5174
PORT=3001

# Stripe (abonnement — voir README racine section Paiement)
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

### 3. Démarrer MongoDB
```bash
# Local
mongod

# Ou utiliser MongoDB Atlas (cloud)
```

### 4. Créer le compte admin
```bash
npm run create-admin email@example.com password123 Nom Prenom
```

### 5. Démarrer le serveur
```bash
npm start
# ou en mode développement
npm run dev
```

## 📋 Fonctionnalités

### Mode Gratuit (Public)
- ✅ Génération du contrat de vente uniquement
- ✅ Aucune authentification requise
- ✅ Accès illimité

### Mode Premium (Authentifié)
- ✅ Tous les documents CERFA
- ✅ Factures
- ✅ Garanties
- ✅ Historique des documents
- ✅ Authentification locale ou Google OAuth

### Mode Admin
- ✅ Gestion des utilisateurs
- ✅ Modification des rôles
- ✅ Statistiques
- ✅ Historique complet

## 🔐 Authentification

### Inscription
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "Dupont",
  "prenom": "Jean"
}
```

### Connexion
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```
GET /api/auth/google
```

## 📡 API Routes

### Publiques
- `POST /api/documents/public/generate` - Génération gratuite (contrat uniquement)
- `GET /api/documents/available` - Liste des documents disponibles

### Protégées (Premium)
- `POST /api/documents/generate` - Génération complète
- `GET /api/documents/history` - Historique utilisateur

### Admin
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/:id/role` - Modifier le rôle
- `GET /api/admin/stats` - Statistiques

## 🔑 Rôles

- **gratuit** : Accès aux actes de vente uniquement
- **premium** : Accès complet à tous les documents
- **admin** : Accès complet + administration

## 🛠️ Configuration Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter l'URL de callback : `http://localhost:3001/api/auth/google/callback`
6. Ajouter les identifiants dans `.env`

