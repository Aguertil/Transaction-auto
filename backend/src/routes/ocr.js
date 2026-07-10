import express from 'express';
import multer from 'multer';
import { processDocument, mergeExtractedData } from '../services/documentOcr.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/tiff',
      'image/bmp',
      'application/pdf'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPG, PNG, WEBP ou PDF.'));
    }
  }
});

const DOCUMENT_TYPES = new Set(['carte-grise', 'kbis', 'cni', 'domicile']);

/**
 * POST /api/ocr/extract
 * Corps multipart : fichiers nommés selon le type (carte-grise, kbis, cni, domicile)
 * ou champ "documents" JSON : [{ field, type }]
 */
router.post('/extract', upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    let typeMap = {};
    if (req.body.typeMap) {
      try {
        typeMap = JSON.parse(req.body.typeMap);
      } catch {
        return res.status(400).json({ error: 'typeMap JSON invalide' });
      }
    }

    const tasks = files.map((file) => {
      const documentType = typeMap[file.fieldname] || file.fieldname;
      if (!DOCUMENT_TYPES.has(documentType)) {
        throw new Error(`Type de document invalide: ${documentType}`);
      }
      return processDocument(file.buffer, file.mimetype, documentType);
    });

    const results = await Promise.all(tasks);
    const merged = mergeExtractedData(results);

    res.json({
      success: true,
      data: {
        societe: merged.societe,
        client: merged.client,
        vehicule: merged.vehicule
      },
      extractedFields: merged.extractedFields,
      warnings: merged.warnings,
      documents: results.map((r) => ({
        type: r.documentType,
        method: r.method,
        ocrConfidence: r.confidence,
        fieldConfidence: r.data.confidence,
        textPreview: r.textPreview
      }))
    });
  } catch (error) {
    console.error('Erreur OCR:', error);
    res.status(500).json({
      error: 'Erreur lors de la lecture des documents',
      message: error.message
    });
  }
});

export default router;
