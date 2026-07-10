# Instructions pour obtenir les fichiers CERFA

## 📄 Fichiers CERFA requis

L'application nécessite les fichiers PDF officiels du gouvernement français pour fonctionner correctement.

### 1. CERFA 15776*02 - Certificat de cession

**Obligatoire** pour toutes les ventes de véhicules.

**Où le télécharger :**
- Site officiel : https://www.service-public.fr/particuliers/vosdroits/F33528
- Ou directement : https://www.formulaires.service-public.fr/gf/cerfa_15776.do

**Instructions :**
1. Téléchargez le formulaire PDF
2. Renommez-le en `cerfa_15776_02.pdf`
3. Placez-le dans le dossier `backend/public/cerfa/`

### 2. CERFA 13757*03 - Mandat d'immatriculation

**Optionnel** - uniquement si vous souhaitez générer ce document.

**Où le télécharger :**
- Site officiel : https://www.service-public.fr/particuliers/vosdroits/F33530
- Ou directement : https://www.formulaires.service-public.fr/gf/cerfa_13757.do

**Instructions :**
1. Téléchargez le formulaire PDF
2. Renommez-le en `cerfa_13757_03.pdf`
3. Placez-le dans le dossier `backend/public/cerfa/`

## ⚠️ Important

- Utilisez **uniquement** les formulaires officiels du gouvernement
- Ne modifiez **pas** la structure du PDF
- L'application remplit automatiquement les champs du formulaire
- Les noms de fichiers doivent être **exacts** : `cerfa_15776_02.pdf` et `cerfa_13757_03.pdf`

## 🔍 Vérification

Après avoir placé les fichiers, vérifiez que :
- Les fichiers sont bien dans `backend/public/cerfa/`
- Les noms de fichiers sont corrects (sensible à la casse)
- Les fichiers sont des PDFs valides

## 📝 Note technique

L'application utilise `pdf-lib` pour remplir les champs des formulaires CERFA. Si les noms de champs dans le PDF changent (mise à jour du formulaire), il faudra adapter le code dans `backend/src/services/documentGenerator.js`.

Pour inspecter les noms de champs d'un PDF CERFA, vous pouvez utiliser des outils comme Adobe Acrobat ou des bibliothèques JavaScript spécialisées.




