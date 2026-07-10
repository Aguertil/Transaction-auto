#!/bin/bash

echo "🔐 Configuration Google OAuth 2.0"
echo "=================================="
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé"
    echo "Création du fichier .env..."
    cp .env.example .env 2>/dev/null || touch .env
fi

echo "📝 Configuration des identifiants Google OAuth"
echo ""
echo "Pour obtenir vos identifiants :"
echo "1. Allez sur https://console.cloud.google.com/"
echo "2. Créez un projet (ou sélectionnez-en un)"
echo "3. Activez Google+ API"
echo "4. Créez des identifiants OAuth 2.0"
echo "5. Configurez les URIs de redirection :"
echo "   - http://localhost:3001/api/auth/google/callback"
echo ""
echo "Voir CONFIGURATION_GOOGLE_OAUTH.md pour les détails complets"
echo ""

read -p "Entrez votre Google Client ID: " CLIENT_ID
read -p "Entrez votre Google Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Client ID et Client Secret sont requis"
    exit 1
fi

# Mettre à jour .env
echo ""
echo "📝 Mise à jour du fichier .env..."

# Supprimer les anciennes valeurs si elles existent
sed -i.bak '/^GOOGLE_CLIENT_ID=/d' .env
sed -i.bak '/^GOOGLE_CLIENT_SECRET=/d' .env
sed -i.bak '/^GOOGLE_CALLBACK_URL=/d' .env

# Ajouter les nouvelles valeurs
echo "" >> .env
echo "# Google OAuth Configuration" >> .env
echo "GOOGLE_CLIENT_ID=$CLIENT_ID" >> .env
echo "GOOGLE_CLIENT_SECRET=$CLIENT_SECRET" >> .env
echo "GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback" >> .env

echo "✅ Configuration sauvegardée dans .env"
echo ""
echo "🔧 Variables configurées :"
echo "   GOOGLE_CLIENT_ID=$CLIENT_ID"
echo "   GOOGLE_CLIENT_SECRET=${CLIENT_SECRET:0:10}..."
echo "   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback"
echo ""
echo "🚀 Redémarrez le backend pour activer Google OAuth :"
echo "   pkill -f 'node src/server.js' && npm start"
echo ""

