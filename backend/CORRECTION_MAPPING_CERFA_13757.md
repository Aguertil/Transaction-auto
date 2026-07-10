# Correction du Mapping CERFA 13757

## Problème
Les champs remplis automatiquement ne correspondent pas aux bons emplacements dans le formulaire CERFA 13757.

## Solution

### Étape 1 : Identifier les champs
1. Ouvrez le fichier `public/cerfa/cerfa_13757_03_TEST_MAPPING.pdf` dans Adobe Reader
2. Notez pour chaque champ visible dans le formulaire quel label apparaît (ex: "[0] NOM", "[1] PRENOM", etc.)

### Étape 2 : Corriger le mapping
Une fois que vous avez identifié les correspondances, modifiez le fichier `src/services/documentGenerator.js` dans la fonction `generateCerfaMandat()`.

### Exemple de correspondances à vérifier

D'après votre description :
- Le prénom apparaît dans le champ "Nom de la voie" → Il faut changer le mapping
- La marque apparaît dans le champ SIRET → Il faut changer le mapping

### Mapping actuel (à corriger)

```javascript
// 1. NOM - Champ_de_texte1[0]
fillField(`${basePath}.Champ_de_texte1[0]`, data.client.nom || '');

// 2. PRÉNOM - Champ_de_texte1[1]
fillField(`${basePath}.Champ_de_texte1[1]`, data.client.prenom || '');

// 3. ADRESSE - Champ_de_texte1[2]
fillField(`${basePath}.Champ_de_texte1[2]`, data.client.adresse || '');

// 4. CODE POSTAL - Champ_de_texte1[3]
fillField(`${basePath}.Champ_de_texte1[3]`, data.client.codePostal || '');

// 5. VILLE - Champ_de_texte1[4]
fillField(`${basePath}.Champ_de_texte1[4]`, data.client.ville || '');

// 6. IMMATRICULATION - Champ_de_texte1[5]
fillField(`${basePath}.Champ_de_texte1[5]`, data.vehicule.immatriculation || '');

// 7. VIN - Champ_de_texte1[6] (subform)
fillField(`${subformPath}.Champ_de_texte1[6]`, data.vehicule.vin || '');

// 8. MARQUE - Champ_de_texte1[7]
fillField(`${basePath}.Champ_de_texte1[7]`, data.vehicule.marque || '');

// 9. MODÈLE - Champ_de_texte1[8]
fillField(`${basePath}.Champ_de_texte1[8]`, data.vehicule.modele || '');
```

### Comment corriger

1. Ouvrez le PDF de test et notez les correspondances
2. Modifiez les indices dans `documentGenerator.js` selon vos observations
3. Testez en générant un nouveau PDF

### Alternative : Mode Éditable

En attendant la correction, vous pouvez :
1. Activer le "Mode Éditable" dans l'interface
2. Générer les PDFs
3. Corriger manuellement les champs dans Adobe Reader

Les PDFs générés en mode éditable restent modifiables.

