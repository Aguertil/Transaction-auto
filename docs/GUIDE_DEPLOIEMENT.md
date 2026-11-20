# 🚀 Guide de déploiement complet

## ✅ Ce qui a été créé

### Backend
- ✅ Base de données MongoDB avec modèles User et Document
- ✅ Authentification locale (email/mot de passe) + Google OAuth
- ✅ Système de rôles (gratuit, premium, admin)
- ✅ Routes publiques pour actes de vente gratuits
- ✅ Routes protégées pour utilisateurs premium
- ✅ Interface d'administration (API)
- ✅ Middleware d'authentification JWT
- ✅ Script de création de compte admin

### Frontend
- ✅ Page d'accueil publique avec formulaire gratuit
- ✅ Pages de connexion/inscription
- ✅ Dashboard utilisateur
- ✅ Interface d'administration
- ✅ Gestion des tokens JWT
- ✅ Intégration Google OAuth
- ✅ Routing avec React Router
- ✅ Protection des routes selon les rôles

## 📋 Installation

### 1. Backend

```bash
cd backend

# Installer les dépendances (déjà fait)
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer MongoDB (si local)
mongod

# Créer le compte admin
npm run create-admin admin@example.com password123 Admin System

# Démarrer le serveur
npm start
```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances (déjà fait)
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec l'URL du backend

# Démarrer le serveur de développement
npm run dev
```

## 🔐 Configuration Google OAuth (optionnel)

1. Aller sur https://console.cloud.google.com/
2. Créer un projet
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter l'URL de callback : `http://localhost:3001/api/auth/google/callback`
6. Ajouter dans `.env` du backend :
   ```
   GOOGLE_CLIENT_ID=votre-client-id
   GOOGLE_CLIENT_SECRET=votre-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```

## 🎯 Utilisation

### Mode Gratuit (Public)
- Accès : Page d'accueil (`/`)
- Fonctionnalité : Génération du contrat de vente uniquement
- Aucune authentification requise

### Mode Premium
- Accès : Inscription → Dashboard
- Fonctionnalités : Tous les documents CERFA, factures, garanties
- Authentification : Email/mot de passe ou Google OAuth

### Mode Admin
- Accès : Dashboard → Administration
- Fonctionnalités : Gestion des utilisateurs, statistiques, historique complet

## 📡 Routes API

### Publiques
- `POST /api/documents/public/generate` - Génération gratuite (contrat uniquement)
- `GET /api/documents/available` - Liste des documents disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/google` - Connexion Google
- `GET /api/auth/me` - Profil utilisateur

### Premium (Protégées)
- `POST /api/documents/generate` - Génération complète
- `GET /api/documents/history` - Historique utilisateur

### Admin (Protégées)
- `GET /api/admin/users` - Liste des utilisateurs
- `PUT /api/admin/users/:id/role` - Modifier le rôle
- `PUT /api/admin/users/:id/status` - Activer/Désactiver
- `GET /api/admin/stats` - Statistiques
- `GET /api/admin/documents` - Historique complet

## 🌐 Routes Frontend

- `/` - Page d'accueil (publique)
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Dashboard utilisateur (protégé)
- `/generate` - Génération de documents (protégé)
- `/admin` - Interface d'administration (admin uniquement)
- `/auth/callback` - Callback Google OAuth

## 🔒 Sécurité en production

1. **Changer tous les secrets** dans `.env`
2. **Utiliser HTTPS** (obligatoire pour OAuth)
3. **Configurer CORS** correctement
4. **Limiter les tentatives de connexion** (rate limiting)
5. **Valider toutes les entrées** utilisateur
6. **Utiliser MongoDB Atlas** (cloud) ou sécuriser MongoDB local

## 📊 Structure des rôles

| Rôle | Accès | Documents |
|------|-------|-----------|
| **Gratuit** | Public | Contrat de vente uniquement |
| **Premium** | Authentifié | Tous les documents |
| **Admin** | Authentifié | Tous + Administration |

## 🚀 Déploiement

### Backend (Heroku/Railway/VPS)
1. Configurer les variables d'environnement
2. Utiliser MongoDB Atlas (cloud)
3. Configurer le callback Google OAuth avec l'URL de production

### Frontend (Vercel/Netlify)
1. Configurer `VITE_API_URL` avec l'URL du backend
2. Configurer les redirections pour React Router

## 🧪 Test

```bash
# Test route publique
curl -X POST http://localhost:3001/api/documents/public/generate \
  -H "Content-Type: application/json" \
  -d '{"societe":{...},"client":{...},"vehicule":{...},"vente":{...}}'

# Test inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","nom":"Test","prenom":"User"}'

# Test connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

