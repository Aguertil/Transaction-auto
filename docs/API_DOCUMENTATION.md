# Documentation API

## Endpoints

### POST `/api/documents/generate`

Génère tous les documents et retourne un fichier ZIP.

**Request Body:**
```json
{
  "societe": {
    "raisonSociale": "string (obligatoire)",
    "siret": "string (obligatoire)",
    "adresse": "string (obligatoire)",
    "codePostal": "string (obligatoire)",
    "ville": "string (obligatoire)",
    "telephone": "string (optionnel)",
    "email": "string (optionnel)"
  },
  "client": {
    "nom": "string (obligatoire)",
    "prenom": "string (obligatoire)",
    "adresse": "string (obligatoire)",
    "codePostal": "string (obligatoire)",
    "ville": "string (obligatoire)",
    "telephone": "string (optionnel)",
    "email": "string (optionnel)"
  },
  "vehicule": {
    "marque": "string (obligatoire)",
    "modele": "string (obligatoire)",
    "immatriculation": "string (obligatoire)",
    "vin": "string (obligatoire)",
    "datePremiereImmat": "YYYY-MM-DD (obligatoire)",
    "kilometrage": "string (obligatoire)",
    "couleur": "string (optionnel)"
  },
  "vente": {
    "dateVente": "YYYY-MM-DD (obligatoire)",
    "prixTTC": "number (obligatoire)",
    "modePaiement": "string (optionnel)",
    "numeroFacture": "string (optionnel, généré automatiquement si vide)"
  },
  "options": {
    "generateMandat": "boolean (optionnel, défaut: false)"
  }
}
```

**Response:**
- Content-Type: `application/zip`
- Body: Fichier ZIP binaire contenant tous les documents PDF

**Exemple avec curl:**
```bash
curl -X POST http://localhost:3001/api/documents/generate \
  -H "Content-Type: application/json" \
  -d @EXEMPLE_DONNEES.json \
  --output dossier.zip
```

---

### POST `/api/documents/generate/:type`

Génère un document spécifique.

**Types disponibles:**
- `cerfa-cession` - CERFA 15776*02
- `cerfa-mandat` - CERFA 13757*03
- `facture` - Facture de vente
- `contrat` - Contrat de vente
- `garantie` - Contrat de garantie 3 mois
- `notice` - Notice garanties légales
- `pv-livraison` - Procès-verbal de livraison

**Request Body:**
Même structure que `/api/documents/generate` (tous les champs)

**Response:**
- Content-Type: `application/pdf`
- Body: Fichier PDF binaire

**Exemple:**
```bash
curl -X POST http://localhost:3001/api/documents/generate/facture \
  -H "Content-Type: application/json" \
  -d @EXEMPLE_DONNEES.json \
  --output facture.pdf
```

---

### GET `/api/health`

Vérification de l'état du serveur.

**Response:**
```json
{
  "status": "ok",
  "message": "Auto Documents Generator API"
}
```

---

## Codes d'erreur

- `400` - Données incomplètes ou invalides
- `500` - Erreur lors de la génération

**Format d'erreur:**
```json
{
  "error": "Type d'erreur",
  "message": "Description détaillée"
}
```

---

## Notes

- Tous les documents sont générés en mémoire
- Aucune donnée n'est stockée
- Les fichiers CERFA doivent être présents dans `backend/public/cerfa/`
- Les noms de champs CERFA peuvent nécessiter une adaptation (voir GUIDE_ADAPTATION_CERFA.md)




