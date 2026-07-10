import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;

