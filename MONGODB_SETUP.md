# 🍃 Configuration MongoDB

## Installation

### macOS (avec Homebrew)
```bash
# Ajouter le tap MongoDB
brew tap mongodb/brew

# Installer MongoDB Community Edition
brew install mongodb-community

# Démarrer MongoDB
brew services start mongodb-community
```

### Vérifier l'installation
```bash
# Vérifier que MongoDB tourne
brew services list | grep mongodb

# Tester la connexion
mongosh
# ou
mongo
```

## Configuration de l'application

Le fichier `.env` du backend contient déjà :
```
MONGODB_URI=mongodb://localhost:27017/auto-documents
```

## Créer le compte admin

```bash
cd backend
npm run create-admin admin@mbauto.fr Admin123 Admin MB-Auto
```

## Commandes utiles

### Démarrer MongoDB
```bash
brew services start mongodb-community
```

### Arrêter MongoDB
```bash
brew services stop mongodb-community
```

### Voir les logs MongoDB
```bash
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Se connecter à MongoDB
```bash
mongosh auto-documents
```

### Voir les utilisateurs
```bash
mongosh auto-documents --eval "db.users.find().pretty()"
```

### Voir les documents générés
```bash
mongosh auto-documents --eval "db.documents.find().pretty()"
```

## Alternative : MongoDB Atlas (Cloud)

Si vous préférez utiliser MongoDB dans le cloud :

1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Obtenir l'URI de connexion
4. Mettre à jour `.env` :
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auto-documents
   ```

## Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier les permissions
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb

# Redémarrer
brew services restart mongodb-community
```

### Port déjà utilisé
```bash
# Trouver le processus qui utilise le port 27017
lsof -i :27017

# Tuer le processus si nécessaire
kill -9 <PID>
```

