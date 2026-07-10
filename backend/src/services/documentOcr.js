import Tesseract from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
import sharp from 'sharp';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp']);
const PDF_TYPE = 'application/pdf';

let ocrWorker = null;
let workerReady = null;

async function getWorker() {
  if (ocrWorker) return ocrWorker;
  if (workerReady) return workerReady;

  workerReady = (async () => {
    // Français + anglais (libellés bilingues CNI / CERFA)
    const worker = await Tesseract.createWorker(['fra', 'eng'], 1, {
      logger: () => {}
    });
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300'
    });
    ocrWorker = worker;
    return worker;
  })();

  return workerReady;
}

/**
 * Prétraitement image pour améliorer l'OCR :
 * agrandissement, niveaux de gris, contraste, netteté.
 */
async function preprocessImage(buffer) {
  try {
    const image = sharp(buffer, { failOn: 'none' }).rotate(); // EXIF orientation
    const meta = await image.metadata();
    const width = meta.width || 1000;
    // Viser ~2000–2800 px de large pour Tesseract
    const targetWidth = width < 1600 ? Math.round(width * 2.2) : width < 2200 ? Math.round(width * 1.4) : width;

    return await image
      .resize({ width: Math.min(targetWidth, 3200), withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.2 })
      .modulate({ brightness: 1.05 })
      .png()
      .toBuffer();
  } catch {
    return buffer;
  }
}

/**
 * Variante binaire (documents très contrastés / CNI plastifiée).
 */
