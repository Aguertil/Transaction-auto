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

/** Parse une date (YYYY-MM-DD ou ISO) ; retourne null si invalide */
function parseDateParts(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return {
    jour: String(date.getDate()).padStart(2, '0'),
    mois: String(date.getMonth() + 1).padStart(2, '0'),
    annee: String(date.getFullYear())
  };
}

/** Format JJ/MM/AAAA (formulaires français) */
function formatDateDdMmYyyy(dateString) {
  const p = parseDateParts(dateString);
  if (!p) return '';
  return `${p.jour}/${p.mois}/${p.annee}`;
}

/** JJMMAAAA sur 8 caractères (cases date compactes type CERFA 13750) */
function formatDateDdMmYyyyCompact(dateString) {
  const p = parseDateParts(dateString);
  if (!p) return '';
  return `${p.jour}${p.mois}${p.annee}`;
}

/** Département approximatif à partir du code postal (FR) */
function departementFromCodePostal(cp) {
  if (!cp) return '';
  const c = String(cp).replace(/\s/g, '');
  if (c.length < 2) return '';
  if (c.startsWith('97') || c.startsWith('98')) return c.slice(0, 3);
  return c.slice(0, 2);
}

/**
 * Décompose une adresse française en n° / type de voie / nom de voie.
 */
function parseAdresseFrancaise(adresse) {
  const raw = String(adresse || '').trim();
  if (!raw) return { numero: '', typeVoie: '', nomVoie: '' };

  const types =
    'rue|avenue|av\\.?|boulevard|bd\\.?|all[ée]e|impasse|chemin|place|cours|route|quai|passage|square|sente|venelle|lotissement|résidence|residence|voie|traverse|mont[ée]e|cote|côte';
  const re = new RegExp(
    `^(?:(\\d+[\\w]?))?\\s*(?:(bis|ter|quater)\\s+)?(${types})\\s+(.+)$`,
    'i'
  );
  const m = raw.match(re);
  if (m) {
    return {
      numero: (m[1] || '').trim(),
      typeVoie: (m[3] || '').replace(/\.$/, '').trim(),
      nomVoie: [m[2], m[4]].filter(Boolean).join(' ').trim()
    };
  }

  const numOnly = raw.match(/^(\d+[\w]?)\s+(.+)$/);
  if (numOnly) {
    return { numero: numOnly[1], typeVoie: '', nomVoie: numOnly[2].trim() };
  }

  return { numero: '', typeVoie: '', nomVoie: raw };
}

/** Âge du véhicule en jours entre 1ère mise en circulation et livraison */
function ageVehiculeJours(datePremiereImmat, dateLivraison) {
  const a = parseDateParts(datePremiereImmat);
  const b = parseDateParts(dateLivraison);
  if (!a || !b) return '';
  const d1 = new Date(`${a.annee}-${a.mois}-${a.jour}`);
  const d2 = new Date(`${b.annee}-${b.mois}-${b.jour}`);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? String(diff) : '';
}

/** Date du jour en YYYY-MM-DD (fuseau local) */
function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Date de signature : explicite, sinon date de vente, sinon aujourd'hui */
function getDateSignature(data) {
  return data?.vente?.dateSignature || data?.vente?.dateVente || todayLocalISO();
}

