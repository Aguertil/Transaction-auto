# Guide de Démarrage Rapide

## ⚡ Démarrage en 5 minutes

### 1. Prérequis
- Node.js 18+ installé
- Les fichiers CERFA téléchargés (voir ci-dessous)

### 2. Télécharger les CERFA (2 minutes)

**CERFA 15776*02 (obligatoire):**
1. Allez sur https://www.formulaires.service-public.fr/gf/cerfa_15776.do
2. Téléchargez le PDF
3. Renommez-le en `cerfa_15776_02.pdf`
4. Placez-le dans `backend/public/cerfa/`

**CERFA 13757*03 (optionnel):**
1. Allez sur https://www.formulaires.service-public.fr/gf/cerfa_13757.do
2. Téléchargez le PDF
3. Renommez-le en `cerfa_13757_03.pdf`
4. Placez-le dans `backend/public/cerfa/`

### 3. Installation (1 minute)

```bash
# Backend
cd backend
npm install

# Frontend (nouveau terminal)
cd ../frontend
npm install
```

### 4. Démarrage (30 secondes)

**Option A - Script automatique:**
```bash
./start.sh
```

**Option B - Manuel:**
```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

### 5. Utilisation

1. Ouvrez http://localhost:5173
2. Remplissez le formulaire
3. Cliquez sur "Générer le dossier client"
4. Le ZIP est téléchargé automatiquement

## ✅ Vérification

- ✅ Backend accessible sur http://localhost:3001/api/health
- ✅ Frontend accessible sur http://localhost:5173
- ✅ Fichiers CERFA dans `backend/public/cerfa/`

## 🐛 Problèmes courants

**"Fichier CERFA non trouvé"**
→ Vérifiez que les fichiers sont bien dans `backend/public/cerfa/` avec les bons noms

**"Port déjà utilisé"**
→ Modifiez les ports dans `backend/src/server.js` et `frontend/vite.config.js`

**"Les champs CERFA ne se remplissent pas"**
→ Voir GUIDE_ADAPTATION_CERFA.md pour adapter les noms de champs

## 📚 Documentation complète

- [README.md](README.md) - Vue d'ensemble
- [INSTALLATION.md](INSTALLATION.md) - Installation détaillée
- [INSTRUCTIONS_CERFA.md](INSTRUCTIONS_CERFA.md) - Instructions CERFA
- [CONFORMITE_LEGALE.md](CONFORMITE_LEGALE.md) - Conformité légale
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Documentation API




