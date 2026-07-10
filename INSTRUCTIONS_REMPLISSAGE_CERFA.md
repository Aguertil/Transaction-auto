# Instructions pour remplir les CERFA

## 📄 Étape 1 : Remplacer le PDF CERFA

Placez votre PDF remplissable dans le dossier :
```
backend/public/cerfa/cerfa_15776_02.pdf
```

(Remplacez le fichier existant si nécessaire)

## 🔍 Étape 2 : Inspecter les champs

Une fois le PDF en place, exécutez :

```bash
cd backend
node src/utils/inspectCerfa.js ../public/cerfa/cerfa_15776_02.pdf
```

Cela affichera tous les noms de champs disponibles dans le PDF.

## 📝 Étape 3 : Adapter le code

Une fois que vous connaissez les noms des champs, je peux adapter le code dans :
- `backend/src/services/documentGenerator.js`
- Fonction `generateCerfaCession()` pour le CERFA 15776*02
- Fonction `generateCerfaMandat()` pour le CERFA 13757*03

## ✅ Structure attendue des données

Le code remplit actuellement ces informations :

**Cessionnaire (acheteur) :**
- Nom
- Prénom
- Adresse
- Code postal
- Ville

**Cédant (vendeur professionnel) :**
- Raison sociale
- SIRET
- Adresse
- Code postal
- Ville

**Véhicule :**
- Marque
- Modèle
- Immatriculation
- VIN (numéro de série)
- Date première immatriculation
- Kilométrage

**Vente :**
- Date de cession

## 🎯 Prochaines étapes

1. Placez votre PDF remplissable dans `backend/public/cerfa/`
2. Dites-moi quand c'est fait
3. Je vais inspecter les champs et adapter le code automatiquement