async function preprocessBinary(buffer) {
  try {
    return await sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize({ width: 2400, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .linear(1.3, -(128 * 0.3))
      .sharpen()
      .png()
      .toBuffer();
  } catch {
    return buffer;
  }
}

function scoreOcrText(text) {
  if (!text) return 0;
  const letters = (text.match(/[A-Za-zÀ-ÿ0-9]/g) || []).length;
  const noise = (text.match(/[^\w\sÀ-ÿ.,;:/\-()°']/g) || []).length;
  return letters - noise * 2;
}

/**
 * Lance l'OCR avec prétraitement ; 2e passe si résultat faible.
 */
async function recognizeBest(buffer) {
  const worker = await getWorker();
  const primary = await preprocessImage(buffer);

  await worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300'
  });
  let { data } = await worker.recognize(primary);
  let best = {
    text: normalizeText(data.text || ''),
    score: scoreOcrText(data.text || '') + (data.confidence || 0),
    confidence: data.confidence || 0
  };

  // 2e passe si texte pauvre
  if (best.score < 80 || best.text.length < 40) {
    const secondary = await preprocessBinary(buffer);
    for (const psm of [Tesseract.PSM.SINGLE_BLOCK, Tesseract.PSM.SPARSE_TEXT]) {
      try {
        await worker.setParameters({
          tessedit_pageseg_mode: psm,
          preserve_interword_spaces: '1',
          user_defined_dpi: '300'
        });
        ({ data } = await worker.recognize(secondary));
        const text = normalizeText(data.text || '');
        const score = scoreOcrText(text) + (data.confidence || 0);
        if (score > best.score) {
          best = { text, score, confidence: data.confidence || 0 };
        }
      } catch {
        // continue
      }
    }
  }

  return best;
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    // Corrections OCR fréquentes sur docs FR
    .replace(/[|]/g, 'I')
    .replace(/[«»]/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Corrige confusions OCR courantes dans les plaques / VIN */
function fixOcrAlnum(s, mode = 'alnum') {
  if (!s) return '';
  let out = s.toUpperCase().replace(/\s+/g, '');
  if (mode === 'plate' || mode === 'vin') {
    out = out.replace(/O/g, '0').replace(/Q/g, '0').replace(/D/g, '0');
    // Pour lettres de plaque : 0→O, 1→I parfois — mais plaques FR = lettres hors I/O
  }
  if (mode === 'plate') {
    // Format AA-123-AA : zones lettres vs chiffres
    out = out.replace(/[^A-Z0-9]/g, '');
  }
  return out;
}

function cleanValue(value) {
  if (!value) return '';
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[:.\-\s]+/, '')
    .replace(/[:.\-\s]+$/, '')
    .trim();
}

function parseDate(value) {
  if (!value) return '';
  const cleaned = String(value).replace(/[Oo]/g, '0').replace(/[lI]/g, '1');
  const match = cleaned.match(/(\d{2})[./\-\s](\d{2})[./\-\s](\d{4})/);
  if (!match) return '';
  const [, jj, mm, aaaa] = match;
  const j = parseInt(jj, 10);
  const m = parseInt(mm, 10);
  const a = parseInt(aaaa, 10);
  if (j < 1 || j > 31 || m < 1 || m > 12 || a < 1900 || a > 2100) return '';
  return `${aaaa}-${mm}-${jj}`;
}

function matchFirst(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanValue(match[1]);
  }
  return '';
}

/** Normalise une plaque FR SIV AA-123-AA */
function normalizePlate(raw) {
  if (!raw) return '';
  let s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // LL + NNN + LL
  if (s.length >= 7) {
    // Chercher motif 2 lettres + 3 chiffres + 2 lettres dans la chaîne
    const m = s.match(/([A-Z0-9]{2})([A-Z0-9]{3})([A-Z0-9]{2})/);
    if (m) {
      const toLetters = (x) =>
        x
          .replace(/0/g, 'O')
          .replace(/1/g, 'I')
          .replace(/8/g, 'B')
          .replace(/5/g, 'S');
      const toDigits = (x) =>
        x
          .replace(/O/g, '0')
          .replace(/I/g, '1')
          .replace(/L/g, '1')
          .replace(/B/g, '8')
          .replace(/S/g, '5')
          .replace(/Z/g, '2')
          .replace(/G/g, '6');
      const a = toLetters(m[1]);
      const b = toDigits(m[2]);
      const c = toLetters(m[3]);
      if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(a + b + c)) {
        return `${a}-${b}-${c}`;
      }
    }
  }
  // Ancien format
  if (/^\d{1,4}[A-Z]{2,3}\d{2,3}$/.test(s)) return s;
  return raw.toUpperCase().replace(/\s+/g, '-');
}

function parseCarteGrise(text) {
  const raw = normalizeText(text);
  const upper = raw.toUpperCase();

  // Plaques : plusieurs formats + tolérance OCR
  let immatriculation = matchFirst(upper, [
    /(?:^|\n)\s*A[\.\s]*[:\s]*([A-Z0-9]{2}[\s\-]?[0-9OIL]{3}[\s\-]?[A-Z0-9]{2})/m,
    /\b([A-Z]{2}[\s\-][0-9OIL]{3}[\s\-][A-Z]{2})\b/,
    /\b([A-Z]{2}\s+[0-9OIL]{3}\s+[A-Z]{2})\b/,
    /\b([A-Z0-9]{2}\s?[0-9OIL]{3}\s?[A-Z0-9]{2})\b/
  ]);
  immatriculation = normalizePlate(immatriculation);

  let vin = matchFirst(upper, [
    /(?:^|\n)\s*E[\.\s]*[:\s]*([A-HJ-NPR-Z0-9IOQ]{17})/m,
    /\b([A-HJ-NPR-Z0-9]{17})\b/,
    /VIN[:\s]*([A-HJ-NPR-Z0-9IOQ]{17})/i
  ]);
  vin = fixOcrAlnum(vin, 'vin').replace(/O/g, '0').replace(/I/g, '1').replace(/Q/g, '0');
  if (vin.length !== 17) vin = vin.slice(0, 17);

  const marque = matchFirst(raw, [
    /(?:^|\n)\s*D\.?\s*1\.?\s*[:\s]*([A-Za-zÀ-ÿ0-9\-\s]+?)(?:\n|$)/im,
    /MARQUE\s*[:\s]*([A-Za-zÀ-ÿ0-9\-\s]+?)(?:\n|$)/im,
    /CONSTRUCTEUR\s*[:\s]*([A-Za-zÀ-ÿ0-9\-\s]+?)(?:\n|$)/im
  ]).toUpperCase();

  const typeVarianteVersion = matchFirst(raw, [
    /(?:^|\n)\s*D\.?\s*2\.?\s*[:\s]*(.+?)(?:\n|$)/im
  ]);

  const denominationCommerciale = matchFirst(raw, [
    /(?:^|\n)\s*D\.?\s*3\.?\s*[:\s]*(.+?)(?:\n|$)/im,
    /D[ÉE]NOMINATION\s+COMMERCIALE\s*[:\s]*(.+?)(?:\n|$)/im
  ]);

  const datePremiereImmat = parseDate(
    matchFirst(raw, [
      /(?:^|\n)\s*B[\.\s]*[:\s]*([0-9OIl./\-\s]{8,12})/im,
      /PREMI[EÈ]RE\s+IMMATRICULATION\s*[:\s]*([0-9OIl./\-\s]{8,12})/im,
      /DATE\s+DE\s+1[ÈE]RE\s+IMMAT[^0-9]*([0-9]{2}[./\-][0-9]{2}[./\-][0-9]{4})/im
    ])
  );

  const genreNational = matchFirst(raw, [
    /(?:^|\n)\s*J[\.\s]*[:\s]*([A-Z0-9]{1,6})/im,
    /GENRE\s*(?:NATIONAL)?\s*[:\s]*([A-Z0-9]{1,6})/im
  ]).toUpperCase();

  const couleur = matchFirst(raw, [
    /(?:^|\n)\s*R[\.\s]*[:\s]*(.+?)(?:\n|$)/im,
    /COULEUR\s*[:\s]*(.+?)(?:\n|$)/im
  ]);

  const modele = cleanValue(denominationCommerciale || typeVarianteVersion);

  return {
    vehicule: {
      immatriculation,
      vin,
      marque: cleanValue(marque),
      modele,
      denominationCommerciale: cleanValue(denominationCommerciale),
      typeVarianteVersion: cleanValue(typeVarianteVersion),
      datePremiereImmat,
      genreNational: cleanValue(genreNational),
      couleur: cleanValue(couleur)
    },
    confidence: {
      immatriculation: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(immatriculation) || immatriculation.length >= 5,
      vin: vin.length === 17,
      marque: !!marque
    }
  };
}

/**
 * Parse zone MRZ d'une CNI française (très fiable si lisible).
 */
function parseMrzCni(text) {
  const upper = text.toUpperCase();
  const lines = upper
    .split('\n')
    .map((l) => l.replace(/[^A-Z0-9<]/g, ''))
    .filter((l) => (l.match(/</g) || []).length >= 2 && l.length >= 20);

  let nom = '';
  let prenom = '';
  let dateNaissance = '';

  // Ligne noms : NOM<<PRENOM ou NOM<PRENOM<<<
  const nameLine = lines.find((l) => /<</.test(l) && !/^IDFRA|^I<FRA|^\d/.test(l));
  if (nameLine) {
    const cleaned = nameLine.replace(/^P<FRA|^P</, '');
    const parts = cleaned.split('<<');
    nom = (parts[0] || '').replace(/</g, ' ').trim();
    prenom = (parts[1] || '').replace(/</g, ' ').trim().split(/\s+/)[0] || '';
  }

  // Ligne date : commence souvent par AAMMJJ
  const dateLine = lines.find((l) => /^\d{6}/.test(l));
  if (dateLine) {
    const yy = dateLine.slice(0, 2);
    const mm = dateLine.slice(2, 4);
    const dd = dateLine.slice(4, 6);
    const century = parseInt(yy, 10) > 30 ? '19' : '20';
    dateNaissance = parseDate(`${dd}/${mm}/${century}${yy}`);
  }

  // IDFRA… parfois contient le nom après le n°
  if (!nom) {
    const idLine = lines.find((l) => l.startsWith('IDFRA') || l.startsWith('I<FRA'));
    if (idLine) {
      const after = idLine.replace(/^IDFRA|^I<FRA/, '').replace(/[0-9]/g, '');
      const parts = after.split('<<');
      if (parts[0] && parts[0].replace(/</g, '').length > 1) {
        nom = parts[0].replace(/</g, ' ').trim();
      }
    }
  }

  return {
    nom: cleanValue(nom).toUpperCase(),
    prenom: cleanValue(prenom),
    dateNaissance
  };
}

function parseCni(text) {
  const raw = normalizeText(text);
  // Séparer zone visuelle et MRZ (lignes avec beaucoup de <)
  const visualLines = raw
    .split('\n')
    .filter((l) => (l.match(/</g) || []).length < 3)
    .join('\n');
  const mrz = parseMrzCni(raw);

  const blacklist =
    /^(REPUBLIQUE|FRANCAISE|FRANÇAISE|CARTE|NATIONALE|IDENTITE|IDENTITY|DOCUMENT|IDFRA|FRANCE)$/i;

  let nom = matchFirst(visualLines, [
    /NOM\s*(?:\/\s*SURNAME)?\s*[:\s]*\n?\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\-]{1,35})(?:\s|$|\n)/i,
    /SURNAME\s*[:\s]*\n?\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\-]{2,35})/i
  ]).toUpperCase();
  if (blacklist.test(nom) || nom.includes('<')) nom = '';
  if (!nom && mrz.nom && !blacklist.test(mrz.nom) && !mrz.nom.startsWith('IDFRA')) {
    nom = mrz.nom;
  }

  let prenom = matchFirst(visualLines, [
    /PR[ÉE]NOM(?:S)?\s*(?:\/\s*GIVEN NAMES?)?\s*[:\s]*\n?\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\-]+)/i,
    /GIVEN NAMES?\s*[:\s]*\n?\s*([A-Za-zÀ-ÿ\-]+)/i
  ]);
  if (blacklist.test(prenom) || /née|nee|le\s+\d/i.test(prenom)) prenom = '';
  if (!prenom && mrz.prenom) prenom = mrz.prenom.split(/\s+/)[0];

  const dateNaissance =
    parseDate(
      matchFirst(visualLines, [
        /N[ÉE]E?\s*(?:LE)?\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i,
        /DATE OF BIRTH\s*[:\s]*(\d{2}[./\-]\d{2}[./\-]\d{4})/i
      ])
    ) || mrz.dateNaissance;

  const lieuNaissance = matchFirst(visualLines, [
    /N[ÉE]E?\s*(?:LE)?\s*\d{2}[./\-]\d{2}[./\-]\d{4}\s+[àa]\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\-\s']{1,30}?)(?:\n|$)/i,
    /LIEU\s+DE\s+NAISSANCE\s*[:\s]*([A-Za-zÀ-ÿ\-\s']+)/i,
    /PLACE OF BIRTH\s*[:\s]*([A-Za-zÀ-ÿ\-\s']+)/i
  ]);

  const adresseBlock = matchFirst(visualLines, [
    /ADRESSE\s*[:\s]*\n?\s*([0-9].+?)(?:\n\s*\d{5}|\n\n|$)/is,
    /ADRESSE\s*[:\s]*\n?\s*([^\n]+)/i
  ]);

  let codePostal = '';
  let ville = '';
  const cpMatch = visualLines.match(/\b(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][A-Za-zÀ-ÿ\-\s']{1,30})/);
  if (cpMatch) {
    codePostal = cpMatch[1];
    ville = cleanValue(cpMatch[2].split(/\s{2,}/)[0]);
  }

  return {
    client: {
      nom: cleanValue(nom).toUpperCase(),
      prenom: cleanValue(prenom),
      adresse: cleanValue(adresseBlock),
      codePostal,
      ville,
      dateNaissance,
      lieuNaissance: cleanValue(lieuNaissance)
    },
    confidence: {
      nom: !!nom && nom.length > 1,
      prenom: !!prenom && prenom.length > 1,
      adresse: !!(adresseBlock || codePostal),
      mrz: !!(mrz.nom || mrz.dateNaissance)
    }
  };
}

function parseKbis(text) {
  const raw = normalizeText(text);

  const raisonSociale = matchFirst(raw, [
    /D[ÉE]NOMINATION(?:\s+OU\s+RAISON\s+SOCIALE)?\s*[:\s]*\n?\s*(.+?)(?:\n|$)/i,
    /RAISON\s+SOCIALE\s*[:\s]*\n?\s*(.+?)(?:\n|$)/i,
    /NOM\s+DE\s+L['']ENTREPRISE\s*[:\s]*\n?\s*(.+?)(?:\n|$)/i
  ]);

  let siret = matchFirst(raw, [
    /SIRET\s*[:\s]*([0-9\s]{14,20})/i,
    /NUM[ÉE]RO\s+SIRET\s*[:\s]*([0-9\s]{14,20})/i,
    /\b(\d{3}\s\d{3}\s\d{3}\s\d{5})\b/,
    /\b(\d{14})\b/
  ]).replace(/\s/g, '');

  // Siren seul → compléter si possible
  if (siret.length === 9) {
    const nic = matchFirst(raw, [/NIC\s*[:\s]*(\d{5})/i]);
    if (nic) siret += nic;
  }

  const siegeBlock = matchFirst(raw, [
    /SI[EÈ]GE\s+SOCIAL\s*[:\s]*\n?\s*([\s\S]{5,200}?)(?:\n\n|FORME|CAPITAL|DUR[ÉE]E|$)/i,
    /ADRESSE\s+(?:DU\s+)?SI[EÈ]GE\s*[:\s]*\n?\s*([\s\S]{5,200}?)(?:\n\n|$)/i
  ]);

  let adresse = '';
  let codePostal = '';
  let ville = '';

  const searchAddr = siegeBlock || raw;
  const cpMatch = searchAddr.match(/(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][A-Za-zÀ-ÿ\-\s']{1,40})/);
  if (cpMatch) {
    codePostal = cpMatch[1];
    ville = cleanValue(cpMatch[2]);
    if (siegeBlock) {
      adresse = cleanValue(siegeBlock.split(cpMatch[0])[0]);
    }
  } else {
    adresse = cleanValue(siegeBlock);
  }

  return {
    societe: {
      raisonSociale: cleanValue(raisonSociale),
      siret,
      adresse,
      codePostal,
      ville
    },
    confidence: {
      raisonSociale: !!raisonSociale,
      siret: siret.length === 14
    }
  };
}

function parseDomicile(text) {
  const raw = normalizeText(text);

  const cpMatches = [...raw.matchAll(/\b(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][A-Za-zÀ-ÿ\-\s']{2,40})/g)];
  // Prendre le dernier CP (souvent l'adresse du destinataire)
  let codePostal = '';
  let ville = '';
  if (cpMatches.length) {
    const last = cpMatches[cpMatches.length - 1];
    codePostal = last[1];
    ville = cleanValue(last[2]);
  }

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  let adresse = '';
  const cpLineIdx = lines.findIndex((l) => new RegExp(`\\b${codePostal}\\b`).test(l));
  if (cpLineIdx > 0) {
    // Ligne juste au-dessus = souvent la rue
    adresse = lines[cpLineIdx - 1];
    if (cpLineIdx > 1 && !/\d/.test(adresse) && /\d/.test(lines[cpLineIdx - 2])) {
      adresse = lines[cpLineIdx - 2];
    }
  }

  const titulaire = matchFirst(raw, [
    /(?:M\.|MME|MR|MONSIEUR|MADAME)\s+([A-ZÀ-ÿ][A-Za-zÀ-ÿ\-\s']{2,40})/i
  ]);

  return {
    client: {
      adresse: cleanValue(adresse),
      codePostal,
      ville,
      nom: titulaire ? titulaire.split(/\s+/).pop()?.toUpperCase() || '' : '',
      prenom: titulaire ? titulaire.split(/\s+/).slice(0, -1).join(' ') : ''
    },
    confidence: {
      adresse: !!(adresse || codePostal)
    }
  };
}

const PARSERS = {
  'carte-grise': parseCarteGrise,
  cni: parseCni,
  kbis: parseKbis,
  domicile: parseDomicile
};

async function extractTextFromPdf(buffer) {
  // 1) Texte natif
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    const text = normalizeText(result.text || '');
    if (text.length >= 40) {
      return { text, method: 'pdf-text', confidence: 95 };
    }
  } catch {
    // fallback
  }

  // 2) Screenshots haute résolution + OCR multi-passes
  const parser = new PDFParse({ data: buffer });
  try {
    const screenshots = await parser.getScreenshot({
      first: 1,
      last: 2,
      scale: 3
    });
    const parts = [];
    let confSum = 0;
    let n = 0;
    for (const page of screenshots.pages || []) {
      if (!page.dataUrl) continue;
      const base64 = page.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64, 'base64');
      const best = await recognizeBest(imgBuffer);
      parts.push(best.text);
      confSum += best.confidence;
      n += 1;
    }
    return {
      text: normalizeText(parts.join('\n\n')),
      method: 'pdf-ocr',
      confidence: n ? Math.round(confSum / n) : 0
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractTextFromImage(buffer) {
  const best = await recognizeBest(buffer);
  return {
    text: best.text,
    method: 'image-ocr',
    confidence: Math.round(best.confidence || 0)
  };
}

export async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === PDF_TYPE) {
    return extractTextFromPdf(buffer);
  }
  if (IMAGE_TYPES.has(mimetype)) {
    return extractTextFromImage(buffer);
  }
  throw new Error(`Type de fichier non supporté: ${mimetype}`);
}

export function parseDocumentText(documentType, text) {
  const parser = PARSERS[documentType];
  if (!parser) {
    throw new Error(`Type de document inconnu: ${documentType}`);
  }
  return parser(text);
}

export function mergeExtractedData(results) {
  const merged = {
    societe: {},
    client: {},
    vehicule: {},
    warnings: [],
    extractedFields: []
  };

  // Priorité : domicile écrase l'adresse CNI ; CNI écrase nom si MRZ
  const order = { 'carte-grise': 1, kbis: 1, cni: 2, domicile: 3 };
  const sorted = [...results].sort(
    (a, b) => (order[a.documentType] || 0) - (order[b.documentType] || 0)
  );

  for (const { documentType, data, method, confidence } of sorted) {
    if (data.societe) {
      Object.entries(data.societe).forEach(([key, value]) => {
        if (value) {
          merged.societe[key] = value;
          merged.extractedFields.push(`societe.${key}`);
        }
      });
    }
    if (data.client) {
      Object.entries(data.client).forEach(([key, value]) => {
        if (!value) return;
        // domicile prioritaire pour adresse
        if (documentType === 'domicile' && ['adresse', 'codePostal', 'ville'].includes(key)) {
          merged.client[key] = value;
        } else if (!merged.client[key]) {
          merged.client[key] = value;
        } else if (documentType === 'cni' && data.confidence?.mrz && ['nom', 'prenom', 'dateNaissance'].includes(key)) {
          merged.client[key] = value;
        }
        merged.extractedFields.push(`client.${key}`);
      });
    }
    if (data.vehicule) {
      Object.entries(data.vehicule).forEach(([key, value]) => {
        if (value) {
          merged.vehicule[key] = value;
          merged.extractedFields.push(`vehicule.${key}`);
        }
      });
    }

    const conf = data.confidence || {};
    const missing = Object.entries(conf)
      .filter(([k, ok]) => k !== 'mrz' && !ok)
      .map(([k]) => k);
    if (missing.length) {
      merged.warnings.push(
        `${documentType}: champs non détectés (${missing.join(', ')}). Complétez manuellement.`
      );
    }

    if (method === 'pdf-ocr' || method === 'image-ocr') {
      const c = confidence != null ? ` (~${confidence}%)` : '';
      merged.warnings.push(
        `${documentType}: lecture OCR${c}. Vérifiez chaque champ avant génération.`
      );
    }
  }

  merged.extractedFields = [...new Set(merged.extractedFields)];
  merged.warnings = [...new Set(merged.warnings)];
  return merged;
}

export async function processDocument(buffer, mimetype, documentType) {
  const { text, method, confidence } = await extractTextFromFile(buffer, mimetype);
  const data = parseDocumentText(documentType, text);
  return {
    documentType,
    data,
    method,
    confidence,
    textPreview: text.slice(0, 800)
  };
}
