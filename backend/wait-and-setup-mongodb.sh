#!/bin/bash

echo "🍃 Attente de l'installation MongoDB et configuration automatique"
echo "================================================================"
echo ""

# Attendre que l'installation se termine
echo "⏳ Attente de la fin de l'installation MongoDB..."
while ! brew list mongodb-community &>/dev/null; do
    echo "   Installation en cours... (vérification toutes les 10 secondes)"
    sleep 10
done

echo "✅ MongoDB installé !"
echo ""

# Trouver le chemin de mongod
MONGOD_PATH=$(which mongod 2>/dev/null || find /usr/local/bin /opt/homebrew/bin -name mongod 2>/dev/null | head -1)

if [ -z "$MONGOD_PATH" ]; then
    echo "❌ Erreur: mongod non trouvé"
    exit 1
fi

echo "📁 Configuration des répertoires..."

# Créer et configurer les répertoires
if [ -d "/usr/local/var" ]; then
    mkdir -p /usr/local/var/mongodb
    mkdir -p /usr/local/var/log/mongodb
    sudo chown -R $(whoami) /usr/local/var/mongodb 2>/dev/null
    sudo chown -R $(whoami) /usr/local/var/log/mongodb 2>/dev/null
    echo "✅ Répertoires configurés (usr/local)"
elif [ -d "/opt/homebrew/var" ]; then
    mkdir -p /opt/homebrew/var/mongodb
    mkdir -p /opt/homebrew/var/log/mongodb
    sudo chown -R $(whoami) /opt/homebrew/var/mongodb 2>/dev/null
    sudo chown -R $(whoami) /opt/homebrew/var/log/mongodb 2>/dev/null
    echo "✅ Répertoires configurés (opt/homebrew)"
fi

echo ""
echo "🚀 Démarrage de MongoDB..."
brew services start mongodb-community

echo "⏳ Attente du démarrage de MongoDB..."
sleep 10

# Trouver mongosh
MONGOSH_PATH=$(which mongosh 2>/dev/null || find /usr/local/bin /opt/homebrew/bin -name mongosh 2>/dev/null | head -1)

if [ -z "$MONGOSH_PATH" ]; then
    echo "⚠️  mongosh non trouvé, utilisation de mongo..."
    MONGOSH_PATH=$(which mongo 2>/dev/null || find /usr/local/bin /opt/homebrew/bin -name mongo 2>/dev/null | head -1)
fi

# Tester la connexion
echo "🔍 Test de connexion..."
if $MONGOSH_PATH --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB est démarré et fonctionne"
else
    echo "⚠️  MongoDB démarre... (attente supplémentaire)"
    sleep 10
    if $MONGOSH_PATH --eval "db.adminCommand('ping')" &>/dev/null; then
        echo "✅ MongoDB est démarré et fonctionne"
    else
        echo "❌ Erreur: MongoDB ne répond pas"
        exit 1
    fi
fi

echo ""
echo "👤 Création du compte admin..."
cd "$(dirname "$0")"
npm run create-admin admin@mbauto.fr Admin123 Admin MB-Auto

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ========================================"
    echo "✅ MONGODB CONFIGURÉ AVEC SUCCÈS"
    echo "✅ ========================================"
    echo ""
    echo "✅ MongoDB: Installé et démarré"
    echo "✅ Compte admin: Créé dans MongoDB"
    echo ""
    echo "📋 Identifiants :"
    echo "   Email: admin@mbauto.fr"
    echo "   Password: Admin123"
    echo ""
    echo "🔗 URLs :"
    echo "   Frontend: http://localhost:5175"
    echo "   Dashboard: http://localhost:5175/dashboard"
    echo "   Admin: http://localhost:5175/admin"
    echo ""
    echo "✅ Redémarrez le backend pour utiliser MongoDB :"
    echo "   pkill -f 'node src/server.js' && npm start"
    echo ""
else
    echo ""
    echo "⚠️  Erreur lors de la création du compte admin"
    echo "   Le compte admin fonctionne en mode développement"
    echo "   Email: admin@mbauto.fr"
    echo "   Password: Admin123"
fi

