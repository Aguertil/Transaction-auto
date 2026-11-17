import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  source: {
    type: String,
    enum: ['account', 'public'],
    default: 'account'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'cerfa-cession',
      'cerfa-mandat',
      'cerfa-13750',
      'bdc-mb',
      'facture',
      'contrat',
      'garantie',
      'notice',
      'pv-livraison',
      'quitus-fiscal'
    ]
  },
  fileName: {
    type: String,
    required: true
  },
  clientData: {
    type: mongoose.Schema.Types.Mixed
  },
  vehiculeData: {
    type: mongoose.Schema.Types.Mixed
  },
  societeData: {
    type: mongoose.Schema.Types.Mixed
  },
  venteData: {
    type: mongoose.Schema.Types.Mixed
  },
  vendeurUEData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Renseigné à la suppression du compte : déclenche l'effacement après 6 mois
  accountDeletedAt: {
    type: Date,
    default: undefined
  }
});

documentSchema.index({ createdAt: -1 });
documentSchema.index({ userId: 1, createdAt: -1 });

// RGPD : les données saisies lors d'une génération sans compte sont
// supprimées automatiquement par MongoDB après 24 mois.
export const PUBLIC_RETENTION_SECONDS = 60 * 60 * 24 * 730;
documentSchema.index(
  { createdAt: 1 },
  {
    name: 'public_documents_ttl_24_mois',
    expireAfterSeconds: PUBLIC_RETENTION_SECONDS,
    partialFilterExpression: { source: 'public' }
  }
);

// RGPD : documents d'un compte supprimé effacés 6 mois après la suppression.
// (L'index TTL n'agit que sur les documents où accountDeletedAt est défini.)
export const DELETED_ACCOUNT_RETENTION_SECONDS = 60 * 60 * 24 * 182;
documentSchema.index(
  { accountDeletedAt: 1 },
  { name: 'deleted_account_documents_ttl_6_mois', expireAfterSeconds: DELETED_ACCOUNT_RETENTION_SECONDS }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
