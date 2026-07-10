# Guide d'Adaptation des Champs CERFA

## 🔍 Pourquoi adapter les champs ?

Les formulaires CERFA peuvent être mis à jour par le gouvernement, et les noms des champs peuvent changer. Si vous constatez que les champs ne se remplissent pas correctement, il faut adapter le code.

## 📋 Étape 1 : Inspecter le PDF CERFA

Utilisez le script d'inspection fourni :

```bash
cd backend
node src/utils/inspectCerfa.js ../public/cerfa/cerfa_15776_02.pdf
```

Ce script affichera tous les champs disponibles avec leurs noms exacts.

## 📝 Étape 2 : Identifier les champs à modifier

Ouvrez le fichier `backend/src/services/documentGenerator.js` et localisez la fonction `generateCerfaCession()` (ou `generateCerfaMandat()` pour le mandat).

Vous verrez des appels comme :

```javascript
fillField('Nom', data.client.nom);
fillField('Prenom', data.client.prenom);
```

## 🔧 Étape 3 : Adapter les noms de champs

Remplacez les noms de champs dans la fonction `fillField()` par les noms exacts trouvés lors de l'inspection.

### Exemple

**Avant (noms supposés) :**
```javascript
fillField('Nom', data.client.nom);
fillField('Prenom', data.client.prenom);
fillField('Adresse', data.client.adresse);
```

**Après inspection, si les noms sont différents :**
```javascript
fillField('nomCessionnaire', data.client.nom);
fillField('prenomCessionnaire', data.client.prenom);
fillField('adresseCessionnaire', data.client.adresse);
```

## 🎯 Champs typiques à adapter

### CERFA 15776*02 (Certificat de cession)

Champs courants pour le cessionnaire (acheteur) :
- Nom / nomCessionnaire / NomCessionnaire
- Prénom / prenomCessionnaire / PrenomCessionnaire
- Adresse / adresseCessionnaire / AdresseCessionnaire
- Code postal / codePostalCessionnaire / CodePostalCessionnaire
- Ville / villeCessionnaire / VilleCessionnaire

Champs courants pour le cédant (vendeur) :
- Raison sociale / raisonSociale / RaisonSociale
- SIRET / siret / SIRET
- Adresse professionnelle / adressePro / AdressePro

Champs courants pour le véhicule :
- Marque / marque / Marque
- Type / type / Type / Modele
- Numéro de série / numeroSerie / NumeroSerie / VIN
- Immatriculation / immatriculation / Immatriculation
- Date première immatriculation / datePremiereImmat / DatePremiereImmat
- Kilométrage / kilometrage / Kilometrage

### CERFA 13757*03 (Mandat d'immatriculation)

Champs courants :
- Nom mandant / nomMandant / NomMandant
- Prénom mandant / prenomMandant / PrenomMandant
- Adresse mandant / adresseMandant / AdresseMandant
- Immatriculation / immatriculation / Immatriculation
- Marque / marque / Marque
- Type / type / Type

## 🛡️ Gestion des erreurs

Le code actuel gère déjà les erreurs si un champ n'existe pas :

```javascript
const fillField = (fieldName, value) => {
  try {
    const field = form.getTextField(fieldName);
    if (field && value) {
      field.setText(String(value));
    }
  } catch (e) {
    // Champ non trouvé, on continue
    console.warn(`Champ ${fieldName} non trouvé dans le CERFA`);
  }
};
```

Cela signifie que si un champ n'existe pas, l'application continue de fonctionner mais le champ ne sera pas rempli.

## ✅ Vérification

Après avoir adapté les champs :

1. Redémarrez le serveur backend
2. Testez la génération d'un document
3. Vérifiez que les champs sont bien remplis dans le PDF généré
4. Consultez les logs du serveur pour voir les avertissements éventuels

## 📚 Ressources

- Documentation pdf-lib : https://pdf-lib.js.org/
- Site officiel des formulaires : https://www.service-public.fr/particuliers/vosdroits/F33528

## 💡 Astuce

Si vous avez plusieurs versions de CERFA à gérer, vous pouvez créer une fonction de mapping :

```javascript
const fieldMapping = {
  'nom': ['Nom', 'nomCessionnaire', 'NomCessionnaire'],
  'prenom': ['Prenom', 'prenomCessionnaire', 'PrenomCessionnaire'],
  // ...
};

const fillFieldMultiple = (possibleNames, value) => {
  for (const name of possibleNames) {
    try {
      const field = form.getTextField(name);
      if (field && value) {
        field.setText(String(value));
        return; // Succès, on arrête
      }
    } catch (e) {
      // Continue avec le nom suivant
    }
  }
  console.warn(`Aucun champ trouvé parmi: ${possibleNames.join(', ')}`);
};
```




