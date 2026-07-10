# 🚀 Étapes de déploiement de la plateforme

## ✅ Ce qui a été créé

### Backend
- ✅ Base de données MongoDB avec modèles User et Document
- ✅ Authentification locale (email/mot de passe)
- ✅ Authentification Google OAuth
- ✅ Système de rôles (gratuit, premium, admin)
- ✅ Routes publiques pour les actes de vente gratuits
- ✅ Routes protégées pour les utilisateurs premium
- ✅ Interface d'administration (API)
- ✅ Middleware d'authentification JWT
- ✅ Script de création de compte admin

## 📋 Prochaines étapes

### 1. Configuration initiale

```bash
# 1. Créer le fichier .env
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs

# 2. Démarrer MongoDB (si local)
mongod

# 3. Créer le compte admin
npm run create-admin admin@example.com password123 Admin System

# 4. Démarrer le serveur
npm start
```

### 2. Configuration Google OAuth (optionnel)

1. Aller sur https://console.cloud.google.com/
2. Créer un projet
3. Activer Google+ API
4. Créer des identifiants OAuth 2.0
5. Ajouter dans `.env`:
   ```
   GOOGLE_CLIENT_ID=votre-client-id
   GOOGLE_CLIENT_SECRET=votre-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```

### 3. Adapter le Frontend

Le frontend doit être adapté pour :
- Page d'accueil publique avec formulaire gratuit
- Page de connexion/inscription
- Dashboard utilisateur
- Interface d'administration
- Gestion des tokens JWT

### 4. Déploiement

#### Backend
- Heroku, Railway, ou VPS
- MongoDB Atlas (cloud) ou MongoDB local
- Variables d'environnement à configurer

#### Frontend
- Vercel, Netlify, ou VPS
- Configurer FRONTEND_URL dans le backend

## 🔐 Sécurité en production

1. **Changer tous les secrets** dans `.env`
2. **Utiliser HTTPS** (obligatoire pour OAuth)
3. **Configurer CORS** correctement
4. **Limiter les tentatives de connexion** (rate limiting)
5. **Valider toutes les entrées** utilisateur
6. **Utiliser des variables d'environnement** sécurisées

## 📊 Structure des rôles

- **Gratuit** : `/api/documents/public/generate` (contrat uniquement)
- **Premium** : `/api/documents/generate` (tous les documents)
- **Admin** : `/api/admin/*` (gestion complète)

## 🧪 Test de l'API

```bash
# Test route publique
curl -X POST http://localhost:3001/api/documents/public/generate \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test route premium (avec token)
curl -X POST http://localhost:3001/api/documents/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-data.json
```

