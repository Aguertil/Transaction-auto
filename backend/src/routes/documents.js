import express from 'express';
import { generateAllDocuments } from '../services/documentGenerator.js';
import { authenticateToken, requirePremium, optionalAuth } from '../middleware/auth.js';
import Document from '../models/Document.js';

const router = express.Router();

/**
 * Route publique : Génération du CERFA 15776 uniquement (gratuit)
 * POST /api/documents/public/generate
 */
router.post('/public/generate', optionalAuth, async (req, res) => {
  try {
    const data = req.body;

    // Limiter au CERFA 15776 (certificat de cession) uniquement
    const allowedTypes = ['cerfa-cession'];
    
    // Forcer les options pour ne générer que le CERFA 15776
    const originalOptions = data.options || {};
    data.options = {
      ...originalOptions,
      selectedDocuments: ['cerfa-cession'],
      editable: originalOptions.editable || false
    };

    console.log('📄 Génération publique (gratuite) - CERFA 15776 (Certificat de cession) uniquement');
    
    const pdfBuffer = await generateAllDocuments(data);
    
    // Enregistrer dans la base de données si utilisateur connecté
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
 * Route protégée : Génération complète (premium)
 * POST /api/documents/generate
 */
router.post('/generate', authenticateToken, requirePremium, async (req, res) => {
  try {
    const data = req.body;

    console.log(`📄 Génération premium pour utilisateur ${req.user.email}`);
    
    const pdfBuffer = await generateAllDocuments(data);
    
    // Enregistrer dans la base de données
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
    console.error('Erreur génération premium:', error);
    res.status(500).json({ error: 'Erreur lors de la génération des documents', message: error.message });
  }
});

/**
 * Liste des documents disponibles (selon le rôle)
 * GET /api/documents/available
 */
router.get('/available', optionalAuth, async (req, res) => {
  try {
    // Les admins ont automatiquement accès premium
    const userRole = req.user?.role || (req.user?._id === 'dev-admin-id' ? 'admin' : null);
    const hasPremium = userRole === 'admin' || req.user?.hasPremiumAccess?.() || false;
    
    // Documents gratuits
    const freeDocuments = [
      { type: 'contrat', name: '03-Contrat-Vente.pdf', label: 'Contrat de vente', available: true }
    ];

    // Documents premium
    const premiumDocuments = [
      { type: 'cerfa-cession', name: '01-Certificat-Cession-CERFA-15776.pdf', label: 'Certificat de cession (CERFA 15776)', available: hasPremium },
      { type: 'cerfa-mandat', name: '00-Mandat-Immatriculation-CERFA-13757.pdf', label: 'Mandat immatriculation (CERFA 13757)', available: hasPremium },
      { type: 'cerfa-13750', name: '07-Formulaire-Immatriculation-CERFA-13750.pdf', label: 'Formulaire immatriculation (CERFA 13750)', available: hasPremium },
      { type: 'bdc-mb', name: '08-Bon-de-Commande.pdf', label: 'Bon de commande', available: hasPremium },
      { type: 'facture', name: '02-Facture-Vente.pdf', label: 'Facture de vente', available: hasPremium },
      { type: 'garantie', name: '04-Contrat-Garantie-3mois.pdf', label: 'Contrat de garantie 3 mois', available: hasPremium },
      { type: 'notice', name: '05-Notice-Garanties-Legales.pdf', label: 'Notice garanties légales', available: hasPremium },
      { type: 'pv-livraison', name: '06-PV-Livraison.pdf', label: 'Procès-verbal de livraison', available: hasPremium },
      { type: 'quitus-fiscal', name: '09-Quitus-Fiscal-1993-PART-D.pdf', label: 'Quitus fiscal (1993-PART-D)', available: hasPremium }
    ];

    res.json({
      free: freeDocuments,
      premium: premiumDocuments,
      hasPremiumAccess: hasPremium,
      isAuthenticated: !!req.user
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