/** Lieu de signature : géoloc / saisie, sinon ville société, sinon ville client */
function getLieuSignature(data) {
  return (
    data?.vente?.lieuSignature ||
    data?.societe?.ville ||
    data?.client?.ville ||
    ''
  );
}

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
    { name: '06-Proces-Verbal-Livraison.pdf', type: 'pv-livraison', label: 'Procès-verbal de livraison' },
    { name: '08-Bon-de-Commande.pdf', type: 'bdc-mb', label: 'Bon de commande' }
  ];

  // Détection automatique de tous les PDF remplissables présents dans le dossier
  try {
    const cerfaFiles = fs.readdirSync(CERFA_DIR);
    console.log(`📁 Fichiers trouvés dans ${CERFA_DIR}:`, cerfaFiles.filter(f => f.toLowerCase().endsWith('.pdf')));
    
    const cerfaPatterns = [
      { pattern: /cerfa[-_]13750/i, name: '07-Formulaire-Immatriculation-CERFA-13750.pdf', type: 'cerfa-13750', label: 'Formulaire immatriculation (CERFA 13750)' },
      { pattern: /cerfa[-_]13757/i, name: '00-Mandat-Immatriculation-CERFA-13757.pdf', type: 'cerfa-mandat', label: 'Mandat immatriculation (CERFA 13757)' },
      { pattern: /cerfa[-_]15776/i, name: '01-Certificat-Cession-CERFA-15776.pdf', type: 'cerfa-cession', label: 'Certificat de cession (CERFA 15776)' },
      { pattern: /1993[-_]?part[-_]?d|quitus/i, name: '09-Quitus-Fiscal-1993-PART-D.pdf', type: 'quitus-fiscal', label: 'Quitus fiscal (1993-PART-D)' },
      { pattern: /facture|invoice/i, name: '02-Facture-Vente.pdf', type: 'facture', label: 'Facture de vente (PDF remplissable)' },
      { pattern: /garantie.*commerciale|warranty/i, name: '04-Contrat-Garantie-3mois.pdf', type: 'garantie', label: 'Contrat de garantie 3 mois (PDF remplissable)' }
    ];

    for (const cerfaFile of cerfaFiles) {
      // Ignorer les fichiers de test
      if (cerfaFile.toLowerCase().includes('test') || cerfaFile.toLowerCase().includes('mapping')) {
        console.log(`⏭️  Fichier de test ignoré: ${cerfaFile}`);
        continue;
      }
      
      if (cerfaFile.toLowerCase().endsWith('.pdf') && !cerfaFile.startsWith('.')) {
        for (const pattern of cerfaPatterns) {
          if (pattern.pattern.test(cerfaFile)) {
            // Vérifier si le document n'est pas déjà dans la liste
            const alreadyAdded = allDocuments.some(doc => doc.type === pattern.type);
            if (!alreadyAdded) {
              console.log(`✅ Document détecté: ${pattern.type} (${cerfaFile})`);
              allDocuments.push({ name: pattern.name, type: pattern.type, label: pattern.label });
            } else {
              console.log(`⚠️  Document ${pattern.type} déjà dans la liste`);
            }
            break;
          }
        }
      }
    }
    
    console.log(`📋 Total documents disponibles: ${allDocuments.length}`);
    console.log(`   Types:`, allDocuments.map(d => d.type).join(', '));
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

  console.log(`📝 Documents sélectionnés par l'utilisateur:`, data.options?.selectedDocuments || 'tous');
  console.log(`📦 Documents à générer: ${selectedDocuments.length} sur ${allDocuments.length} disponibles`);
  console.log(`   Types sélectionnés:`, selectedDocuments.map(d => d.type).join(', '));

  const documents = selectedDocuments;

  // Génération de chaque document
  console.log(`📄 Génération de ${documents.length} document(s) sélectionné(s):`, documents.map(d => d.type).join(', '));
  
  for (const doc of documents) {
    try {
      console.log(`🔄 Génération de ${doc.name} (${doc.type})...`);
      const pdfBuffer = await generateSingleDocument(doc.type, data);
      archive.append(pdfBuffer, { name: doc.name });
      console.log(`✅ ${doc.name} généré avec succès`);
    } catch (error) {
      console.error(`❌ Erreur génération ${doc.name} (${doc.type}):`, error.message);
      console.error(`   Stack:`, error.stack);
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
    case 'quitus-fiscal':
      return await generateQuitusFiscal(data);
    default:
      throw new Error(`Type de document inconnu: ${type}`);
  }
}

/**
 * Remplit un champ texte Acrobat s'il existe.
 */
function fillPdfText(form, fieldName, value, maxLen) {
  try {
    if (value === undefined || value === null) return false;
    let s = String(value).trim();
    if (!s) return false;
    if (maxLen != null && s.length > maxLen) s = s.slice(0, maxLen);
    form.getTextField(fieldName).setText(s);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remplit les champs date Jour / Mois / Année d'un préfixe Acrobat.
 */
function fillPdfDateParts(form, pagePrefix, baseName, dateString) {
  const parts = parseDateParts(dateString);
  if (!parts) return;
  fillPdfText(form, `${pagePrefix}.${baseName}Jour[0]`, parts.jour, 2);
  fillPdfText(form, `${pagePrefix}.${baseName}Mois[0]`, parts.mois, 2);
  fillPdfText(form, `${pagePrefix}.${baseName}Année[0]`, parts.annee, 4);
}

/**
 * Remplit les champs naissance acheteur J / M / A (CERFA 15776).
 */
function fillPdfBirthParts(form, pagePrefix, dateString) {
  const parts = parseDateParts(dateString);
  if (!parts) return;
  fillPdfText(form, `${pagePrefix}.num_DateNaissanceAcheteurJ[0]`, parts.jour, 2);
  fillPdfText(form, `${pagePrefix}.num_DateNaissanceAcheteurM[0]`, parts.mois, 2);
  fillPdfText(form, `${pagePrefix}.num_DateNaissanceAcheteurA[0]`, parts.annee, 4);
}

/**
 * Remplit une page (1 ou 2) du certificat de cession CERFA 15776*01.
 */
function fillCerfaCessionPage(form, pageIndex, data) {
  const p = `topmostSubform[0].Page${pageIndex}[0]`;
  const vehicule = data.vehicule || {};
  const societe = data.societe || {};
  const client = data.client || {};
  const vente = data.vente || {};

  fillPdfText(form, `${p}.num_Immatriculation[0]`, vehicule.immatriculation);
  fillPdfText(form, `${p}.num_Identification[0]`, vehicule.vin, 17);
  if (vehicule.datePremiereImmat) {
    fillPdfDateParts(form, p, 'num_DateImmatriculation', vehicule.datePremiereImmat);
  }
  fillPdfText(form, `${p}.txt_MarqueVéhicule[0]`, vehicule.marque);
  fillPdfText(form, `${p}.txt_TypeVarianteVersionVéhicule[0]`, vehicule.typeVarianteVersion || '');
  fillPdfText(form, `${p}.txt_GenreNational[0]`, vehicule.genreNational || '');
  fillPdfText(
    form,
    `${p}.txt_DénominationCommerciale[0]`,
    vehicule.denominationCommerciale || vehicule.modele
  );
  fillPdfText(form, `${p}.num_KilométrageCompteur[0]`, vehicule.kilometrage);

  fillPdfText(form, `${p}.txt_IdentitéVendeur[0]`, societe.raisonSociale);
  fillPdfText(form, `${p}.Num_Siret[0]`, societe.siret, 14);
  fillPdfText(form, `${p}.txt_NomVoie[0]`, societe.adresse);
  fillPdfText(form, `${p}.txt_CommuneAdresse[0]`, societe.ville);
  fillPdfText(form, `${p}.num_CodePostalAdresse[0]`, societe.codePostal, 5);

  const nomCompletAcheteur = `${client.prenom || ''} ${client.nom || ''}`.trim();
  fillPdfText(form, `${p}.txt_IdentitéAcheteur[0]`, nomCompletAcheteur);
  fillPdfText(form, `${p}.txt_NomVoieAdresseAcheteur[0]`, client.adresse);
  fillPdfText(form, `${p}.txt_CommuneAdresseAcheteur[0]`, client.ville);
  fillPdfText(form, `${p}.num_CodePostalAdresseAcheteur[0]`, client.codePostal, 5);
  fillPdfText(form, `${p}.txt_LieuNaissanceAcheteur[0]`, client.lieuNaissance);
  fillPdfBirthParts(form, p, client.dateNaissance);

  if (vente.dateVente) {
    fillPdfDateParts(form, p, 'num_DateVente', vente.dateVente);
  }

  // Heure de vente (HH:MM → cases HH / MM)
  const heure = String(vente.heure || vente.horaire || '').trim();
  const heureMatch = heure.match(/^(\d{1,2})[:hH]?(\d{2})?$/);
  if (heureMatch) {
    fillPdfText(form, `${p}.num_HoraireVente1[0]`, String(heureMatch[1]).padStart(2, '0'), 2);
    fillPdfText(form, `${p}.num_HoraireVente2[0]`, String(heureMatch[2] || '00').padStart(2, '0'), 2);
  }

  const lieu = getLieuSignature({ societe, client, vente });
  const dateSignature = getDateSignature({ vente });
  fillPdfText(form, `${p}.txt_LieuDéclaration1[0]`, lieu);
  fillPdfText(form, `${p}.txt_LieuDéclaration2[0]`, lieu);
  const dateDecl = formatDateDdMmYyyy(dateSignature);
  fillPdfText(form, `${p}.num_DateDéclaration[0]`, dateDecl);
  fillPdfText(form, `${p}.txt_dateDéclaration[0]`, dateDecl);
}

/**
 * Génère le CERFA 15776*01 - Certificat de cession (acte de vente)
 * Utilise le PDF officiel joint (topmostSubform Acrobat).
 */
async function generateCerfaCession(data) {
  let cerfaPath = findCerfaFile('cerfa_15776_01.pdf');
  if (!cerfaPath) {
    cerfaPath = findCerfaFile('cerfa_15776-01.pdf');
  }
  if (!cerfaPath) {
    cerfaPath = findCerfaFile('cerfa_15776_02.pdf');
  }

  if (!cerfaPath) {
    throw new Error(`Fichier CERFA 15776 non trouvé. Placez-le dans: ${CERFA_DIR}`);
  }

  console.log(`✅ CERFA cession: ${cerfaPath}`);
  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  try {
    fillCerfaCessionPage(form, 1, data);
    fillCerfaCessionPage(form, 2, data);

    if (!data.options?.editable) {
      form.flatten();
    }
  } catch (error) {
    console.error('Erreur lors du remplissage du CERFA cession:', error);
  }

  const pdfBytes = await pdfDoc.save({ updateFieldAppearances: true });
  return Buffer.from(pdfBytes);
}

/**
 * Génère le CERFA 13757*03 - Mandat d'immatriculation
 * Mapping basé sur le PDF officiel joint (topmostSubform Acrobat).
 * Mandant = acheteur | Mandataire = société vendeur / professionnel.
 */
async function generateCerfaMandat(data) {
  console.log(`🔍 Recherche du fichier CERFA 13757...`);
  let cerfaPath = findCerfaFile('cerfa_13757_03.pdf');
  if (!cerfaPath) {
    cerfaPath = findCerfaFile('cerfa_13757-03.pdf');
  }

  if (!cerfaPath) {
    console.error(`❌ Fichier CERFA 13757*03 non trouvé dans ${CERFA_DIR}`);
    throw new Error(
      `Fichier CERFA 13757*03 non trouvé. Placez-le dans: ${CERFA_DIR} (nom: cerfa_13757_03.pdf ou cerfa_13757-03.pdf)`
    );
  }

  console.log(`✅ Fichier CERFA 13757 trouvé: ${cerfaPath}`);

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  try {
    const p = 'topmostSubform[0].Page1[0]';
    const client = data.client || {};
    const societe = data.societe || {};
    const vehicule = data.vehicule || {};
    const vente = data.vente || {};

    const identiteMandant = `${client.prenom || ''} ${client.nom || ''}`.trim();
    const identiteMandataire = societe.raisonSociale || '';
    const marqueModele = `${vehicule.marque || ''} ${vehicule.modele || ''}`.trim();
    const natureOperation =
      vente.natureOperation ||
      data.options?.natureOperation ||
      'Changement de titulaire';

    // Mandant (acheteur)
    fillPdfText(form, `${p}.txt_IdentitéMandant[0]`, identiteMandant);
    fillPdfText(form, `${p}.num_SIRETMandant[0]`, client.siret, 14);
    fillPdfText(form, `${p}.txt_NomVoieAdresse[0]`, client.adresse);
    fillPdfText(form, `${p}.num_CodePostalAdresse[0]`, client.codePostal, 5);
    fillPdfText(form, `${p}.txt_CommuneAdresse[0]`, client.ville);
    fillPdfText(form, `${p}.txt_PaysAdresse[0]`, client.pays || 'FRANCE');

    // Mandataire (professionnel)
    fillPdfText(form, `${p}.txt_IdentitéMandataire[0]`, identiteMandataire);
    fillPdfText(form, `${p}.num_SIRETMandataire[0]`, societe.siret, 14);

    // Opération & véhicule
    fillPdfText(form, `${p}.txt_NatureOpération[0]`, natureOperation);
    fillPdfText(form, `${p}.txt_MarqueVéhicule[0]`, marqueModele);
    fillPdfText(form, `${p}.txt_MarqueImmatriculation[0]`, vehicule.immatriculation);
    fillPdfText(form, `${p}.txt_NumVinVéhicule[0]`, vehicule.vin, 17);

    // Lieu / date de déclaration (signature)
    const lieu = getLieuSignature(data);
    fillPdfText(form, `${p}.txt_LieuDéclaration[0]`, lieu);
    const dateParts = parseDateParts(getDateSignature(data));
    if (dateParts) {
      fillPdfText(form, `${p}.num_DateJourDéclaration[0]`, dateParts.jour, 2);
      fillPdfText(form, `${p}.num_DateMoisDéclaration[0]`, dateParts.mois, 2);
      fillPdfText(form, `${p}.num_DateAnnéeDéclaration[0]`, dateParts.annee, 4);
    }

    // Case confirmation d'information (souvent attendue)
    try {
      form.getCheckBox(`${p}.ckb_ConfirmationInformation[0]`).check();
    } catch {
      // optionnel
    }

    console.log('✅ Champs du CERFA mandat remplis avec succès');
  } catch (error) {
    console.error('Erreur lors du remplissage du mandat:', error);
  }

  try {
    const pdfBytes = await pdfDoc.save({ updateFieldAppearances: true });
    return Buffer.from(pdfBytes);
  } catch (saveError) {
    console.error('Erreur lors de la sauvegarde du PDF:', saveError.message);
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

/**
 * Génère le formulaire 1993-PART-D — Quitus fiscal
 * (certificat d'acquisition d'un véhicule en provenance de l'UE)
 */
async function generateQuitusFiscal(data) {
  const cerfaPath =
    findCerfaFile('quitus_fiscal_1993_part_d.pdf') ||
    findCerfaFile('1993-part-d.pdf') ||
    findCerfaFile('1993_part_d.pdf');

  if (!cerfaPath) {
    throw new Error(
      `Fichier Quitus fiscal 1993-PART-D non trouvé. Placez-le dans: ${CERFA_DIR}`
    );
  }

  console.log(`✅ Quitus fiscal: ${cerfaPath}`);
  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();

  try {
    const client = data.client || {};
    const societe = data.societe || {};
    const vehicule = data.vehicule || {};
    const vente = data.vente || {};
    // Vendeur UE (étranger) — optionnel ; sinon champs laissés vides
    const vendeurUE = data.vendeurUE || data.vendeurEtranger || {};

    const fill = (name, value, maxLen) => fillPdfText(form, name, value, maxLen);

    // ——— 1. Identité & adresse de l'acquéreur (client) ———
    const nomAcheteur = `${client.prenom || ''} ${client.nom || ''}`.trim() || client.raisonSociale || '';
    fill('a1', nomAcheteur);
    fill('a2', client.telephone);
    fill('a3', client.email);

    const adrClient = parseAdresseFrancaise(client.adresse);
    fill('a4', adrClient.numero);
    fill('a5', adrClient.typeVoie);
    fill('a6', adrClient.nomVoie || client.adresse);
    fill('a7', client.codePostal, 5);
    fill('a8', client.ville);
    fill('a9', client.pays || 'FRANCE');

    // ——— 2. Vendeur domicilié dans un autre État membre UE ———
    fill('a10', vendeurUE.raisonSociale || vendeurUE.nom || '');
    fill('N°TVA', vendeurUE.numeroTVA || vendeurUE.tva || '');
    fill('a11', vendeurUE.telephone || vendeurUE.email || '');

    const adrVendeur = parseAdresseFrancaise(vendeurUE.adresse || '');
    fill('a12', adrVendeur.numero);
    fill('a13', adrVendeur.typeVoie);
    fill('a14', adrVendeur.nomVoie || vendeurUE.adresse || '');
    fill('a15', vendeurUE.codePostal || '', 5);
    fill('a16', vendeurUE.ville || '');
    fill('a17', vendeurUE.pays || '');

    // ——— 3. Caractéristiques techniques du véhicule ———
    fill('a18', vehicule.marque); // A. Marque
    fill('a19', vehicule.modele || vehicule.denominationCommerciale); // B. Modèle
    const age = ageVehiculeJours(
      vehicule.datePremiereImmat,
      vente.dateVente || vente.dateLivraison
    );
    fill('a20', age, 6); // H. Âge en jours
    fill('a21', vehicule.immatriculationEtrangere || vehicule.immatriculation); // D. Immat à l'étranger
    fill('a22', vehicule.vin, 17); // E. VIN
    fill('a23', formatDateDdMmYyyy(vehicule.datePremiereImmat), 10); // F. 1ère mise en circulation
    fill('a24', formatDateDdMmYyyy(vente.dateVente || vente.dateLivraison), 10); // G. Date livraison
    fill('a25', vehicule.kilometrage); // C. Kilométrage

    // ——— 4. Prix d'achat / TVA ———
    const prix = vente.prixTTC || vente.prixHT || vente.montantAcquisition || '';
    const monnaie = vente.monnaie || 'EUR';
    fill('a26', prix != null && prix !== '' ? String(prix) : '');
    try {
      const dropdown = form.getDropdown('ldcm1');
      const options = dropdown.getOptions();
      if (options.includes(monnaie)) {
        dropdown.select(monnaie);
      } else if (options.includes('EUR')) {
        dropdown.select('EUR');
      }
    } catch {
      // ignore
    }
    // Montant converti en euros (si déjà en EUR = même montant)
    const prixEur = vente.prixEuros || (monnaie === 'EUR' ? prix : '');
    fill('a27', prixEur != null && prixEur !== '' ? String(prixEur) : '', 11);

    // TVA à payer : explicite, ou 20 % si véhicule taxable (neuf / < 6 mois / < 6000 km)
    let tva = vente.montantTVA;
    if (tva == null || tva === '') {
      const km = parseInt(String(vehicule.kilometrage || '').replace(/\s/g, ''), 10);
      const ageNum = parseInt(age || '0', 10);
      const taxable =
        vente.tvaDue === true ||
        (!Number.isNaN(km) && km < 6000) ||
        (!Number.isNaN(ageNum) && ageNum < 183);
      if (taxable && prixEur) {
        const base = parseFloat(String(prixEur).replace(',', '.'));
        if (!Number.isNaN(base)) tva = (base * 0.2).toFixed(2);
      }
    }
    fill('a28', tva != null && tva !== '' ? String(tva) : '', 10);

    // ——— 5. Mandataire (professionnel) = société ———
    fill('b1', societe.raisonSociale);
    fill('b2', societe.telephone);
    fill('b3', societe.email);
    // SIREN = 9 premiers chiffres du SIRET
    const siret = String(societe.siret || '').replace(/\s/g, '');
    fill('b4', siret.slice(0, 9) || societe.siren || '', 11);

    const adrSte = parseAdresseFrancaise(societe.adresse);
    fill('b5', adrSte.numero);
    fill('b6', adrSte.typeVoie);
    fill('b7', adrSte.nomVoie || societe.adresse);
    fill('b8', societe.codePostal, 5);
    fill('b9', societe.ville);
    fill('b10', societe.pays || 'FRANCE');

    console.log('✅ Quitus fiscal 1993-PART-D rempli');
  } catch (error) {
    console.error('Erreur remplissage quitus fiscal:', error);
  }

  const pdfBytes = await pdfDoc.save({ updateFieldAppearances: true });
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
      fillCheckbox(`${basePath}.noir[0]`, couleurLower.includes('noir'));
    }

    // Date 1re immatriculation (MEC) : Jour1 / Jour2 / Jour3 (cerfa-13750.pdf)
    const mec = parseDateParts(data.vehicule.datePremiereImmat);
    if (mec) {
      fillField(`${basePath}.Jour1[0]`, mec.jour);
      fillField(`${basePath}.Jour2[0]`, mec.mois);
      fillField(`${basePath}.Jour3[0]`, mec.annee);
    }

    // Naissance titulaire : Jour4 limité à 8 car. → JJMMAAAA sans séparateurs
    const n = parseDateParts(data.client.dateNaissance);
    if (n) {
      fillField(`${basePath}.Jour4[0]`, formatDateDdMmYyyyCompact(data.client.dateNaissance));
    }
    fillField(`${basePath}.CityName1[0]`, (data.client.lieuNaissance || '').trim());

    // Titulaire (personne physique) — champs anglais du formulaire officiel
    fillField(`${basePath}.Name[0]`, (data.client.prenom || '').trim());
    fillField(`${basePath}.FamilyName[0]`, (data.client.nom || '').trim());
    fillField(`${basePath}.StreetName[0]`, (data.client.adresse || '').trim());
    fillField(`${basePath}.Postcode[0]`, (data.client.codePostal || '').trim());
    fillField(`${basePath}.CityName2[0]`, (data.client.ville || '').trim());
    fillField(`${basePath}.DPT[0]`, departementFromCodePostal(data.client.codePostal));
    fillField(`${basePath}.telPorTitulaire[0]`, (data.client.telephone || '').trim());
    fillField(`${basePath}.mailTitulaire[0]`, (data.client.email || '').trim());

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
 * Génère un Bon de commande professionnel (PDF créé par l'application).
 */
function generateBDCMB(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const societe = data.societe || {};
    const client = data.client || {};
    const vehicule = data.vehicule || {};
    const vente = data.vente || {};
    const dateSig = formatDateFR(getDateSignature(data));
    const lieuSig = getLieuSignature(data);
    const numero =
      vente.numeroBonCommande ||
      vente.numeroFacture ||
      `BDC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const drawLine = () => {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.6);
      doc.fillColor('#000000');
    };

    // En-tête
    doc.fontSize(18).fillColor('#1a365d').text('BON DE COMMANDE', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666666').text(`N° ${numero}`, { align: 'center' });
    doc.moveDown(0.2);
    doc.text(`Date : ${formatDateFR(vente.dateVente || getDateSignature(data))}`, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.8);
    drawLine();

    // Vendeur
    doc.fontSize(12).fillColor('#1a365d').text('VENDEUR', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#000000');
    doc.text(societe.raisonSociale || '');
    if (societe.siret) doc.text(`SIRET : ${societe.siret}`);
    doc.text(`${societe.adresse || ''}`);
    doc.text(`${societe.codePostal || ''} ${societe.ville || ''}`.trim());
    if (societe.telephone) doc.text(`Tél. : ${societe.telephone}`);
    if (societe.email) doc.text(`Email : ${societe.email}`);
    doc.moveDown(0.7);

    // Acheteur
    doc.fontSize(12).fillColor('#1a365d').text('ACHETEUR', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#000000');
    doc.text(`${client.prenom || ''} ${client.nom || ''}`.trim());
    doc.text(`${client.adresse || ''}`);
    doc.text(`${client.codePostal || ''} ${client.ville || ''}`.trim());
    if (client.telephone) doc.text(`Tél. : ${client.telephone}`);
    if (client.email) doc.text(`Email : ${client.email}`);
    if (client.dateNaissance) {
      doc.text(
        `Né(e) le ${formatDateFR(client.dateNaissance)}${client.lieuNaissance ? ` à ${client.lieuNaissance}` : ''}`
      );
    }
    doc.moveDown(0.7);
    drawLine();

    // Véhicule
    doc.fontSize(12).fillColor('#1a365d').text('VÉHICULE COMMANDÉ', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor('#000000');

    const rows = [
      ['Marque', vehicule.marque],
      ['Modèle / Dénomination', vehicule.denominationCommerciale || vehicule.modele],
      ['Immatriculation', vehicule.immatriculation],
      ['N° VIN', vehicule.vin],
      ['1ère mise en circulation', formatDateFR(vehicule.datePremiereImmat)],
      ['Kilométrage', vehicule.kilometrage ? `${vehicule.kilometrage} km` : ''],
      ['Couleur', vehicule.couleur],
      ['Genre national', vehicule.genreNational]
    ];

    rows.forEach(([label, value]) => {
      if (!value) return;
      doc.text(`${label} : `, { continued: true, underline: false });
      doc.font('Helvetica-Bold').text(String(value));
      doc.font('Helvetica');
    });

    doc.moveDown(0.7);
    drawLine();

    // Prix
    doc.fontSize(12).fillColor('#1a365d').text('CONDITIONS FINANCIÈRES', { underline: true });
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor('#000000');
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Prix TTC : ${formatPrix(vente.prixTTC)} €`);
    doc.font('Helvetica').fontSize(10);
    doc.moveDown(0.3);
    doc.text(`Mode de paiement : ${vente.modePaiement || 'Non précisé'}`);
    doc.text(
      'Régime particulier des biens d\'occasion — TVA sur marge (art. 297 A du CGI), non déductible par l\'acquéreur.'
    );
    doc.moveDown(0.7);

    // Mentions
    doc.fontSize(12).fillColor('#1a365d').text('MENTIONS', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#000000');
    doc.text(
      'Le présent bon de commande engage l\'acheteur dès signature. Le véhicule est vendu en l\'état, ' +
        'compte tenu de son âge et de son kilométrage. L\'acheteur déclare avoir pris connaissance de ' +
        'l\'état du véhicule et des documents remis. La livraison et le transfert de propriété ' +
        'interviennent selon les modalités convenues entre les parties.'
    );
    doc.moveDown(1);

    // Signature
    doc.fontSize(10);
    doc.text(
      lieuSig ? `Fait à ${lieuSig}, le ${dateSig}` : `Fait le ${dateSig}`,
      { align: 'center' }
    );
    doc.moveDown(1.5);

    const ySig = doc.y;
    doc.text('Le Vendeur', 50, ySig);
    doc.text('_________________________', 50, ySig + 40);
    doc.fontSize(9).text(societe.raisonSociale || '', 50, ySig + 58);

    doc.fontSize(10).text('L\'Acheteur', 320, ySig);
    doc.text('(lu et approuvé)', 320, ySig + 14);
    doc.text('_________________________', 320, ySig + 40);
    doc.fontSize(9).text(`${client.prenom || ''} ${client.nom || ''}`.trim(), 320, ySig + 58);

    doc.end();
  });
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

    // Détection du type de formulaire basé sur les champs disponibles
    const allFields = form.getFields().map(f => f.getName());
    const hasTextFields = allFields.some(f => f.startsWith('Text'));
    const hasStructuredFields = allFields.some(f => f.includes('form1') || f.includes('vendeur') || f.includes('acheteur'));

    if (hasTextFields) {
      // Nouveau format avec champs Text1, Text2, etc.
      // MAPPING À ADAPTER selon votre PDF Facture.pdf
      // Ce mapping est une estimation - ajustez selon l'ordre réel des champs dans votre PDF
      
      // Vendeur (Text1-Text5)
      fillField('Text1', data.societe.raisonSociale || '');
      fillField('Text2', data.societe.siret || '');
      fillField('Text3', data.societe.adresse || '');
      fillField('Text5', `${data.societe.codePostal || ''} ${data.societe.ville || ''}`.trim());
      
      // Acheteur (Text6-Text10)
      const nomCompletAcheteur = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
      fillField('Text6', nomCompletAcheteur);
      fillField('Text7', data.client.adresse || '');
      fillField('Text8', `${data.client.codePostal || ''} ${data.client.ville || ''}`.trim());
      
      // Informations facture (Text9-Text14)
      fillField('Text9', data.vente.numeroFacture || `FAC-${Date.now()}`);
      fillField('Text10', formatDateFR(data.vente.dateVente));
      
      // Véhicule et prix (Text11-Text25)
      fillField('Text11', data.vehicule.marque || '');
      fillField('Text12', data.vehicule.modele || '');
      fillField('Text13', data.vehicule.immatriculation || '');
      fillField('Text14', data.vehicule.vin || '');
      
      if (data.vente.prixTTC) {
        fillField('Text17', formatPrix(data.vente.prixTTC));
        const prixHT = data.vente.prixTTC / 1.20;
        const tva = data.vente.prixTTC - prixHT;
        fillField('Text18', formatPrix(prixHT));
        fillField('Text19', formatPrix(tva));
      }
      
      fillField('Text20', data.vehicule.kilometrage ? `${data.vehicule.kilometrage} km` : '');
      fillField('Text21', data.vente.modePaiement || '');
      
      console.log('✅ Facture remplie avec le nouveau format (Text1-Text25)');
    } else if (hasStructuredFields) {
      // Ancien format avec champs structurés
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
      
      console.log('✅ Facture remplie avec l\'ancien format structuré');
    }

    // Ne pas utiliser flatten() pour éviter les erreurs
    // Le PDF restera modifiable
  } catch (error) {
    console.error('Erreur lors du remplissage de la facture PDF:', error);
  }

  try {
    const pdfBytes = await pdfDoc.save({ updateFieldAppearances: false });
    return Buffer.from(pdfBytes);
  } catch (saveError) {
    console.error('Erreur lors de la sauvegarde du PDF:', saveError.message);
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
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
    const doc = new PDFKitDoc({ margin: 45, size: 'A4' }); // Marges réduites de 10% (50 -> 45)
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Titre
    doc.fontSize(18).text('CONTRAT DE VENTE DE VÉHICULE D\'OCCASION', { align: 'center' });
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Parties
    doc.fontSize(12).text('ENTRE LES SOUSSIGNÉS:', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text('Le VENDEUR:');
    doc.text(`${data.societe.raisonSociale}, SIRET ${data.societe.siret}`);
    doc.text(`${data.societe.adresse}, ${data.societe.codePostal} ${data.societe.ville}`);
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)
    doc.text('L\'ACHETEUR:');
    doc.text(`${data.client.prenom} ${data.client.nom}`);
    doc.text(`${data.client.adresse}, ${data.client.codePostal} ${data.client.ville}`);
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 1 - Objet
    doc.fontSize(11).text('ARTICLE 1 - OBJET', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text(`Le présent contrat a pour objet la vente du véhicule suivant:`);
    doc.moveDown(0.27); // Réduction de 10% (0.3 -> 0.27)
    doc.text(`Marque: ${data.vehicule.marque}`);
    doc.text(`Modèle: ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`N° de série (VIN): ${data.vehicule.vin}`);
    doc.text(`Date de première immatriculation: ${data.vehicule.datePremiereImmat}`);
    doc.text(`Kilométrage déclaré: ${data.vehicule.kilometrage} km`);
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 2 - Prix
    doc.fontSize(11).text('ARTICLE 2 - PRIX', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text(`Le prix de vente est fixé à la somme de ${formatPrix(data.vente.prixTTC)} € TTC.`);
    doc.text(`Paiement: ${data.vente.modePaiement || 'Non spécifié'}`);
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 3 - Essai
    doc.fontSize(11).text('ARTICLE 3 - ESSAI PRÉALABLE', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text('L\'acheteur reconnaît avoir effectué un essai préalable du véhicule et avoir');
    doc.text('constaté son état. Il accepte le véhicule en l\'état, avec les usures normales');
    doc.text('liées à son âge et à son kilométrage.');
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 4 - Garanties
    doc.fontSize(11).text('ARTICLE 4 - GARANTIES', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text('Le véhicule bénéficie de la garantie légale de conformité de 12 mois');
    doc.text('(articles L. 217-4 à L. 217-14 du Code de la consommation).');
    doc.text('En complément, une garantie commerciale de 3 mois est accordée (voir');
    doc.text('contrat de garantie séparé).');
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 5 - Livraison
    doc.fontSize(11).text('ARTICLE 5 - LIVRAISON', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text(`Date de livraison: ${formatDateFR(data.vente.dateVente)}`);
    doc.text('La livraison s\'effectue au siège du vendeur ou au lieu convenu.');
    doc.moveDown(0.9); // Réduction de 10% (1 -> 0.9)

    // Article 6 - Transfert de propriété
    doc.fontSize(11).text('ARTICLE 6 - TRANSFERT DE PROPRIÉTÉ', { underline: true });
    doc.moveDown(0.45); // Réduction de 10% (0.5 -> 0.45)
    doc.fontSize(10);
    doc.text('Le transfert de propriété s\'effectue à la livraison du véhicule.');
    doc.text('L\'acheteur s\'engage à effectuer le transfert de la carte grise dans les');
    doc.text('délais légaux.');
    doc.moveDown(1.8); // Réduction de 10% (2 -> 1.8)

    // Signatures
    const lieuSig = getLieuSignature(data);
    const dateSig = formatDateFR(getDateSignature(data));
    doc.text('Fait en double exemplaire,', { align: 'center' });
    doc.text(
      lieuSig ? `à ${lieuSig}, le ${dateSig}` : `le ${dateSig}`,
      { align: 'center' }
    );
    doc.moveDown(1.8); // Réduction de 10% (2 -> 1.8)
    
    doc.text('Le Vendeur', 50, doc.y);
    doc.text('___________________', 50, doc.y + 20);
    doc.text(`${data.societe.raisonSociale}`, 50, doc.y + 40);
    
    doc.text('L\'Acheteur', 350, doc.y - 60);
    doc.text('___________________', 350, doc.y + 20);
    doc.text(`${data.client.prenom} ${data.client.nom}`, 350, doc.y + 20);

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

    // Détection du type de formulaire
    const allFields = form.getFields().map(f => f.getName());
    const hasTextFields = allFields.some(f => f.startsWith('Text'));
    const hasStructuredFields = allFields.some(f => f.includes('form1') || f.includes('beneficiaire') || f.includes('vendeur'));

    if (hasTextFields) {
      // Nouveau format avec champs Text1-Text6
      // MAPPING À ADAPTER selon votre PDF "La Garantie COMMERCIALE.pdf"
      // Ce mapping est une estimation - ajustez selon l'ordre réel des champs
      
      const nomCompletClient = `${data.client.prenom || ''} ${data.client.nom || ''}`.trim();
      
      // Text1-Text2 : Bénéficiaire
      fillField('Text1', nomCompletClient);
      fillField('Text2', `${data.client.adresse || ''}, ${data.client.codePostal || ''} ${data.client.ville || ''}`.trim());
      
      // Text3 : Véhicule
      fillField('Text3', `${data.vehicule.marque || ''} ${data.vehicule.modele || ''} - ${data.vehicule.immatriculation || ''}`.trim());
      
      // Text4 : Date de début
      if (data.vente.dateVente) {
        fillField('Text4', formatDateFR(data.vente.dateVente));
      }
      
      // Text5 : Date de fin (3 mois après)
      if (data.vente.dateVente) {
        try {
          const dateDebut = new Date(data.vente.dateVente);
          const dateFin = new Date(dateDebut);
          dateFin.setMonth(dateFin.getMonth() + 3);
          fillField('Text5', formatDateFR(dateFin.toISOString()));
        } catch (e) {
          console.warn('Erreur calcul date fin garantie:', e);
        }
      }
      
      // Text6 : Vendeur
      fillField('Text6', data.societe.raisonSociale || '');
      
      console.log('✅ Garantie remplie avec le nouveau format (Text1-Text6)');
    } else if (hasStructuredFields) {
      // Ancien format avec champs structurés
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
      
      console.log('✅ Garantie remplie avec l\'ancien format structuré');
    }

    // Ne pas utiliser flatten() pour éviter les erreurs
  } catch (error) {
    console.error('Erreur lors du remplissage de la garantie PDF:', error);
  }

  try {
    const pdfBytes = await pdfDoc.save({ updateFieldAppearances: false });
    return Buffer.from(pdfBytes);
  } catch (saveError) {
    console.error('Erreur lors de la sauvegarde du PDF:', saveError.message);
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

/**
 * Génère le contrat de garantie avec PDFKit (méthode originale)
 * Intègre le contrat complet fourni par l'utilisateur
 */
function generateGarantieWithPDFKit(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFKitDoc({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Calcul de la date de fin (3 mois après)
    let dateFinGarantie = '';
    if (data.vente.dateVente) {
      try {
        const dateDebut = new Date(data.vente.dateVente);
        const dateFin = new Date(dateDebut);
        dateFin.setMonth(dateFin.getMonth() + 3);
        dateFinGarantie = formatDateFR(dateFin.toISOString());
      } catch (e) {
        console.warn('Erreur calcul date fin garantie:', e);
      }
    }

    // ========== PAGE 1 : INFORMATIONS PRINCIPALES ==========
    
    // Titre - Police agrandie
    doc.fontSize(18).text('CONTRAT DE GARANTIE COMMERCIALE', { align: 'center' });
    doc.fontSize(14).text('3 MOIS', { align: 'center' });
    doc.moveDown(0.6);

    // 1. Définition - Police normale
    doc.fontSize(12).text('1. DÉFINITION', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text('La présente garantie constitue un contrat de prestation de service établi entre la');
    doc.text(`société dénommée "le Vendeur" (${data.societe.raisonSociale}) et le bénéficiaire du`);
    doc.text(`service, ci-après dénommé "le Client" (${data.client.prenom} ${data.client.nom}).`);
    doc.moveDown(0.5);

    // Informations Client et Véhicule - Police normale
    doc.fontSize(12).text('BÉNÉFICIAIRE (LE CLIENT):', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.client.prenom} ${data.client.nom}`);
    doc.text(`${data.client.adresse}, ${data.client.codePostal} ${data.client.ville}`);
    doc.moveDown(0.4);
    doc.fontSize(12).text('VÉHICULE GARANTI:', { underline: true });
    doc.fontSize(10);
    doc.text(`${data.vehicule.marque} ${data.vehicule.modele}`);
    doc.text(`Immatriculation: ${data.vehicule.immatriculation}`);
    doc.text(`VIN: ${data.vehicule.vin}`);
    doc.moveDown(0.5);

    // 2. Conditions de la Garantie - Résumé principal
    doc.fontSize(12).text('2. CONDITIONS DE LA GARANTIE', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);
    doc.text('2.1. Le véhicule doit avoir été acquis pour usage personnel, en tant que');
    doc.text('propriétaire ou locataire de longue durée (leasing).');
    doc.moveDown(0.25);
    doc.text('2.2. Le véhicule ne doit pas être utilisé comme taxi, auto-école, ambulance ni en');
    doc.text('compétition, rallye ou course et leurs essais, messagerie express ou loué par un tiers.');
    doc.moveDown(0.25);
    doc.text('2.3. La garantie débute au moment de la remise des clés du véhicule d\'occasion');
    doc.text('ou après expiration de la garantie constructeur, et au plus tard dans les cinq (5) jours');
    doc.text(`suivant la livraison du véhicule pour une durée de trois (3) mois calendaires.`);
    doc.text(`Date de début: ${formatDateFR(data.vente.dateVente)} | Date de fin: ${dateFinGarantie}`);
    doc.moveDown(0.25);
    doc.text('2.4. Le bénéfice de la garantie n\'est pas cessible. Elle prend fin de plein droit');
    doc.text('avant son terme normal en cas de : destruction, cession à un professionnel, vol,');
    doc.text('non-respect des clauses d\'entretien ou des prescriptions du constructeur.');
    doc.moveDown(0.25);
    doc.text('2.5. L\'adhésion à la garantie est obligatoirement faite en France métropolitaine.');
    doc.text('Le Client doit résider en France métropolitaine et le véhicule doit être');
    doc.text('immatriculé en France métropolitaine.');
    doc.moveDown(0.25);
    doc.text('2.6. L\'entretien du véhicule pendant la durée de la garantie a lieu aux frais et');
    doc.text('diligences du Client suivant les préconisations du constructeur. La justification des');
    doc.text('opérations sera concrétisée par présentation des factures correspondantes.');
    doc.moveDown(0.6);

    // Signatures - Page 1
    const lieuSig = getLieuSignature(data);
    const dateSig = formatDateFR(getDateSignature(data));
    doc.fontSize(10).text(
      lieuSig ? `Fait à ${lieuSig}, le ${dateSig}` : `Fait le ${dateSig}`,
      { align: 'center' }
    );
    doc.moveDown(1);
    
    doc.fontSize(10);
    doc.text('Le Vendeur', 50, doc.y);
    doc.text('___________________', 50, doc.y + 18);
    doc.text(`${data.societe.raisonSociale}`, 50, doc.y + 35);
    
    doc.text('Le Client', 350, doc.y - 53);
    doc.text('___________________', 350, doc.y - 35);
    doc.text(`${data.client.prenom} ${data.client.nom}`, 350, doc.y - 18);

    // ========== PAGE 2 : DÉTAILS DE LA GARANTIE ==========
    doc.addPage();

    // 3. Garantie Panne Mécanique - Police réduite
    doc.fontSize(10).text('3. GARANTIE PANNE MÉCANIQUE', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('Sous réserve que le véhicule soit conforme aux présentes conditions, la garantie');
    doc.text('prend en charge la panne mécanique du véhicule identifié dans le présent contrat.');
    doc.text('Sera considéré comme panne mécanique le dysfonctionnement d\'une ou plusieurs');
    doc.text('pièces ou organes expressément garantis dans le présent contrat et non exclu par');
    doc.text('l\'effet d\'une cause interne au véhicule, à la suite ou au cours de son utilisation');
    doc.text('normale. Les pannes mécaniques garanties sont celles qui résultent du');
    doc.text('dysfonctionnement d\'une pièce expressément garantie dans le présent contrat.');
    doc.moveDown(0.4);

    // 4. Couverture - Police réduite
    doc.fontSize(10).text('4. COUVERTURE', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('La garantie couvre exclusivement les pièces suivantes :');
    doc.moveDown(0.15);
    doc.text('• Moteur : vilebrequin, coussinets, bielles, pistons et leurs axes, segments,');
    doc.text('  pignons de distribution, chaîne, tendeur de chaîne, arbre à cames, ensemble');
    doc.text('  rampe de culbuteurs et/ou poussoirs, soupapes, pompes à huile, arbre intermédiaire.');
    doc.moveDown(0.15);
    doc.text('• Boîte de vitesses manuelle : roulements, pigeonnier, arbres, moyeux et système');
    doc.text('  de synchronisation, axes et fourchette de sélection, bonhommes d\'interdiction.');
    doc.moveDown(0.15);
    doc.text('• Boîte de vitesses automatique : arbre des embrayages planétaires, disques');
    doc.text('  d\'embrayage et pistons de commande, convertisseur et pompes à huile.');
    doc.moveDown(0.15);
    doc.text('• Pont : différentiel, pignons et roulements.');
    doc.moveDown(0.15);
    doc.text('• Ingrédients : pour tout remplacement ou réparation d\'un organe couvert sont');
    doc.text('  pris en charge les ingrédients suivants : huile moteur et boîte de vitesses,');
    doc.text('  filtre à huile moteur, liquide de refroidissement.');
    doc.moveDown(0.4);

    // 5. Exclusions Générales - Police réduite
    doc.fontSize(10).text('5. EXCLUSIONS GÉNÉRALES', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('Sont exclus :');
    doc.moveDown(0.15);
    doc.text('a) Les travaux suivants ne sont pas garantis :');
    doc.text('• L\'entretien,');
    doc.text('• Les réglages non occasionnés par une panne garantie.');
    doc.moveDown(0.15);
    doc.text('b) Les pannes dont l\'origine est :');
    doc.text('• Un événement antérieur à la souscription de la garantie ou postérieur à la fin');
    doc.text('  de la garantie,');
    doc.text('• Un événement consécutif au non-respect de la préparation du véhicule avant la');
    doc.text('  vente, selon les préconisations du constructeur,');
    doc.text('• Les équipements GPL non installés d\'origine par le constructeur du véhicule,');
    doc.text('• Les réparations dues à une dégradation dont l\'origine est une cause externe,');
    doc.text('• Les accessoires non montés d\'origine sur le véhicule,');
    doc.text('• Les conséquences d\'un usage anormal ou abusif du véhicule ou d\'une');
    doc.text('  modification du véhicule,');
    doc.text('• Les conséquences de l\'excès de froid ou de chaleur, de l\'immersion ou de');
    doc.text('  l\'immobilisation prolongée du véhicule,');
    doc.text('• Un fait intentionnel ou une négligence du Client,');
    doc.text('• Les dommages consécutifs à la rupture d\'une pièce non couverte par le présent');
    doc.text('  contrat,');
    doc.text('• Le non-respect de l\'entretien préconisé par le constructeur,');
    doc.text('• Les frais consécutifs à l\'immobilisation du véhicule ainsi que les pertes');
    doc.text('  directes, indirectes ou commerciales,');
    doc.text('• Un court-circuit, un incendie, un accident de la circulation, un vol, un enlèvement');
    doc.text('  ou une confiscation,');
    doc.text('• Un élément non conforme aux données d\'origine du véhicule selon le');
    doc.text('  constructeur,');
    doc.text('• Un vice caché selon les Art. 1641 et suivants du Code civil,');
    doc.text('• Les malfaçons et les dommages consécutifs à des travaux réalisés sur le');
    doc.text('  véhicule garanti,');
    doc.text('• Tous dommages indirects tels que privation de jouissance, dépréciation, frais de');
    doc.text('  garage ou de gardiennage.');
    doc.moveDown(0.4);

    // 6. Mise en Œuvre de la Garantie - Police réduite
    doc.fontSize(10).text('6. MISE EN ŒUVRE DE LA GARANTIE', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('Aucune réparation effectuée sans l\'accord express préalable du Vendeur ne sera');
    doc.text('prise en charge. En cas de panne mécanique, le Client doit :');
    doc.moveDown(0.15);
    doc.text('1. S\'adresser à un réparateur professionnel agréé par Le Vendeur.');
    doc.moveDown(0.15);
    doc.text('2. Après examen du véhicule et diagnostic de la panne, le réparateur devra');
    doc.text('adresser une demande de prise en charge accompagnée d\'un devis chiffré avec une');
    doc.text('description et diagnostic de la panne à Le Vendeur.');
    doc.moveDown(0.4);

    // 7. Montant de la Prise en Charge - Police réduite
    doc.fontSize(10).text('7. MONTANT DE LA PRISE EN CHARGE', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('Le montant des réparations est estimé sur devis du réparateur dès la déclaration');
    doc.text('de la panne et en accord avec le service technique du Vendeur. Le coût des opérations');
    doc.text('nécessaires pour déterminer l\'origine et l\'étendue des dommages est pris en charge');
    doc.text('par le Vendeur dans les limites prévues par le contrat.');
    doc.moveDown(0.4);

    // 8. Cessation des Prestations - Police réduite
    doc.fontSize(10).text('8. CESSATION DES PRESTATIONS', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('Le contrat cesse automatiquement :');
    doc.text('• En cas de non-respect des prescriptions du constructeur sur l\'usage pour lequel');
    doc.text('  le véhicule est conçu,');
    doc.text('• En cas de non-respect des clauses d\'entretien,');
    doc.text('• À la fin des trois (3) mois prévus par le contrat,');
    doc.text('• En cas de vol du véhicule.');
    doc.moveDown(0.4);

    // 9. Dispositions Diverses - Police réduite
    doc.fontSize(10).text('9. DISPOSITIONS DIVERSES', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(8);
    doc.text('9.1 Nullité ou Perte de la Garantie');
    doc.text('Toute fraude, falsification ou faux témoignage entraînera automatiquement la');
    doc.text('nullité du contrat sans compensation pour le Client.');
    doc.moveDown(0.15);
    doc.text('9.2 Non-exécution des Prestations due à des Circonstances Exceptionnelles');
    doc.text('Le Vendeur ne peut être tenue responsable ni des retards ni des non-exécutions');
    doc.text('provoquées par des circonstances exceptionnelles telles que catastrophes naturelles,');
    doc.text('guerres civiles ou étrangères déclarées ou non, réquisitions par les autorités');
    doc.text('compétentes, actes terroristes ou tout autre cas relevant d\'une force majeure.');
    doc.moveDown(0.15);
    doc.text('9.3 Droit Applicable et Tribunaux Compétents');
    doc.text('Le contrat est régi par le droit français. En cas de litige non résolu à l\'amiable');
    doc.text('entre les parties, celui-ci sera porté devant les tribunaux compétents.');

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
    doc.moveDown();
    const lieuSig = getLieuSignature(data);
    const dateSig = formatDateFR(getDateSignature(data));
    doc.text(
      lieuSig ? `Fait à ${lieuSig}, le ${dateSig}` : `Fait le ${dateSig}`,
      { align: 'center' }
    );
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
  const n = typeof prix === 'number' ? prix : parseFloat(String(prix).replace(/\s/g, '').replace(',', '.'));
  if (Number.isNaN(n)) return String(prix ?? '');
  // Espace normal (pas d'espace fine) pour compatibilité PDFKit
  return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

