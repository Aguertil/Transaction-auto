#!/bin/bash

echo "🍃 Configuration MongoDB pour Auto Documents Generator"
echo "======================================================"
echo ""

# Vérifier si MongoDB est installé
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB n'est pas installé"
    echo ""
    echo "Installation en cours..."
    echo "1. Ajout du tap MongoDB..."
    brew tap mongodb/brew
    
    echo "2. Installation de MongoDB Community..."
    brew install mongodb-community
    
    echo "✅ MongoDB installé"
else
    echo "✅ MongoDB est déjà installé"
fi

# Créer les répertoires nécessaires
echo ""
echo "📁 Création des répertoires..."
if [ -d "/usr/local/var/mongodb" ]; then
    sudo chown -R $(whoami) /usr/local/var/mongodb 2>/dev/null
    sudo chown -R $(whoami) /usr/local/var/log/mongodb 2>/dev/null
elif [ -d "/opt/homebrew/var/mongodb" ]; then
    sudo chown -R $(whoami) /opt/homebrew/var/mongodb 2>/dev/null
    sudo chown -R $(whoami) /opt/homebrew/var/log/mongodb 2>/dev/null
fi

# Démarrer MongoDB
echo ""
echo "🚀 Démarrage de MongoDB..."
brew services start mongodb-community

# Attendre que MongoDB démarre
echo "⏳ Attente du démarrage de MongoDB..."
sleep 5

# Vérifier que MongoDB fonctionne
if mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo "✅ MongoDB est démarré et fonctionne"
else
    echo "⚠️  MongoDB démarre... (peut prendre quelques secondes)"
    sleep 5
fi

# Créer le compte admin
echo ""
echo "👤 Création du compte admin..."
cd "$(dirname "$0")"
npm run create-admin admin@mbauto.fr Admin123 Admin MB-Auto

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Identifiants admin :"
echo "   Email: admin@mbauto.fr"
echo "   Password: Admin123"
echo ""
echo "🔗 URLs :"
echo "   Frontend: http://localhost:5175"
echo "   Dashboard: http://localhost:5175/dashboard"
echo "   Admin: http://localhost:5175/admin"

