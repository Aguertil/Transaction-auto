#!/bin/bash

# Script de démarrage rapide pour l'application
# Usage: ./start.sh

echo "🚀 Démarrage de l'application Auto Documents Generator"
echo ""

# Vérification des fichiers CERFA
CERFA_DIR="backend/public/cerfa"
CERFA_15776="$CERFA_DIR/cerfa_15776_02.pdf"
CERFA_13757="$CERFA_DIR/cerfa_13757_03.pdf"

if [ ! -f "$CERFA_15776" ]; then
    echo "⚠️  ATTENTION: Fichier CERFA 15776*02 non trouvé!"
    echo "   Placez-le dans: $CERFA_DIR"
    echo "   Voir INSTRUCTIONS_CERFA.md pour plus d'infos"
    echo ""
fi

if [ ! -f "$CERFA_13757" ]; then
    echo "⚠️  Fichier CERFA 13757*03 non trouvé (optionnel)"
    echo "   Placez-le dans: $CERFA_DIR si vous souhaitez générer le mandat"
    echo ""
fi

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Installation des dépendances si nécessaire
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Démarrage des serveurs..."
echo ""
echo "📡 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Démarrage en arrière-plan
cd backend && npm start &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Attente
wait




