# 🎉 Plateforme Auto Documents Generator - COMPLÈTE

## ✨ Fonctionnalités

### 🆓 Mode Gratuit (Public)
- ✅ Génération du contrat de vente uniquement
- ✅ Aucune inscription requise
- ✅ Accès illimité

### 💎 Mode Premium (Authentifié)
- ✅ Tous les documents CERFA (13757, 13750, 15776)
- ✅ Factures de vente
- ✅ Contrats de garantie
- ✅ Bon de commande
- ✅ Historique des documents
- ✅ Authentification locale ou Google OAuth

### 👑 Mode Admin
- ✅ Gestion complète des utilisateurs
- ✅ Modification des rôles (gratuit/premium/admin)
- ✅ Activation/Désactivation de comptes
- ✅ Statistiques détaillées
- ✅ Historique complet de tous les documents

## 📁 Structure du projet

```
auto-documents-generator/
├── backend/
│   ├── src/
│   │   ├── models/          # Modèles MongoDB (User, Document)
│   │   ├── routes/          # Routes API (auth, documents, admin)
│   │   ├── middleware/      # Authentification JWT
│   │   ├── config/          # Database, Passport
│   │   ├── services/        # Générateur de documents
│   │   └── scripts/         # Scripts utilitaires (createAdmin)
│   ├── public/cerfa/        # PDFs CERFA remplissables
│   └── .env                  # Configuration (à créer)
│
└── frontend/
    ├── src/
    │   ├── pages/           # Pages (Home, Dashboard, Admin)
    │   ├── components/     # Composants (Login, Register)
    │   ├── context/          # AuthContext
    │   └── App.jsx          # Routing principal
    └── .env                  # Configuration (à créer)
```

## 🚀 Démarrage rapide

### 1. Backend

```bash
cd backend

# Créer .env
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/auto-documents
JWT_SECRET=changez-moi-en-production
SESSION_SECRET=changez-moi-en-production
FRONTEND_URL=http://localhost:5174
PORT=3001
EOF

# Démarrer MongoDB (si local)
mongod

# Créer l'admin
npm run create-admin admin@example.com admin123 Admin System

# Démarrer
npm start
```

### 2. Frontend

```bash
cd frontend

# Créer .env
echo "VITE_API_URL=http://localhost:3001" > .env

# Démarrer
npm run dev
```

## 🔐 Comptes par défaut

Après création de l'admin :
- **Email** : admin@example.com
- **Mot de passe** : admin123
- **Rôle** : admin

⚠️ **Changez le mot de passe après la première connexion !**

## 📝 Utilisation

1. **Accès gratuit** : Aller sur `http://localhost:5174`
   - Remplir le formulaire
   - Générer le contrat de vente (gratuit)

2. **Créer un compte** : Cliquer sur "Inscription"
   - Compte gratuit par défaut
   - Accès au dashboard

3. **Passer Premium** : Un admin doit modifier le rôle dans `/admin`

4. **Interface Admin** : Se connecter avec le compte admin
   - Gérer les utilisateurs
   - Voir les statistiques
   - Consulter l'historique

## 🔧 Configuration avancée

### Google OAuth (optionnel)

1. Google Cloud Console → Créer un projet
2. Activer Google+ API
3. Créer identifiants OAuth 2.0
4. Ajouter dans `.env` backend :
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```

### MongoDB Atlas (Cloud)

1. Créer un cluster sur https://www.mongodb.com/cloud/atlas
2. Obtenir l'URI de connexion
3. Ajouter dans `.env` :
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/auto-documents
   ```

## 📊 API Endpoints

### Publiques
- `POST /api/documents/public/generate` - Contrat gratuit
- `GET /api/documents/available` - Documents disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Profil

### Premium
- `POST /api/documents/generate` - Génération complète
- `GET /api/documents/history` - Historique

### Admin
- `GET /api/admin/users` - Liste utilisateurs
- `PUT /api/admin/users/:id/role` - Modifier rôle
- `PUT /api/admin/users/:id/status` - Activer/Désactiver
- `GET /api/admin/stats` - Statistiques
- `GET /api/admin/documents` - Historique complet

## 🎨 Interface

- **Page d'accueil** : Formulaire gratuit + bannière premium
- **Connexion/Inscription** : Design moderne avec Google OAuth
- **Dashboard** : Vue d'ensemble + historique
- **Admin** : Tableaux de gestion + statistiques

## 🐛 Dépannage

### MongoDB non connecté
- Le backend fonctionne en mode "gratuit uniquement"
- Les routes publiques fonctionnent
- Les routes premium nécessitent MongoDB

### Erreur CORS
- Vérifier `FRONTEND_URL` dans `.env` backend
- Vérifier `VITE_API_URL` dans `.env` frontend

### Token invalide
- Se déconnecter et se reconnecter
- Vérifier que le token est bien stocké dans localStorage

## 📚 Documentation

- `README_PLATEFORME.md` - Guide backend
- `GUIDE_DEPLOIEMENT.md` - Guide de déploiement
- `ETAPES_DEPLOIEMENT.md` - Étapes détaillées

## 🎯 Prochaines étapes possibles

- [ ] Système de paiement pour passer Premium
- [ ] Email de confirmation d'inscription
- [ ] Réinitialisation de mot de passe
- [ ] Export Excel des statistiques
- [ ] Templates de documents personnalisables
- [ ] API REST complète avec documentation Swagger

