#!/bin/bash

echo ""
echo "🔐 ========================================"
echo "🔐 CONFIGURATION GOOGLE OAUTH"
echo "🔐 ========================================"
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé"
    echo "Création du fichier .env..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        touch .env
        echo "# MongoDB Configuration" >> .env
        echo "MONGODB_URI=mongodb://localhost:27017/auto-documents" >> .env
        echo "" >> .env
        echo "# JWT Secret" >> .env
        echo "JWT_SECRET=your-secret-key-change-in-production" >> .env
        echo "" >> .env
        echo "# Session Secret" >> .env
        echo "SESSION_SECRET=your-session-secret-change-in-production" >> .env
        echo "" >> .env
        echo "# Frontend URL" >> .env
        echo "FRONTEND_URL=http://localhost:5174" >> .env
        echo "" >> .env
        echo "# Port" >> .env
        echo "PORT=3001" >> .env
    fi
    echo "✅ Fichier .env créé"
fi

# Vérifier si déjà configuré
if grep -q "GOOGLE_CLIENT_ID=" .env && ! grep -q "GOOGLE_CLIENT_ID=$" .env && ! grep -q "GOOGLE_CLIENT_ID=^$" .env; then
    EXISTING_ID=$(grep "^GOOGLE_CLIENT_ID=" .env | cut -d'=' -f2)
    if [ ! -z "$EXISTING_ID" ]; then
        echo "⚠️  Google OAuth semble déjà configuré"
        echo "   Client ID: ${EXISTING_ID:0:30}..."
        read -p "Voulez-vous le reconfigurer? (o/N): " RECONFIGURE
        if [[ ! "$RECONFIGURE" =~ ^[Oo]$ ]]; then
            echo "✅ Configuration conservée"
            exit 0
        fi
    fi
fi

echo ""
echo "📋 Pour obtenir vos identifiants Google OAuth :"
echo ""
echo "1. Allez sur : https://console.cloud.google.com/"
echo "2. Créez un projet (ou sélectionnez-en un)"
echo "3. Activez Google+ API"
echo "4. Créez OAuth 2.0 Client ID"
echo "5. Configurez l'URI de redirection :"
echo "   http://localhost:3001/api/auth/google/callback"
echo ""
echo "📖 Guide détaillé : ../CONFIGURATION_GOOGLE_OAUTH.md"
echo ""

read -p "Avez-vous vos identifiants Google? (o/N): " HAS_CREDENTIALS

if [[ ! "$HAS_CREDENTIALS" =~ ^[Oo]$ ]]; then
    echo ""
    echo "📝 Étapes rapides :"
    echo ""
    echo "1. Ouvrez : https://console.cloud.google.com/"
    echo "2. Créez un projet → Nommez-le"
    echo "3. APIs & Services → Library → Recherchez 'Google+ API' → Enable"
    echo "4. APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID"
    echo "5. Configurez l'écran de consentement (première fois seulement)"
    echo "6. Type : Web application"
    echo "7. Authorized redirect URIs : http://localhost:3001/api/auth/google/callback"
    echo "8. Copiez le Client ID et Client Secret"
    echo ""
    read -p "Appuyez sur Entrée quand vous avez vos identifiants... " WAIT
fi

echo ""
echo "📝 Entrez vos identifiants Google OAuth :"
echo ""

read -p "Google Client ID: " CLIENT_ID
read -p "Google Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Client ID et Client Secret sont requis"
    exit 1
fi

# Validation basique
if [[ ! "$CLIENT_ID" =~ \.apps\.googleusercontent\.com$ ]] && [[ ! "$CLIENT_ID" =~ ^[0-9]+- ]]; then
    echo "⚠️  Le Client ID ne semble pas valide (format attendu: xxxxx.apps.googleusercontent.com)"
    read -p "Continuer quand même? (o/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Oo]$ ]]; then
        exit 1
    fi
fi

if [[ ! "$CLIENT_SECRET" =~ ^GOCSPX- ]]; then
    echo "⚠️  Le Client Secret ne semble pas valide (format attendu: GOCSPX-xxxxx)"
    read -p "Continuer quand même? (o/N): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Oo]$ ]]; then
        exit 1
    fi
fi

# Sauvegarder la configuration
echo ""
echo "💾 Sauvegarde de la configuration..."

# Supprimer les anciennes valeurs
sed -i.bak '/^GOOGLE_CLIENT_ID=/d' .env
sed -i.bak '/^GOOGLE_CLIENT_SECRET=/d' .env
sed -i.bak '/^GOOGLE_CALLBACK_URL=/d' .env
sed -i.bak '/^# Google OAuth/d' .env

# Ajouter les nouvelles valeurs
echo "" >> .env
echo "# Google OAuth Configuration" >> .env
echo "GOOGLE_CLIENT_ID=$CLIENT_ID" >> .env
echo "GOOGLE_CLIENT_SECRET=$CLIENT_SECRET" >> .env
echo "GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback" >> .env

echo "✅ Configuration sauvegardée dans .env"
echo ""

# Vérifier le backend
echo "🔄 Vérification du backend..."
sleep 1

if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend détecté sur http://localhost:3001"
    echo ""
    echo "⚠️  IMPORTANT : Redémarrez le backend pour activer Google OAuth"
    echo ""
    read -p "Voulez-vous redémarrer le backend maintenant? (O/n): " RESTART
    if [[ ! "$RESTART" =~ ^[Nn]$ ]]; then
        echo "🔄 Redémarrage du backend..."
        pkill -f "node src/server.js" 2>/dev/null
        sleep 2
        npm start > /tmp/backend.log 2>&1 &
        sleep 3
        echo "✅ Backend redémarré"
    fi
else
    echo "⚠️  Backend non détecté. Démarrez-le avec : npm start"
fi

echo ""
echo "✅ ========================================"
echo "✅ CONFIGURATION TERMINÉE"
echo "✅ ========================================"
echo ""
echo "📋 Variables configurées :"
echo "   GOOGLE_CLIENT_ID=${CLIENT_ID:0:40}..."
echo "   GOOGLE_CLIENT_SECRET=${CLIENT_SECRET:0:15}..."
echo "   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback"
echo ""
echo "🧪 Test :"
echo "   1. Ouvrez : http://localhost:5174/login"
echo "   2. Cliquez sur 'Continuer avec Google'"
echo "   3. Connectez-vous avec votre compte Google"
echo ""
echo "✅ Google OAuth est maintenant configuré !"
echo ""


