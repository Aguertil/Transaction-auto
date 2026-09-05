import express from 'express';
import { generateAllDocuments } from '../services/documentGenerator.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import Document from '../models/Document.js';

const router = express.Router();

/**
 * Route publique : Génération du CERFA 15776 uniquement (sans compte)
 * POST /api/documents/public/generate
 */
router.post('/public/generate', optionalAuth, async (req, res) => {
  try {
    const data = req.body;

    // Limiter au CERFA 15776 (certificat de cession) uniquement
    const originalOptions = data.options || {};
    data.options = {
      ...originalOptions,
      selectedDocuments: ['cerfa-cession'],
      editable: originalOptions.editable || false
    };

    console.log('📄 Génération publique - CERFA 15776 (Certificat de cession) uniquement');

    const pdfBuffer = await generateAllDocuments(data);

    if (req.user) {
      try {
        await Document.create({
          userId: req.user._id,
          type: 'cerfa-cession',
          fileName: '01-CERFA-15776-Cession.pdf',
          clientData: data.client,
          vehiculeData: data.vehicule,
          societeData: data.societe,
          venteData: data.vente
        });
      } catch (dbError) {
        console.warn('Erreur enregistrement document:', dbError);
      }
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="cerfa-15776.zip"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur génération publique:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du document', message: error.message });
  }
});

/**
 * Route protégée : génération complète pour tout compte connecté
 * (paiement / premium mis de côté pour l’instant)
 * POST /api/documents/generate
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const data = req.body;

    console.log(`📄 Génération complète pour utilisateur ${req.user.email}`);

    const pdfBuffer = await generateAllDocuments(data);

    if (data.options?.selectedDocuments && data.options.selectedDocuments.length > 0) {
      try {
        for (const docType of data.options.selectedDocuments) {
          await Document.create({
            userId: req.user._id,
            type: docType,
            fileName: `document-${docType}.pdf`,
            clientData: data.client,
            vehiculeData: data.vehicule,
            societeData: data.societe,
            venteData: data.vente
          });
        }
      } catch (dbError) {
        console.warn('Erreur enregistrement documents:', dbError);
      }
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="documents.zip"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur génération documents:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des documents', message: error.message });
  }
});

/**
 * Liste des documents disponibles
 * Compte connecté = tous les documents.
 * GET /api/documents/available
 */
router.get('/available', optionalAuth, async (req, res) => {
  try {
    const isAuthenticated = !!req.user;
    const fullAccess = isAuthenticated;

    const freeDocuments = [
      { type: 'contrat', name: '03-Contrat-Vente.pdf', label: 'Contrat de vente', available: true }
    ];

    const allAccountDocuments = [
      { type: 'cerfa-cession', name: '01-Certificat-Cession-CERFA-15776.pdf', label: 'Certificat de cession (CERFA 15776)', available: fullAccess },
      { type: 'cerfa-mandat', name: '00-Mandat-Immatriculation-CERFA-13757.pdf', label: 'Mandat immatriculation (CERFA 13757)', available: fullAccess },
      { type: 'cerfa-13750', name: '07-Formulaire-Immatriculation-CERFA-13750.pdf', label: 'Formulaire immatriculation (CERFA 13750)', available: fullAccess },
      { type: 'bdc-mb', name: '08-Bon-de-Commande.pdf', label: 'Bon de commande', available: fullAccess },
      { type: 'facture', name: '02-Facture-Vente.pdf', label: 'Facture de vente', available: fullAccess },
      { type: 'garantie', name: '04-Contrat-Garantie-3mois.pdf', label: 'Contrat de garantie 3 mois', available: fullAccess },
      { type: 'notice', name: '05-Notice-Garanties-Legales.pdf', label: 'Notice garanties légales', available: fullAccess },
      { type: 'pv-livraison', name: '06-PV-Livraison.pdf', label: 'Procès-verbal de livraison', available: fullAccess },
      { type: 'quitus-fiscal', name: '09-Quitus-Fiscal-1993-PART-D.pdf', label: 'Quitus fiscal (1993-PART-D)', available: fullAccess }
    ];

    res.json({
      free: freeDocuments,
      premium: allAccountDocuments,
      hasPremiumAccess: fullAccess,
      isAuthenticated
    });
  } catch (error) {
    console.error('Erreur récupération documents disponibles:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

/**
 * Historique des documents de l'utilisateur
 * GET /api/documents/history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('type fileName createdAt');

    res.json({ documents });
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

export default router;
