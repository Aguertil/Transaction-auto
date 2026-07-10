# 🔐 Accès Admin - Dashboard

## Identifiants de connexion

**Email:** `admin@mbauto.fr`  
**Mot de passe:** `Admin123`  
**Rôle:** Admin (accès complet)

⚠️ **Mode développement** : Ce compte fonctionne même sans MongoDB

## URLs

- **Frontend:** http://localhost:5175 (ou 5174 si disponible)
- **Backend API:** http://localhost:3001
- **Dashboard:** http://localhost:5175/dashboard
- **Administration:** http://localhost:5175/admin
- **Page d'accueil:** http://localhost:5175/

## Fonctionnalités Admin

### Dashboard
- Vue d'ensemble de votre compte
- Historique des documents générés
- Liste des documents disponibles

### Interface d'Administration (`/admin`)
- **Gestion des utilisateurs**
  - Liste de tous les utilisateurs
  - Modification des rôles (gratuit/premium/admin)
  - Activation/Désactivation de comptes
  - Voir la dernière connexion

- **Statistiques**
  - Nombre total d'utilisateurs
  - Répartition par rôle
  - Nombre de documents générés
  - Statistiques des 30 derniers jours

- **Historique des documents**
  - Tous les documents générés par tous les utilisateurs
  - Filtrage par type de document
  - Informations sur l'utilisateur et la date

## ⚠️ Sécurité

**Changez le mot de passe après la première connexion !**

Pour changer le mot de passe d'un utilisateur admin :
1. Connectez-vous au dashboard
2. Allez dans `/admin`
3. Utilisez l'interface pour modifier les utilisateurs

## Commandes utiles

### Créer un autre admin
```bash
cd backend
npm run create-admin email@example.com password123 Nom Prénom
```

### Vérifier le statut du serveur
```bash
curl http://localhost:3001/api/health
```

### Voir les logs backend
```bash
tail -f /tmp/backend.log
```

### Voir les logs frontend
```bash
tail -f /tmp/frontend.log
```

