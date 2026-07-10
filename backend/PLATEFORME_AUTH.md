# Plan d'implémentation de la plateforme avec authentification

## Architecture

### 1. Base de données
- **MongoDB** avec Mongoose
- Collections :
  - `users` : Utilisateurs (gratuit, premium, admin)
  - `documents` : Historique des documents générés
  - `sessions` : Sessions utilisateurs

### 2. Système d'authentification
- Authentification locale (email/mot de passe)
- Google OAuth 2.0
- JWT pour les tokens de session
- Sessions avec cookies sécurisés

### 3. Rôles et permissions
- **Gratuit** : Accès uniquement aux actes de vente (contrat de vente)
- **Premium** : Accès complet à tous les documents
- **Admin** : Accès complet + gestion des utilisateurs

### 4. Routes API
- `/api/auth/*` : Authentification
- `/api/documents/*` : Génération de documents (protégées selon le rôle)
- `/api/admin/*` : Administration (admin uniquement)
- `/api/public/*` : Routes publiques (actes de vente gratuits)

### 5. Frontend
- Page d'accueil publique
- Page de connexion/inscription
- Dashboard utilisateur
- Interface d'administration

