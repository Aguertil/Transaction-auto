#!/bin/bash

echo "🔍 Vérification de la configuration Google OAuth"
echo "================================================"
echo ""

# Vérifier .env
if [ -f .env ]; then
    echo "📄 Configuration dans .env :"
    echo "   GOOGLE_CLIENT_ID: $(grep '^GOOGLE_CLIENT_ID=' .env | cut -d'=' -f2 | head -c 40)..."
    echo "   GOOGLE_CLIENT_SECRET: $(grep '^GOOGLE_CLIENT_SECRET=' .env | cut -d'=' -f2 | head -c 15)..."
    echo "   GOOGLE_CALLBACK_URL: $(grep '^GOOGLE_CALLBACK_URL=' .env | cut -d'=' -f2-)"
    echo ""
    
    CALLBACK_URL=$(grep '^GOOGLE_CALLBACK_URL=' .env | cut -d'=' -f2-)
    
    echo "✅ URI de callback attendue :"
    echo "   $CALLBACK_URL"
    echo ""
    
    # Vérifier le format
    if [[ "$CALLBACK_URL" == *"/" ]]; then
        echo "⚠️  ATTENTION : L'URI se termine par un slash '/'"
        echo "   Google OAuth est très strict sur le format"
        echo "   L'URI ne doit PAS se terminer par un slash"
        echo ""
    fi
    
    if [[ "$CALLBACK_URL" == https://* ]]; then
        echo "⚠️  ATTENTION : L'URI utilise https://"
        echo "   En développement local, utilisez http://"
        echo ""
    fi
    
    echo "📋 Instructions pour Google Cloud Console :"
    echo ""
    echo "1. Allez sur : https://console.cloud.google.com/"
    echo "2. Sélectionnez votre projet"
    echo "3. APIs & Services → Credentials"
    echo "4. Cliquez sur votre OAuth 2.0 Client ID"
    echo "5. Dans 'Authorized redirect URIs', ajoutez EXACTEMENT :"
    echo ""
    echo "   $CALLBACK_URL"
    echo ""
    echo "6. Vérifiez qu'il n'y a PAS de slash à la fin"
    echo "7. Cliquez sur SAVE"
    echo ""
    
    # Tester le backend
    echo "🧪 Test du backend..."
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend accessible"
        
        # Tester la route Google OAuth
        RESPONSE=$(curl -s -I "http://localhost:3001/api/auth/google" 2>&1)
        if echo "$RESPONSE" | grep -q "302\|Location"; then
            echo "✅ Route Google OAuth fonctionne"
            LOCATION=$(echo "$RESPONSE" | grep -i "location" | cut -d' ' -f2- | tr -d '\r')
            echo "   Redirection vers : $LOCATION"
        else
            echo "⚠️  Route Google OAuth ne répond pas correctement"
        fi
    else
        echo "❌ Backend non accessible sur http://localhost:3001"
        echo "   Démarrez le backend avec : npm start"
    fi
    
else
    echo "❌ Fichier .env non trouvé"
fi

echo ""
echo "================================================"


