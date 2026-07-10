import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFKitDoc from 'pdfkit';
import archiver from 'archiver';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERFA_DIR = path.join(__dirname, '../../public/cerfa');

/**
 * Trouve un fichier CERFA en acceptant différents formats de nom
 */
function findCerfaFile(baseName) {
  const variations = [
    baseName,
    baseName.replace(/_/g, '-'),
    baseName.replace(/-/g, '_')
  ];
  
  for (const variant of variations) {
    const filePath = path.join(CERFA_DIR, variant);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

/**
 * Génère tous les documents et les retourne dans un ZIP
 */
export async function generateAllDocuments(data) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const buffers = [];

  archive.on('data', (chunk) => buffers.push(chunk));
  archive.on('end', () => {});

  // Liste de tous les documents disponibles
  const allDocuments = [
    { name: '01-Certificat-Cession-CERFA-15776.pdf', type: 'cerfa-cession', label: 'Certificat de cession (CERFA 15776)' },
    { name: '02-Facture-Vente.pdf', type: 'facture', label: 'Facture de vente' },
    { name: '03-Contrat-Vente.pdf', type: 'contrat', label: 'Contrat de vente' },
    { name: '04-Contrat-Garantie-3mois.pdf', type: 'garantie', label: 'Contrat de garantie 3 mois' },
    { name: '05-Notice-Garanties-Legales.pdf', type: 'notice', label: 'Notice garanties légales' },
    { name: '06-Proces-Verbal-Livraison.pdf', type: 'pv-livraison', label: 'Procès-verbal de livraison' }
  ];

  // Détection automatique de tous les PDF remplissables présents dans le dossier
  try {
    const cerfaFiles = fs.readdirSync(CERFA_DIR);
    const cerfaPatterns = [
      { pattern: /cerfa[-_]13750/i, name: '07-Formulaire-Immatriculation-CERFA-13750.pdf', type: 'cerfa-13750', label: 'Formulaire immatriculation (CERFA 13750)' },
      { pattern: /cerfa[-_]13757/i, name: '00-Mandat-Immatriculation-CERFA-13757.pdf', type: 'cerfa-mandat', label: 'Mandat immatriculation (CERFA 13757)' },
      { pattern: /bdc[-_]mb/i, name: '08-Bon-de-Commande-BDC-MB.pdf', type: 'bdc-mb', label: 'Bon de commande (BDC_MB)' },
      { pattern: /facture|invoice|fact/i, name: '02-Facture-Vente.pdf', type: 'facture', label: 'Facture de vente (PDF remplissable)' },
      { pattern: /garantie|warranty|garant|warr/i, name: '04-Contrat-Garantie-3mois.pdf', type: 'garantie', label: 'Contrat de garantie 3 mois (PDF remplissable)' }
    ];

    for (const cerfaFile of cerfaFiles) {
      if (cerfaFile.toLowerCase().endsWith('.pdf') && !cerfaFile.startsWith('.')) {
        for (const pattern of cerfaPatterns) {
          if (pattern.pattern.test(cerfaFile)) {
            // Vérifier si le document n'est pas déjà dans la liste
            const alreadyAdded = allDocuments.some(doc => doc.type === pattern.type);
            if (!alreadyAdded) {
              allDocuments.push({ name: pattern.name, type: pattern.type, label: pattern.label });
            }
            break;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors de la détection des CERFA:', error);
  }

  // Filtrer selon les options sélectionnées
  const selectedDocuments = allDocuments.filter(doc => {
    // Si aucune sélection n'est fournie, générer tous les documents par défaut
    if (!data.options?.selectedDocuments || data.options.selectedDocuments.length === 0) {
      return true;
    }
    return data.options.selectedDocuments.includes(doc.type);
  });

  const documents = selectedDocuments;

  // Génération de chaque document
  for (const doc of documents) {
    try {
      const pdfBuffer = await generateSingleDocument(doc.type, data);
      archive.append(pdfBuffer, { name: doc.name });
    } catch (error) {
      console.error(`Erreur génération ${doc.name}:`, error);
      // Continue avec les autres documents même en cas d'erreur
    }
  }

  archive.finalize();

  // Attendre la fin de l'archivage
  return new Promise((resolve, reject) => {
    archive.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    archive.on('error', reject);
  });
}

/**
 * Génère un document spécifique
 */
export async function generateSingleDocument(type, data) {
  switch (type) {
    case 'cerfa-cession':
      return await generateCerfaCession(data);
    case 'cerfa-mandat':
      return await generateCerfaMandat(data);
    case 'cerfa-13750':
      return await generateCerfa13750(data);
    case 'bdc-mb':
      return await generateBDCMB(data);
    case 'facture':
      return await generateFacture(data);
    case 'contrat':
      return await generateContratVente(data);
    case 'garantie':
      return await generateContratGarantie(data);
    case 'notice':
      return await generateNoticeGaranties(data);
    case 'pv-livraison':
      return await generatePVLivraison(data);
    default:
      throw new Error(`Type de document inconnu: ${type}`);
  }
}

/**
 * Génère le CERFA 15776*02 - Certificat de cession
 * IMPORTANT: Utilise le PDF officiel et remplit uniquement les champs existants
 */
async function generateCerfaCession(data) {
  // Essayer d'abord cerfa_15776_01.pdf (remplissable), puis cerfa_15776_02.pdf
  let cerfaPath = findCerfaFile('cerfa_15776_01.pdf');
  if (!cerfaPath) {
    cerfaPath = findCerfaFile('cerfa_15776_02.pdf');
  }
  
  if (!cerfaPath) {
    throw new Error(`Fichier CERFA 15776*02 non trouvé. Placez-le dans: ${CERFA_DIR}`);
  }

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // Fonction helper pour remplir un champ
  const fillField = (fieldName, value) => {
    try {
      const field = form.getTextField(fieldName);
      if (field && value) {
        field.setText(String(value));
        return true;
      }
    } catch (e) {
      // Champ non trouvé, on continue
    }
    return false;
  };

  // Fonction pour remplir plusieurs variantes de noms de champs
  const fillFieldVariants = (variants, value) => {
    for (const variant of variants) {
      if (fillField(variant, value)) {
        return true;
      }
    }
    return false;
  };

  // Fonction pour parser une date et remplir jour/mois/année
  const fillDateFields = (baseName, dateString) => {
    if (!dateString) return;
    try {
      const date = new Date(dateString);
      const jour = String(date.getDate()).padStart(2, '0');
      const mois = String(date.getMonth() + 1).padStart(2, '0');
      const annee = String(date.getFullYear());
      
      fillFieldVariants([`${baseName}Jour`, `${baseName}J`, `${baseName}Jour[0]`], jour);
      fillFieldVariants([`${baseName}Mois`, `${baseName}M`, `${baseName}Mois[0]`], mois);
      fillFieldVariants([`${baseName}Année`, `${baseName}A`, `${baseName}Année[0]`], annee);
    } catch (e) {
      console.warn(`Erreur parsing date: ${dateString}`, e);
    }
  };

  try {
    // VÉHICULE - Page 1
    fillFieldVariants([
      'topmostSubform[0].Page1[0].num_Immatriculation[0]',
      'num_Immatriculation[0]',
      'Immatriculation'
    ], data.vehicule.immatriculation);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].num_Identification[0]',
      'num_Identification[0]',
      'Identification',
      'VIN'
    ], data.vehicule.vin);

    // Date première immatriculation
    if (data.vehicule.datePremiereImmat) {
      fillDateFields('topmostSubform[0].Page1[0].num_DateImmatriculation', data.vehicule.datePremiereImmat);
    }

    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_MarqueVéhicule[0]',
      'txt_MarqueVéhicule[0]',
      'Marque'
    ], data.vehicule.marque);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_TypeVarianteVersionVéhicule[0]',
      'txt_TypeVarianteVersionVéhicule[0]',
      'Type',
      'Modele'
    ], data.vehicule.modele);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].num_KilométrageCompteur[0]',
      'num_KilométrageCompteur[0]',
      'Kilometrage'
    ], data.vehicule.kilometrage);

    // VENDEUR (Cédant) - Page 1
    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_IdentitéVendeur[0]',
      'txt_IdentitéVendeur[0]',
      'RaisonSociale'
    ], data.societe.raisonSociale);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].Num_Siret[0]',
      'Num_Siret[0]',
      'SIRET'
    ], data.societe.siret);

    // Adresse vendeur - décomposée
    // Le champ adresse peut être dans num_VoieAdresse, txt_NomVoie, etc.
    // On essaie de remplir le champ complet d'abord
    const adresseVendeur = `${data.societe.adresse || ''}`.trim();
    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_NomVoie[0]',
      'txt_NomVoie[0]'
    ], adresseVendeur);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_CommuneAdresse[0]',
      'txt_CommuneAdresse[0]',
      'Ville'
    ], data.societe.ville);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].num_CodePostalAdresse[0]',
      'num_CodePostalAdresse[0]',
      'CodePostal'
    ], data.societe.codePostal);

    // ACHETEUR (Cessionnaire) - Page 1
    const nomCompletAcheteur = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_IdentitéAcheteur[0]',
      'txt_IdentitéAcheteur[0]',
      'Nom',
      'IdentiteAcheteur'
    ], nomCompletAcheteur);

    // Adresse acheteur
    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_NomVoieAdresseAcheteur[0]',
      'txt_NomVoieAdresseAcheteur[0]',
      'AdresseAcheteur'
    ], data.client.adresse);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].txt_CommuneAdresseAcheteur[0]',
      'txt_CommuneAdresseAcheteur[0]',
      'VilleAcheteur'
    ], data.client.ville);

    fillFieldVariants([
      'topmostSubform[0].Page1[0].num_CodePostalAdresseAcheteur[0]',
      'num_CodePostalAdresseAcheteur[0]',
      'CodePostalAcheteur'
    ], data.client.codePostal);

    // DATE DE VENTE
    if (data.vente.dateVente) {
      fillDateFields('topmostSubform[0].Page1[0].num_DateVente', data.vente.dateVente);
    }

    // Remplir aussi la page 2 (double exemplaire)
    fillFieldVariants(['topmostSubform[0].Page2[0].num_Immatriculation[0]'], data.vehicule.immatriculation);
    fillFieldVariants(['topmostSubform[0].Page2[0].num_Identification[0]'], data.vehicule.vin);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_MarqueVéhicule[0]'], data.vehicule.marque);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_TypeVarianteVersionVéhicule[0]'], data.vehicule.modele);
    fillFieldVariants(['topmostSubform[0].Page2[0].num_KilométrageCompteur[0]'], data.vehicule.kilometrage);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_IdentitéVendeur[0]'], data.societe.raisonSociale);
    fillFieldVariants(['topmostSubform[0].Page2[0].Num_Siret[0]'], data.societe.siret);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_CommuneAdresse[0]'], data.societe.ville);
    fillFieldVariants(['topmostSubform[0].Page2[0].num_CodePostalAdresse[0]'], data.societe.codePostal);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_IdentitéAcheteur[0]'], nomCompletAcheteur);
    fillFieldVariants(['topmostSubform[0].Page2[0].txt_CommuneAdresseAcheteur[0]'], data.client.ville);
    fillFieldVariants(['topmostSubform[0].Page2[0].num_CodePostalAdresseAcheteur[0]'], data.client.codePostal);
    if (data.vente.dateVente) {
      fillDateFields('topmostSubform[0].Page2[0].num_DateVente', data.vente.dateVente);
    }

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }

  } catch (error) {
    console.error('Erreur lors du remplissage du CERFA:', error);
    // On continue quand même pour retourner le PDF
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère le CERFA 13757*03 - Mandat d'immatriculation
 */
async function generateCerfaMandat(data) {
  const cerfaPath = findCerfaFile('cerfa_13757_03.pdf');
  
  if (!cerfaPath) {
    throw new Error(`Fichier CERFA 13757*03 non trouvé. Placez-le dans: ${CERFA_DIR} (nom: cerfa_13757_03.pdf ou cerfa_13757-03.pdf)`);
  }

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    const fillField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value) {
          field.setText(String(value));
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    // Mapping des champs du CERFA 13757 basé sur l'ordre typique d'un mandat d'immatriculation
    // Les indices correspondent à l'ordre logique du formulaire (pas l'ordre d'apparition dans le PDF)
    // Structure typique : Nom, Prénom, Adresse, Code postal, Ville, Immatriculation, Marque, Modèle, VIN, etc.
    
    const basePath = 'FormulaireGf[0].Page1[0]';
    const subformPath = 'FormulaireGf[0].Page1[0].#subform[0]';
    
    // 1. Nom du mandant (client) - généralement Champ_de_texte1[0]
    fillField(`${basePath}.Champ_de_texte1[0]`, data.client.nom || '');
    
    // 2. Prénom du mandant - généralement Champ_de_texte1[1]
    fillField(`${basePath}.Champ_de_texte1[1]`, data.client.prenom || '');
    
    // 3. Adresse complète - généralement Champ_de_texte1[2] ou plusieurs champs
    fillField(`${basePath}.Champ_de_texte1[2]`, data.client.adresse || '');
    
    // 4. Code postal - généralement Champ_de_texte1[3]
    fillField(`${basePath}.Champ_de_texte1[3]`, data.client.codePostal || '');
    
    // 5. Ville - généralement Champ_de_texte1[4]
    fillField(`${basePath}.Champ_de_texte1[4]`, data.client.ville || '');
    
    // 6. Immatriculation actuelle - généralement Champ_de_texte1[5]
    fillField(`${basePath}.Champ_de_texte1[5]`, data.vehicule.immatriculation || '');
    
    // 7. VIN (numéro d'identification) - généralement dans subform Champ_de_texte1[6]
    fillField(`${subformPath}.Champ_de_texte1[6]`, data.vehicule.vin || '');
    
    // 8. Marque - généralement Champ_de_texte1[7]
    fillField(`${basePath}.Champ_de_texte1[7]`, data.vehicule.marque || '');
    
    // 9. Modèle/Type - généralement Champ_de_texte1[8]
    fillField(`${basePath}.Champ_de_texte1[8]`, data.vehicule.modele || '');
    
    // 10. Date première immatriculation (jour) - généralement Champ_de_texte1[9]
    if (data.vehicule.datePremiereImmat) {
      try {
        const date = new Date(data.vehicule.datePremiereImmat);
        fillField(`${basePath}.Champ_de_texte1[9]`, String(date.getDate()).padStart(2, '0'));
        // Mois - généralement Champ_de_texte1[10]
        fillField(`${basePath}.Champ_de_texte1[10]`, String(date.getMonth() + 1).padStart(2, '0'));
        // Année - généralement Champ_de_texte1[12]
        fillField(`${basePath}.Champ_de_texte1[12]`, String(date.getFullYear()));
      } catch (e) {
        console.warn('Erreur parsing date première immat:', e);
      }
    }
    
    // 11. Autres champs possibles (téléphone, email, etc.) - Champ_de_texte1[13], [14], [15], [16], [17]
    if (data.client.telephone) {
      fillField(`${basePath}.Champ_de_texte1[13]`, data.client.telephone);
    }
    
    if (data.client.email) {
      fillField(`${basePath}.Champ_de_texte1[14]`, data.client.email);
    }

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage du mandat:', error);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère le CERFA 13750 - Formulaire d'immatriculation de véhicule
 */
async function generateCerfa13750(data) {
  const cerfaPath = findCerfaFile('cerfa-13750.pdf') || findCerfaFile('cerfa_13750.pdf');
  
  if (!cerfaPath) {
    throw new Error(`Fichier CERFA 13750 non trouvé. Placez-le dans: ${CERFA_DIR}`);
  }

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    const fillField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value) {
          field.setText(String(value));
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    const fillCheckbox = (fieldName, checked) => {
      try {
        const field = form.getCheckBox(fieldName);
        if (field) {
          if (checked) {
            field.check();
          } else {
            field.uncheck();
          }
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    const basePath = 'topmostSubform[0].Page1[0]';

    // Immatriculation actuelle
    fillField(`${basePath}.Vehiculenumeroimmaactuel[0]`, data.vehicule.immatriculation || '');

    // Nouveau format d'immatriculation (si applicable)
    fillField(`${basePath}.Newformatimma[0]`, data.vehicule.immatriculation || '');

    // Marque
    fillField(`${basePath}.Marque[0]`, data.vehicule.marque || '');

    // Dénomination commerciale
    fillField(`${basePath}.DenominationCommerciale[0]`, data.vehicule.denominationCommerciale || data.vehicule.modele || '');

    // Type/Variante/Version
    fillField(`${basePath}.TypeVarianteVersion[0]`, data.vehicule.typeVarianteVersion || data.vehicule.modele || '');

    // Numéro d'identification véhicule (VIN)
    fillField(`${basePath}.NumeroIdentificationVehicule[0]`, data.vehicule.vin || '');

    // Genre national
    fillField(`${basePath}.GenreNational[0]`, data.vehicule.genreNational || data.vehicule.modele || '');

    // Couleur - cocher la case correspondante si disponible
    if (data.vehicule.couleur) {
      const couleurLower = data.vehicule.couleur.toLowerCase();
      fillCheckbox(`${basePath}.blanc[0]`, couleurLower.includes('blanc'));
      fillCheckbox(`${basePath}.gris[0]`, couleurLower.includes('gris'));
      fillCheckbox(`${basePath}.beige[0]`, couleurLower.includes('beige'));
      fillCheckbox(`${basePath}.bleu[0]`, couleurLower.includes('bleu'));
      fillCheckbox(`${basePath}.vert[0]`, couleurLower.includes('vert'));
      fillCheckbox(`${basePath}.jaune[0]`, couleurLower.includes('jaune'));
      fillCheckbox(`${basePath}.orange[0]`, couleurLower.includes('orange'));
      fillCheckbox(`${basePath}.rouge[0]`, couleurLower.includes('rouge'));
      fillCheckbox(`${basePath}.marron[0]`, couleurLower.includes('marron'));
    }

    // Dates - remplir les champs de date si disponibles
    if (data.vehicule.datePremiereImmat) {
      try {
        const date = new Date(data.vehicule.datePremiereImmat);
        fillField(`${basePath}.Jour1[0]`, String(date.getDate()).padStart(2, '0'));
        fillField(`${basePath}.Jour2[0]`, String(date.getMonth() + 1).padStart(2, '0'));
        fillField(`${basePath}.Jour3[0]`, String(date.getFullYear()));
      } catch (e) {
        console.warn('Erreur parsing date:', e);
      }
    }

    // Date de vente si disponible
    if (data.vente.dateVente) {
      try {
        const date = new Date(data.vente.dateVente);
        // Utiliser les champs Jour disponibles
        fillField(`${basePath}.Jour1[0]`, String(date.getDate()).padStart(2, '0'));
        fillField(`${basePath}.Jour2[0]`, String(date.getMonth() + 1).padStart(2, '0'));
        fillField(`${basePath}.Jour3[0]`, String(date.getFullYear()));
      } catch (e) {
        console.warn('Erreur parsing date vente:', e);
      }
    }

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage du CERFA 13750:', error);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère le BDC_MB.pdf - Bon de commande / Document de vente
 */
async function generateBDCMB(data) {
  const bdcPath = findCerfaFile('BDC_MB.pdf');
  
  if (!bdcPath) {
    throw new Error(`Fichier BDC_MB.pdf non trouvé. Placez-le dans: ${CERFA_DIR}`);
  }

  const existingPdfBytes = fs.readFileSync(bdcPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    const fillField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value) {
          field.setText(String(value));
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    const basePath = 'form1[0].page1[0]';

    // Vendeur
    fillField(`${basePath}.vendeur[0]`, data.societe.raisonSociale || '');

    // Acheteur
    const nomCompletAcheteur = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
    fillField(`${basePath}.acheteur[0]`, nomCompletAcheteur);

    // Informations véhicule - mapping basé sur les champs typiques d'un bon de commande
    // c01, c02, etc. sont probablement des champs de caractéristiques
    fillField(`${basePath}.c01[0]`, data.vehicule.marque || '');
    fillField(`${basePath}.c02[0]`, data.vehicule.modele || '');
    fillField(`${basePath}.c04[0]`, data.vehicule.immatriculation || '');
    fillField(`${basePath}.c05[0]`, data.vehicule.vin || '');
    fillField(`${basePath}.c06[0]`, data.vehicule.kilometrage || '');
    fillField(`${basePath}.c15[0]`, data.vehicule.couleur || '');
    
    // Dates
    if (data.vehicule.datePremiereImmat) {
      fillField(`${basePath}.d01[0]`, formatDateFR(data.vehicule.datePremiereImmat));
    }
    if (data.vente.dateVente) {
      fillField(`${basePath}.d02[0]`, formatDateFR(data.vente.dateVente));
      fillField(`${basePath}.d04[0]`, formatDateFR(data.vente.dateVente));
      fillField(`${basePath}.d05[0]`, formatDateFR(data.vente.dateVente));
      fillField(`${basePath}.d06[0]`, formatDateFR(data.vente.dateVente));
    }
    fillField(`${basePath}.d15[0]`, formatDateFR(data.vente.dateVente || new Date()));
    fillField(`${basePath}.d18_d19[0]`, formatDateFR(data.vente.dateVente || new Date()));

    // Prix et montants
    if (data.vente.prixTTC) {
      fillField(`${basePath}.e02_e03[0]`, formatPrix(data.vente.prixTTC));
      fillField(`${basePath}.e07[0]`, formatPrix(data.vente.prixTTC));
      fillField(`${basePath}.e08[0]`, formatPrix(data.vente.prixTTC));
      fillField(`${basePath}.e11[0]`, formatPrix(data.vente.prixTTC));
      fillField(`${basePath}.e12[0]`, formatPrix(data.vente.prixTTC));
    }

    // Autres champs
    fillField(`${basePath}.c18_c19[0]`, data.vente.modePaiement || '');

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage du BDC_MB:', error);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère la facture de vente professionnelle
 * Utilise un PDF remplissable si présent dans le dossier, sinon génère avec PDFKit
 * Conforme à l'article 297 A du CGI (TVA sur marge)
 */
async function generateFacture(data) {
  // Chercher un fichier PDF de facture dans le dossier CERFA
  const facturePatterns = ['facture', 'invoice', 'fact'];
  let facturePath = null;
  
  try {
    const cerfaFiles = fs.readdirSync(CERFA_DIR);
    for (const file of cerfaFiles) {
      if (file.toLowerCase().endsWith('.pdf') && !file.startsWith('.')) {
        const fileLower = file.toLowerCase();
        if (facturePatterns.some(pattern => fileLower.includes(pattern))) {
          facturePath = path.join(CERFA_DIR, file);
          break;
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors de la recherche du fichier facture:', error);
  }

  // Si un fichier PDF remplissable est trouvé, l'utiliser
  if (facturePath && fs.existsSync(facturePath)) {
    return await generateFactureFromPDF(facturePath, data);
  }

  // Sinon, générer avec PDFKit (méthode originale)
  return generateFactureWithPDFKit(data);
}

/**
 * Remplit un PDF de facture remplissable
 */
async function generateFactureFromPDF(facturePath, data) {
  const existingPdfBytes = fs.readFileSync(facturePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    const fillField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value) {
          field.setText(String(value));
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    const fillFieldVariants = (variants, value) => {
      for (const variant of variants) {
        if (fillField(variant, value)) {
          return true;
        }
      }
      return false;
    };

    // Remplir les champs de la facture
    // Vendeur
    fillFieldVariants([
      'vendeur', 'vendeur[0]', 'vendeurNom', 'raisonSociale',
      'form1[0].page1[0].vendeur[0]', 'form1[0].page1[0].vendeurNom[0]'
    ], data.societe.raisonSociale);

    fillFieldVariants([
      'vendeurSIRET', 'siret', 'siretVendeur',
      'form1[0].page1[0].siret[0]'
    ], data.societe.siret);

    fillFieldVariants([
      'vendeurAdresse', 'adresseVendeur', 'vendeurAdr',
      'form1[0].page1[0].adresseVendeur[0]'
    ], data.societe.adresse);

    fillFieldVariants([
      'vendeurVille', 'villeVendeur', 'vendeurCP',
      'form1[0].page1[0].villeVendeur[0]'
    ], `${data.societe.codePostal} ${data.societe.ville}`);

    // Acheteur
    const nomCompletAcheteur = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
    fillFieldVariants([
      'acheteur', 'acheteur[0]', 'acheteurNom', 'client',
      'form1[0].page1[0].acheteur[0]', 'form1[0].page1[0].client[0]'
    ], nomCompletAcheteur);

    fillFieldVariants([
      'acheteurAdresse', 'adresseAcheteur', 'clientAdresse',
      'form1[0].page1[0].adresseAcheteur[0]'
    ], data.client.adresse);

    fillFieldVariants([
      'acheteurVille', 'villeAcheteur', 'clientVille',
      'form1[0].page1[0].villeAcheteur[0]'
    ], `${data.client.codePostal} ${data.client.ville}`);

    // Informations facture
    fillFieldVariants([
      'numeroFacture', 'numFacture', 'factureNum',
      'form1[0].page1[0].numeroFacture[0]'
    ], data.vente.numeroFacture || `FAC-${Date.now()}`);

    fillFieldVariants([
      'dateFacture', 'dateVente', 'factureDate',
      'form1[0].page1[0].dateFacture[0]'
    ], formatDateFR(data.vente.dateVente));

    // Véhicule
    fillFieldVariants([
      'vehiculeMarque', 'marque', 'marqueVehicule',
      'form1[0].page1[0].marque[0]'
    ], data.vehicule.marque);

    fillFieldVariants([
      'vehiculeModele', 'modele', 'modeleVehicule',
      'form1[0].page1[0].modele[0]'
    ], data.vehicule.modele);

    fillFieldVariants([
      'immatriculation', 'immat', 'vehiculeImmat',
      'form1[0].page1[0].immatriculation[0]'
    ], data.vehicule.immatriculation);

    fillFieldVariants([
      'vin', 'numeroSerie', 'numeroIdentification',
      'form1[0].page1[0].vin[0]'
    ], data.vehicule.vin);

    fillFieldVariants([
      'kilometrage', 'km', 'kilometrageVehicule',
      'form1[0].page1[0].kilometrage[0]'
    ], `${data.vehicule.kilometrage} km`);

    // Prix
    if (data.vente.prixTTC) {
      fillFieldVariants([
        'prixTTC', 'montantTTC', 'totalTTC', 'prix',
        'form1[0].page1[0].prixTTC[0]', 'form1[0].page1[0].e02_e03[0]',
        'form1[0].page1[0].e07[0]', 'form1[0].page1[0].e08[0]'
      ], formatPrix(data.vente.prixTTC));

      const prixHT = data.vente.prixTTC / 1.20;
      const tva = data.vente.prixTTC - prixHT;
      
      fillFieldVariants([
        'prixHT', 'montantHT', 'totalHT',
        'form1[0].page1[0].prixHT[0]'
      ], formatPrix(prixHT));

      fillFieldVariants([
        'tva', 'montantTVA', 'tvaMarge',
        'form1[0].page1[0].tva[0]'
      ], formatPrix(tva));
    }

    // Mode de paiement
    fillFieldVariants([
      'modePaiement', 'paiement', 'reglement',
      'form1[0].page1[0].modePaiement[0]'
    ], data.vente.modePaiement || '');

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage de la facture PDF:', error);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère la facture avec PDFKit (méthode originale)
 */
function generateFactureWithPDFKit(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // En-tête
    doc.fontSize(20).text('FACTURE DE VENTE', { align: 'center' });
    doc.moveDown();

    // Informations vendeur
    doc.fontSize(12).text('VENDEUR:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.societe.raisonSociale}`);
    doc.text(`SIRET: ${data.societe.siret}`);
    doc.text(`${data.societe.adresse}`);
    doc.text(`${data.societe.codePostal} ${data.societe.ville}`);
    if (data.societe.telephone) doc.text(`Tél: ${data.societe.telephone}`);
    if (data.societe.email) doc.text(`Email: ${data.societe.email}`);
    doc.moveDown();

    // Informations acheteur
    doc.fontSize(12).text('ACHETEUR:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.client.prenom} ${data.client.nom}`);
    doc.text(`${data.client.adresse}`);
    doc.text(`${data.client.codePostal} ${data.client.ville}`);
    doc.moveDown();

    // Détails de la vente
    doc.fontSize(12).text('DÉTAILS DE LA VENTE', { underline: true });
    doc.moveDown(0.5);
    
    const yStart = doc.y;
    doc.fontSize(10);
    doc.text(`Date de vente: ${formatDateFR(data.vente.dateVente)}`);
    doc.text(`Numéro de facture: ${data.vente.numeroFacture || 'AUTO-' + Date.now()}`);
    doc.moveDown();

    // Informations véhicule
    doc.fontSize(12).text('VÉHICULE:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Marque: ${data.vehicule.marque}`);
    doc.text(`Modèle: ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`N° de série (VIN): ${data.vehicule.vin}`);
    doc.text(`Date de première immatriculation: ${data.vehicule.datePremiereImmat}`);
    doc.text(`Kilométrage: ${data.vehicule.kilometrage} km`);
    if (data.vehicule.couleur) doc.text(`Couleur: ${data.vehicule.couleur}`);
    doc.moveDown();

    // Prix
    doc.fontSize(12).text('MONTANT:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    const prixHT = data.vente.prixTTC / 1.20; // TVA 20% sur marge
    const marge = prixHT; // Pour véhicule d'occasion, la marge = prix HT
    const tva = data.vente.prixTTC - prixHT;
    
    doc.text(`Prix de vente TTC: ${formatPrix(data.vente.prixTTC)} €`);
    doc.text(`TVA sur marge (20%): ${formatPrix(tva)} €`);
    doc.text(`Prix HT: ${formatPrix(prixHT)} €`);
    doc.moveDown();

    // Mention légale obligatoire
    doc.fontSize(9).fillColor('red');
    doc.text('* Vente de véhicule d\'occasion - TVA sur marge (Article 297 A du CGI)', { align: 'center' });
    doc.fillColor('black');
    doc.moveDown();

    // Conditions de paiement
    if (data.vente.modePaiement) {
      doc.fontSize(10).text(`Mode de paiement: ${data.vente.modePaiement}`);
      doc.moveDown();
    }

    // Signature
    doc.moveDown(2);
    doc.text('Signature vendeur:', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
    doc.text('Signature acheteur:', 350, doc.y - 20);
    doc.text('___________________', 350, doc.y);

    doc.end();
  });
}

/**
 * Génère le contrat de vente professionnel
 */
function generateContratVente(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Titre
    doc.fontSize(18).text('CONTRAT DE VENTE DE VÉHICULE D\'OCCASION', { align: 'center' });
    doc.moveDown();

    // Parties
    doc.fontSize(12).text('ENTRE LES SOUSSIGNÉS:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Le VENDEUR:');
    doc.text(`${data.societe.raisonSociale}, SIRET ${data.societe.siret}`);
    doc.text(`${data.societe.adresse}, ${data.societe.codePostal} ${data.societe.ville}`);
    doc.moveDown();
    doc.text('L\'ACHETEUR:');
    doc.text(`${data.client.prenom} ${data.client.nom}`);
    doc.text(`${data.client.adresse}, ${data.client.codePostal} ${data.client.ville}`);
    doc.moveDown(2);

    // Article 1 - Objet
    doc.fontSize(11).text('ARTICLE 1 - OBJET', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Le présent contrat a pour objet la vente du véhicule suivant:`);
    doc.moveDown(0.3);
    doc.text(`Marque: ${data.vehicule.marque}`);
    doc.text(`Modèle: ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`N° de série (VIN): ${data.vehicule.vin}`);
    doc.text(`Date de première immatriculation: ${data.vehicule.datePremiereImmat}`);
    doc.text(`Kilométrage déclaré: ${data.vehicule.kilometrage} km`);
    doc.moveDown();

    // Article 2 - Prix
    doc.fontSize(11).text('ARTICLE 2 - PRIX', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Le prix de vente est fixé à la somme de ${formatPrix(data.vente.prixTTC)} € TTC.`);
    doc.text(`Paiement: ${data.vente.modePaiement || 'Non spécifié'}`);
    doc.moveDown();

    // Article 3 - Essai
    doc.fontSize(11).text('ARTICLE 3 - ESSAI PRÉALABLE', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('L\'acheteur reconnaît avoir effectué un essai préalable du véhicule et avoir');
    doc.text('constaté son état. Il accepte le véhicule en l\'état, avec les usures normales');
    doc.text('liées à son âge et à son kilométrage.');
    doc.moveDown();

    // Article 4 - Garanties
    doc.fontSize(11).text('ARTICLE 4 - GARANTIES', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Le véhicule bénéficie de la garantie légale de conformité de 12 mois');
    doc.text('(articles L. 217-4 à L. 217-14 du Code de la consommation).');
    doc.text('En complément, une garantie commerciale de 3 mois est accordée (voir');
    doc.text('contrat de garantie séparé).');
    doc.moveDown();

    // Article 5 - Livraison
    doc.fontSize(11).text('ARTICLE 5 - LIVRAISON', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Date de livraison: ${formatDateFR(data.vente.dateVente)}`);
    doc.text('La livraison s\'effectue au siège du vendeur ou au lieu convenu.');
    doc.moveDown();

    // Article 6 - Transfert de propriété
    doc.fontSize(11).text('ARTICLE 6 - TRANSFERT DE PROPRIÉTÉ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Le transfert de propriété s\'effectue à la livraison du véhicule.');
    doc.text('L\'acheteur s\'engage à effectuer le transfert de la carte grise dans les');
    doc.text('délais légaux.');
    doc.moveDown();

    // Signatures
    doc.moveDown(2);
    doc.text('Fait en double exemplaire,', { align: 'center' });
    doc.text(`le ${formatDateFR(data.vente.dateVente)}`, { align: 'center' });
    doc.moveDown(2);
    
    doc.text('Le Vendeur', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
    doc.text(`${data.societe.raisonSociale}`, 50, doc.y + 40);
    
    doc.text('L\'Acheteur', 350, doc.y - 60);
    doc.text('___________________', 350, doc.y - 40);
    doc.text(`${data.client.prenom} ${data.client.nom}`, 350, doc.y - 20);

    doc.end();
  });
}

/**
 * Génère le contrat de garantie commerciale 3 mois
 * Utilise un PDF remplissable si présent dans le dossier, sinon génère avec PDFKit
 */
async function generateContratGarantie(data) {
  // Chercher un fichier PDF de garantie dans le dossier CERFA
  const garantiePatterns = ['garantie', 'warranty', 'garant', 'warr'];
  let garantiePath = null;
  
  try {
    const cerfaFiles = fs.readdirSync(CERFA_DIR);
    for (const file of cerfaFiles) {
      if (file.toLowerCase().endsWith('.pdf') && !file.startsWith('.')) {
        const fileLower = file.toLowerCase();
        if (garantiePatterns.some(pattern => fileLower.includes(pattern))) {
          garantiePath = path.join(CERFA_DIR, file);
          break;
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors de la recherche du fichier garantie:', error);
  }

  // Si un fichier PDF remplissable est trouvé, l'utiliser
  if (garantiePath && fs.existsSync(garantiePath)) {
    return await generateGarantieFromPDF(garantiePath, data);
  }

  // Sinon, générer avec PDFKit (méthode originale)
  return generateGarantieWithPDFKit(data);
}

/**
 * Remplit un PDF de garantie remplissable
 */
async function generateGarantieFromPDF(garantiePath, data) {
  const existingPdfBytes = fs.readFileSync(garantiePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    const fillField = (fieldName, value) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value) {
          field.setText(String(value));
          return true;
        }
      } catch (e) {
        // Champ non trouvé
      }
      return false;
    };

    const fillFieldVariants = (variants, value) => {
      for (const variant of variants) {
        if (fillField(variant, value)) {
          return true;
        }
      }
      return false;
    };

    // Remplir les champs de la garantie
    // Bénéficiaire (client)
    const nomCompletClient = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
    fillFieldVariants([
      'beneficiaire', 'beneficiaire[0]', 'client', 'acheteur',
      'form1[0].page1[0].beneficiaire[0]', 'form1[0].page1[0].client[0]'
    ], nomCompletClient);

    fillFieldVariants([
      'beneficiaireAdresse', 'adresseBeneficiaire', 'clientAdresse',
      'form1[0].page1[0].adresseBeneficiaire[0]'
    ], data.client.adresse);

    fillFieldVariants([
      'beneficiaireVille', 'villeBeneficiaire', 'clientVille',
      'form1[0].page1[0].villeBeneficiaire[0]'
    ], `${data.client.codePostal} ${data.client.ville}`);

    // Vendeur
    fillFieldVariants([
      'vendeur', 'vendeur[0]', 'garant', 'garantiePar',
      'form1[0].page1[0].vendeur[0]'
    ], data.societe.raisonSociale);

    fillFieldVariants([
      'vendeurSIRET', 'siret', 'siretVendeur',
      'form1[0].page1[0].siret[0]'
    ], data.societe.siret);

    // Véhicule garanti
    fillFieldVariants([
      'vehicule', 'vehiculeGaranti', 'marqueModele',
      'form1[0].page1[0].vehicule[0]'
    ], `${data.vehicule.marque} ${data.vehicule.modele}`);

    fillFieldVariants([
      'immatriculation', 'immat', 'vehiculeImmat',
      'form1[0].page1[0].immatriculation[0]'
    ], data.vehicule.immatriculation);

    fillFieldVariants([
      'vin', 'numeroSerie', 'numeroIdentification',
      'form1[0].page1[0].vin[0]'
    ], data.vehicule.vin);

    fillFieldVariants([
      'kilometrage', 'km', 'kilometrageVehicule',
      'form1[0].page1[0].kilometrage[0]'
    ], `${data.vehicule.kilometrage} km`);

    // Durée de garantie
    fillFieldVariants([
      'duree', 'dureeGarantie', 'periode',
      'form1[0].page1[0].duree[0]'
    ], '3 mois');

    // Date de début
    if (data.vente.dateVente) {
      fillFieldVariants([
        'dateDebut', 'dateLivraison', 'dateGarantie',
        'form1[0].page1[0].dateDebut[0]'
      ], formatDateFR(data.vente.dateVente));
    }

    // Date de fin (3 mois après)
    if (data.vente.dateVente) {
      try {
        const dateDebut = new Date(data.vente.dateVente);
        const dateFin = new Date(dateDebut);
        dateFin.setMonth(dateFin.getMonth() + 3);
        fillFieldVariants([
          'dateFin', 'dateExpiration', 'dateFinGarantie',
          'form1[0].page1[0].dateFin[0]'
        ], formatDateFR(dateFin.toISOString()));
      } catch (e) {
        console.warn('Erreur calcul date fin garantie:', e);
      }
    }

    // Flatten seulement si l'option editable n'est pas activée
    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage de la garantie PDF:', error);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Génère le contrat de garantie avec PDFKit (méthode originale)
 */
function generateGarantieWithPDFKit(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(18).text('CONTRAT DE GARANTIE COMMERCIALE', { align: 'center' });
    doc.fontSize(14).text('3 MOIS', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text('Le présent contrat de garantie commerciale est accordé en complément de');
    doc.text('la garantie légale de conformité obligatoire (12 mois).');
    doc.moveDown();

    doc.fontSize(12).text('BÉNÉFICIAIRE:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.client.prenom} ${data.client.nom}`);
    doc.text(`${data.client.adresse}, ${data.client.codePostal} ${data.client.ville}`);
    doc.moveDown();

    doc.fontSize(12).text('VÉHICULE GARANTI:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.vehicule.marque} ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`VIN: ${data.vehicule.vin}`);
    doc.moveDown();

    doc.fontSize(12).text('DURÉE:', { underline: true });
    doc.fontSize(10);
    doc.text(`3 mois à compter de la date de livraison: ${formatDateFR(data.vente.dateVente)}`);
    doc.moveDown();

    doc.fontSize(12).text('ÉLÉMENTS COUVERTS:', { underline: true });
    doc.fontSize(10);
    doc.text('• Moteur (bloc, pistons, vilebrequin, arbre à cames)');
    doc.text('• Boîte de vitesses et transmission');
    doc.text('• Pont arrière et différentiel');
    doc.text('• Organes de direction et suspension');
    doc.text('• Système de freinage (plaquettes et disques exclus)');
    doc.text('• Alternateur et démarreur');
    doc.moveDown();

    doc.fontSize(12).text('ÉLÉMENTS EXCLUS:', { underline: true });
    doc.fontSize(10);
    doc.text('• Usure normale (pneus, plaquettes, disques, filtres, courroies)');
    doc.text('• Consommables (huile, liquides, ampoules)');
    doc.text('• Carrosserie et peinture');
    doc.text('• Équipements intérieurs (sièges, moquette, sellerie)');
    doc.text('• Dommages dus à un mauvais usage ou à un défaut d\'entretien');
    doc.text('• Réparations effectuées sans autorisation');
    doc.moveDown();

    doc.fontSize(12).text('CONDITIONS:', { underline: true });
    doc.fontSize(10);
    doc.text('• Le véhicule doit être entretenu selon les préconisations constructeur');
    doc.text('• Toute réparation doit être effectuée par un professionnel agréé');
    doc.text('• Présentation du présent contrat obligatoire pour toute réclamation');
    doc.moveDown();

    doc.moveDown();
    doc.text(`Fait le ${formatDateFR(data.vente.dateVente)}`, { align: 'center' });
    doc.moveDown(2);
    
    doc.text('Le Vendeur', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
    doc.text(`${data.societe.raisonSociale}`, 50, doc.y + 40);

    doc.end();
  });
}

/**
 * Génère la notice d'information sur les garanties légales
 * OBLIGATOIRE selon la DGCCRF
 */
function generateNoticeGaranties(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(16).text('NOTICE D\'INFORMATION', { align: 'center' });
    doc.fontSize(14).text('GARANTIES LÉGALES', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text('Conformément à la réglementation en vigueur (Code de la consommation),');
    doc.text('vous bénéficiez de garanties légales obligatoires lors de l\'achat d\'un');
    doc.text('véhicule d\'occasion auprès d\'un professionnel.');
    doc.moveDown();

    doc.fontSize(12).text('1. GARANTIE LÉGALE DE CONFORMITÉ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Durée: 12 mois à compter de la livraison du véhicule.');
    doc.moveDown(0.3);
    doc.text('Le vendeur professionnel est tenu de livrer un bien conforme au contrat.');
    doc.text('Le véhicule est réputé conforme s\'il:');
    doc.text('• Correspond à la description donnée par le vendeur');
    doc.text('• Est propre à l\'usage attendu d\'un véhicule similaire');
    doc.text('• Présente les qualités que vous êtes en droit d\'attendre');
    doc.moveDown();

    doc.fontSize(12).text('2. DÉFAUT DE CONFORMITÉ', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('En cas de défaut de conformité, vous pouvez:');
    doc.text('• Exiger la réparation ou le remplacement du véhicule (sans frais)');
    doc.text('• Demander une réduction du prix');
    doc.text('• Résilier le contrat et obtenir le remboursement');
    doc.moveDown();

    doc.fontSize(12).text('3. GARANTIE DES VICES CACHÉS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('Le vendeur est également tenu de garantir les vices cachés qui rendent');
    doc.text('le véhicule impropre à sa destination ou diminuent tellement son usage');
    doc.text('que l\'acheteur ne l\'aurait pas acquis ou l\'aurait acquis à un moindre prix.');
    doc.text('Délai: 2 ans à compter de la découverte du vice.');
    doc.moveDown();

    doc.fontSize(12).text('4. RECOURS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text('En cas de litige, vous pouvez:');
    doc.text('• Contacter le service client du vendeur');
    doc.text('• Faire appel à un médiateur de la consommation');
    doc.text('• Saisir les tribunaux compétents');
    doc.moveDown();

    doc.fontSize(9).fillColor('red');
    doc.text('Cette notice est obligatoire et doit vous être remise lors de la vente.', { align: 'center' });
    doc.fillColor('black');

    doc.end();
  });
}

/**
 * Génère le procès-verbal de livraison
 */
function generatePVLivraison(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(18).text('PROCÈS-VERBAL DE LIVRAISON', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Date de livraison: ${formatDateFR(data.vente.dateVente)}`);
    doc.moveDown();

    doc.fontSize(12).text('VÉHICULE LIVRÉ:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.vehicule.marque} ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`VIN: ${data.vehicule.vin}`);
    doc.text(`Kilométrage: ${data.vehicule.kilometrage} km`);
    doc.moveDown();

    doc.fontSize(12).text('ÉTAT DU VÉHICULE:', { underline: true });
    doc.fontSize(10);
    doc.text('Le véhicule est livré avec les équipements suivants:');
    doc.text('☐ Clés de contact');
    doc.text('☐ Carte grise');
    doc.text('☐ Carnet d\'entretien');
    doc.text('☐ Double des clés');
    doc.text('☐ Kit de sécurité');
    doc.moveDown();

    doc.text('État extérieur:');
    doc.text('☐ Excellent');
    doc.text('☐ Bon');
    doc.text('☐ Moyen');
    doc.text('☐ À noter: ________________________________');
    doc.moveDown();

    doc.text('État intérieur:');
    doc.text('☐ Excellent');
    doc.text('☐ Bon');
    doc.text('☐ Moyen');
    doc.text('☐ À noter: ________________________________');
    doc.moveDown();

    doc.fontSize(12).text('RÉCEPTION:', { underline: true });
    doc.fontSize(10);
    doc.text('Je soussigné(e) reconnais avoir reçu le véhicule décrit ci-dessus');
    doc.text('en bon état de fonctionnement et conforme à la commande.');
    doc.moveDown(2);

    doc.text('Signature du vendeur:', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
    doc.text(`${data.societe.raisonSociale}`, 50, doc.y + 40);
    
    doc.text('Signature de l\'acheteur:', 350, doc.y - 60);
    doc.text('___________________', 350, doc.y - 40);
    doc.text(`${data.client.prenom} ${data.client.nom}`, 350, doc.y - 20);

    doc.end();
  });
}

/**
 * Utilitaires
 */
function formatDateFR(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPrix(prix) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prix);
}

