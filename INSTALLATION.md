# Guide d'Installation

## Prérequis

- Node.js 18+ et npm (ou yarn)
- Les fichiers PDF CERFA officiels (voir `INSTRUCTIONS_CERFA.md`)

## Installation étape par étape

### 1. Installation des dépendances Backend

```bash
cd backend
npm install
```

### 2. Installation des dépendances Frontend

```bash
cd ../frontend
npm install
```

### 3. Préparation des fichiers CERFA

1. Téléchargez les fichiers CERFA depuis le site officiel (voir `INSTRUCTIONS_CERFA.md`)
2. Placez-les dans `backend/public/cerfa/` :
   - `cerfa_15776_02.pdf`
   - `cerfa_13757_03.pdf` (optionnel)

### 4. Démarrage de l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm start
```

Le serveur démarre sur `http://localhost:3001`

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

L'application est accessible sur `http://localhost:5173`

## 🚀 Utilisation

1. Ouvrez votre navigateur sur `http://localhost:5173`
2. Remplissez le formulaire avec les informations :
   - Société (vendeur)
   - Client (acheteur)
   - Véhicule
   - Données de vente
3. Cochez l'option "Mandat d'immatriculation" si nécessaire
4. Cliquez sur "Générer le dossier client"
5. Un fichier ZIP contenant tous les documents sera téléchargé

## 📁 Structure des documents générés

Le ZIP contient :
1. `00-Mandat-Immatriculation-CERFA-13757.pdf` (si option cochée)
2. `01-Certificat-Cession-CERFA-15776.pdf`
3. `02-Facture-Vente.pdf`
4. `03-Contrat-Vente.pdf`
5. `04-Contrat-Garantie-3mois.pdf`
6. `05-Notice-Garanties-Legales.pdf`
7. `06-Proces-Verbal-Livraison.pdf`

## 🔧 Configuration

### Sauvegarde des données société

Les informations de la société peuvent être sauvegardées dans le navigateur (localStorage) pour éviter de les ressaisir à chaque fois.

### Ports

- Backend : `3001` (modifiable dans `backend/src/server.js`)
- Frontend : `5173` (modifiable dans `frontend/vite.config.js`)

## ⚠️ Dépannage

### Erreur "Fichier CERFA non trouvé"

- Vérifiez que les fichiers sont bien dans `backend/public/cerfa/`
- Vérifiez les noms de fichiers (sensible à la casse)
- Redémarrez le serveur backend

### Erreur de génération PDF

- Vérifiez que les champs du formulaire sont tous remplis
- Consultez les logs du serveur backend pour plus de détails

### Port déjà utilisé

- Modifiez le port dans la configuration
- Ou arrêtez le processus utilisant le port

## 📝 Notes

- Aucune base de données n'est utilisée
- Les données ne sont pas stockées de manière persistante
- Tous les documents sont générés à la demande




