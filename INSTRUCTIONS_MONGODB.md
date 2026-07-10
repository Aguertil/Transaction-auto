# 🍃 Instructions MongoDB

## État actuel

L'installation de MongoDB est **en cours**. Une fois terminée, suivez ces étapes :

## Option 1 : Script automatique (Recommandé)

```bash
cd backend
./setup-mongodb.sh
```

Ce script va :
1. ✅ Vérifier l'installation de MongoDB
2. ✅ Créer les répertoires nécessaires
3. ✅ Démarrer MongoDB
4. ✅ Créer le compte admin

## Option 2 : Installation manuelle

### 1. Vérifier que l'installation est terminée

```bash
brew list mongodb-community
```

Si vous voyez une liste de fichiers, l'installation est terminée.

### 2. Démarrer MongoDB

```bash
brew services start mongodb-community
```

### 3. Vérifier que MongoDB fonctionne

```bash
mongosh --eval "db.adminCommand('ping')"
```

Vous devriez voir : `{ ok: 1 }`

### 4. Créer le compte admin

```bash
cd backend
npm run create-admin admin@mbauto.fr Admin123 Admin MB-Auto
```

### 5. Redémarrer le backend

```bash
pkill -f "node src/server.js"
npm start
```

## Option 3 : MongoDB Atlas (Cloud - Gratuit)

Si l'installation locale pose problème, utilisez MongoDB Atlas :

1. **Créer un compte** : https://www.mongodb.com/cloud/atlas
2. **Créer un cluster gratuit** (M0)
3. **Obtenir l'URI de connexion** :
   - Cliquez sur "Connect"
   - Choisissez "Connect your application"
   - Copiez l'URI (format : `mongodb+srv://username:password@cluster.mongodb.net/`)
4. **Mettre à jour `.env`** :
   ```bash
   cd backend
   # Éditer .env et remplacer MONGODB_URI par votre URI Atlas
   ```
5. **Créer le compte admin** :
   ```bash
   npm run create-admin admin@mbauto.fr Admin123 Admin MB-Auto
   ```

## Vérification

Une fois MongoDB configuré, testez la connexion :

```bash
# Test de connexion API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mbauto.fr","password":"Admin123"}'
```

Vous devriez recevoir un token JWT.

## Commandes utiles

### Voir les utilisateurs dans MongoDB
```bash
mongosh auto-documents --eval "db.users.find().pretty()"
```

### Voir les documents générés
```bash
mongosh auto-documents --eval "db.documents.find().pretty()"
```

### Arrêter MongoDB
```bash
brew services stop mongodb-community
```

### Redémarrer MongoDB
```bash
brew services restart mongodb-community
```

## Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier les logs
tail -f /usr/local/var/log/mongodb/mongo.log
# ou
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### Port 27017 déjà utilisé
```bash
# Trouver le processus
lsof -i :27017
# Tuer si nécessaire
kill -9 <PID>
```

### Permissions
```bash
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb
```

## Identifiants Admin

Une fois MongoDB configuré :
- **Email** : `admin@mbauto.fr`
- **Password** : `Admin123`
- **Rôle** : Admin

⚠️ **Changez le mot de passe après la première connexion !**

