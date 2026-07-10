# Mapping des PDFs CERFA

Ce document décrit le mapping des champs pour chaque PDF CERFA utilisé dans l'application.

## 📄 Facture.pdf

**Format détecté**: Champs simples `Text1` à `Text25`

### Mapping actuel (à ajuster selon votre PDF) :

- **Text1** : Raison sociale vendeur
- **Text2** : SIRET vendeur
- **Text3** : Adresse vendeur
- **Text5** : Code postal + Ville vendeur
- **Text6** : Nom complet acheteur
- **Text7** : Adresse acheteur
- **Text8** : Code postal + Ville acheteur
- **Text9** : Numéro de facture
- **Text10** : Date de facture
- **Text11** : Marque véhicule
- **Text12** : Modèle véhicule
- **Text13** : Immatriculation
- **Text14** : VIN
- **Text17** : Prix TTC
- **Text18** : Prix HT
- **Text19** : TVA
- **Text20** : Kilométrage
- **Text21** : Mode de paiement
- **Text22-Text25** : (Non utilisés actuellement)

⚠️ **IMPORTANT** : Ce mapping est une estimation. Si les champs ne correspondent pas, ouvrez le PDF et vérifiez l'ordre réel des champs, puis ajustez le code dans `generateFactureFromPDF()`.

## 📄 La Garantie COMMERCIALE.pdf

**Format détecté**: Champs simples `Text1` à `Text6`

### Mapping actuel (à ajuster selon votre PDF) :

- **Text1** : Nom complet bénéficiaire (client)
- **Text2** : Adresse complète bénéficiaire
- **Text3** : Véhicule (marque + modèle + immatriculation)
- **Text4** : Date de début garantie
- **Text5** : Date de fin garantie (3 mois après)
- **Text6** : Raison sociale vendeur

⚠️ **IMPORTANT** : Ce mapping est une estimation. Si les champs ne correspondent pas, ouvrez le PDF et vérifiez l'ordre réel des champs, puis ajustez le code dans `generateGarantieFromPDF()`.

## 📄 CERFA 15776 (Certificat de cession)

**Format détecté**: Champs structurés avec noms explicites

### Mapping :

- `topmostSubform[0].Page1[0].num_Immatriculation[0]` : Immatriculation
- `topmostSubform[0].Page1[0].num_Identification[0]` : VIN
- `topmostSubform[0].Page1[0].txt_MarqueVéhicule[0]` : Marque
- `topmostSubform[0].Page1[0].txt_DénominationCommerciale[0]` : Modèle
- `topmostSubform[0].Page1[0].num_KilométrageCompteur[0]` : Kilométrage
- `topmostSubform[0].Page1[0].txt_IdentitéVendeur[0]` : Raison sociale vendeur
- `topmostSubform[0].Page1[0].Num_Siret[0]` : SIRET vendeur
- `topmostSubform[0].Page1[0].txt_IdentitéAcheteur[0]` : Nom complet acheteur
- Etc.

✅ Ce mapping est basé sur l'analyse automatique du PDF.

## 📄 CERFA 13757 (Mandat d'immatriculation)

**Format détecté**: Champs `Champ_de_texte1[0]` à `Champ_de_texte1[17]`

### Mapping (corrigé manuellement) :

- `Champ_de_texte1[0]` : Nom + Prénom (combiné)
- `Champ_de_texte1[1]` : Adresse
- `Champ_de_texte1[2]` : Ville
- `Champ_de_texte1[13]` : Code postal
- `Champ_de_texte1[4]` : Marque + Modèle (combiné)
- `Champ_de_texte1[5]` : Immatriculation
- `Champ_de_texte1[12]` : VIN

✅ Ce mapping a été corrigé manuellement selon vos indications.

## 📄 BDC_MB.pdf (Bon de commande)

**Format détecté**: Champs structurés `form1[0].page1[0].*`

### Mapping :

- `form1[0].page1[0].vendeur[0]` : Vendeur
- `form1[0].page1[0].acheteur[0]` : Acheteur
- `form1[0].page1[0].c01[0]` : Marque
- `form1[0].page1[0].c02[0]` : Modèle
- `form1[0].page1[0].c04[0]` : Immatriculation
- `form1[0].page1[0].c05[0]` : VIN
- `form1[0].page1[0].c06[0]` : Kilométrage
- `form1[0].page1[0].e02_e03[0]` : Prix TTC
- Etc.

✅ Ce mapping est basé sur l'analyse automatique du PDF.

## 🔧 Comment ajuster le mapping

Si un PDF n'est pas correctement rempli :

1. **Inspecter le PDF** :
   ```bash
   cd backend
   node src/utils/inspectCerfa.js public/cerfa/NOM_DU_FICHIER.pdf
   ```

2. **Identifier les champs** : Notez les noms exacts des champs dans le PDF

3. **Modifier le code** : Éditez la fonction correspondante dans `src/services/documentGenerator.js` :
   - `generateFactureFromPDF()` pour Facture.pdf
   - `generateGarantieFromPDF()` pour La Garantie COMMERCIALE.pdf
   - `generateCerfaCession()` pour CERFA 15776
   - `generateCerfaMandat()` pour CERFA 13757
   - `generateBDCMB()` pour BDC_MB.pdf

4. **Tester** : Régénérez les documents et vérifiez que les champs sont correctement remplis

## 📊 Analyse automatique

Un script d'analyse automatique est disponible :

```bash
cd backend
node src/utils/analyzeAllCerfa.js
```

Ce script génère un rapport `cerfa_analysis.json` avec tous les champs de chaque PDF.

