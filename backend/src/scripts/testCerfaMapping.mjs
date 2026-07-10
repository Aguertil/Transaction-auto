/**
 * Test de remplissage CERFA : génère en mode éditable puis relit les champs clés.
 * Usage : node src/scripts/testCerfaMapping.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { generateSingleDocument } from '../services/documentGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CERFA_DIR = path.join(__dirname, '../../public/cerfa');
const OUT_DIR = path.join(__dirname, '../../tmp-cerfa-test');

const sampleData = {
  societe: {
    raisonSociale: 'MB Auto Test SARL',
    siret: '12345678901234',
    adresse: '10 rue du Commerce',
    codePostal: '75011',
    ville: 'Paris',
    telephone: '0142030405',
    email: 'contact@mbauto-test.fr'
  },
  client: {
    nom: 'Dupont',
    prenom: 'Marie',
    adresse: '25 avenue République',
    codePostal: '69003',
    ville: 'Lyon',
    telephone: '0611223344',
    email: 'marie.dupont@example.fr',
    dateNaissance: '1992-08-22',
    lieuNaissance: 'Villeurbanne'
  },
  vehicule: {
    marque: 'Peugeot',
    modele: '308',
    immatriculation: 'GF-321-WX',
    vin: 'VF3LCYHZM12345678',
    datePremiereImmat: '2019-06-15',
    kilometrage: '78200',
    denominationCommerciale: '308',
    typeVarianteVersion: 'BlueHDi 130',
    genreNational: 'VP',
    couleur: 'Gris'
  },
  vente: {
    dateVente: '2026-02-10',
    prixTTC: '14500',
    modePaiement: 'Virement',
    numeroFacture: 'F-2026-042'
  },
  options: { editable: true }
};

function safeGetText(form, name) {
  try {
    return form.getTextField(name).getText() ?? '';
  } catch {
    return null;
  }
}

function readChecks15776(form) {
  return {
    dateNaissanceAcheteur: safeGetText(form, 'topmostSubform[0].Page1[0].num_DateNaissanceAcheteurA[0]'),
    lieuNaissanceAcheteur: safeGetText(form, 'topmostSubform[0].Page1[0].txt_LieuNaissanceAcheteur[0]'),
    dateVenteJour: safeGetText(form, 'topmostSubform[0].Page1[0].num_DateVenteJour[0]'),
    dateVenteMois: safeGetText(form, 'topmostSubform[0].Page1[0].num_DateVenteMois[0]'),
    dateVenteAnnee: safeGetText(form, 'topmostSubform[0].Page1[0].num_DateVenteAnnée[0]'),
    dateImmatJour: safeGetText(form, 'topmostSubform[0].Page1[0].num_DateImmatriculationJour[0]'),
    immat: safeGetText(form, 'topmostSubform[0].Page1[0].num_Immatriculation[0]')
  };
}

function readChecks13757(form) {
  const base = 'FormulaireGf[0].Page1[0]';
  const sub = `${base}.#subform[0]`;
  return {
    nom: safeGetText(form, `${base}.Champ_de_texte1[0]`),
    prenom: safeGetText(form, `${base}.Champ_de_texte1[1]`),
    codePostal: safeGetText(form, `${base}.Champ_de_texte1[13]`),
    adresse: safeGetText(form, `${base}.Champ_de_texte1[2]`),
    commune: safeGetText(form, `${base}.Champ_de_texte1[3]`),
    marque: safeGetText(form, `${base}.Champ_de_texte1[4]`),
    immat: safeGetText(form, `${base}.Champ_de_texte1[5]`),
    vin: safeGetText(form, `${base}.Champ_de_texte1[12]`),
    faitA: safeGetText(form, `${sub}.Champ_de_texte1[6]`),
    dateNaissance: safeGetText(form, `${base}.Champ_de_texte1[16]`),
    lieuNaissance: safeGetText(form, `${base}.Champ_de_texte1[17]`)
  };
}

function readChecks13750(form) {
  const base = 'topmostSubform[0].Page1[0]';
  return {
    jour1: safeGetText(form, `${base}.Jour1[0]`),
    jour2: safeGetText(form, `${base}.Jour2[0]`),
    jour3: safeGetText(form, `${base}.Jour3[0]`),
    jour4: safeGetText(form, `${base}.Jour4[0]`),
    cityNaiss: safeGetText(form, `${base}.CityName1[0]`),
    prenom: safeGetText(form, `${base}.Name[0]`),
    nom: safeGetText(form, `${base}.FamilyName[0]`),
    vin: safeGetText(form, `${base}.NumeroIdentificationVehicule[0]`)
  };
}

async function main() {
  const pdfs = fs
    .readdirSync(CERFA_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf') && !f.toLowerCase().includes('test'));

  console.log('Dossier CERFA :', CERFA_DIR);
  console.log('PDF présents :', pdfs.length ? pdfs.join(', ') : '(aucun)');

  if (pdfs.length === 0) {
    console.log(
      '\nImpossible de tester la génération : ajoutez les fichiers officiels dans public/cerfa/ (cerfa_15776_01.pdf, cerfa_13757_03.pdf, cerfa-13750.pdf) puis relancez ce script.'
    );
    process.exit(0);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const cases = [
    {
      type: 'cerfa-cession',
      file: 'out-15776.pdf',
      read: readChecks15776,
      expected: { dateNaissanceAnnee: '1992', lieu: 'Villeurbanne', venteJour: '10' }
    },
    {
      type: 'cerfa-mandat',
      file: 'out-13757.pdf',
      read: readChecks13757,
      expected: {
        dateNaissanceAnnee: '1992',
        lieu: 'Villeurbanne',
        codePostal: '69003',
        vin: 'VF3LCYHZM12345678',
        commune: 'Lyon',
        marque: 'Peugeot 308',
        faitA: 'Paris'
      }
    },
    {
      type: 'cerfa-13750',
      file: 'out-13750.pdf',
      read: readChecks13750,
      expected: { jour4: '22081992', mecJour: '15' }
    }
  ];

  for (const { type, file, read, expected } of cases) {
    console.log('\n---', type, '---');
    let buf;
    try {
      buf = await generateSingleDocument(type, sampleData);
    } catch (e) {
      console.log('Génération : ERREUR —', e.message);
      continue;
    }
    const outPath = path.join(OUT_DIR, file);
    fs.writeFileSync(outPath, buf);
    console.log('Génération : OK —', buf.length, 'octets →', outPath);

    const pdf = await PDFDocument.load(buf);
    const form = pdf.getForm();
    const checks = read(form);
    console.log('Lecture champs :', JSON.stringify(checks, null, 2));

    if (expected.dateNaissanceAnnee) {
      const ok =
        checks.dateNaissanceAcheteur === expected.dateNaissanceAnnee ||
        checks.dateNaissance === expected.dateNaissanceAnnee;
      console.log('Contrôle année naissance', expected.dateNaissanceAnnee, ':', ok ? 'OK' : 'À vérifier');
    }
    if (expected.jour4) {
      const ok = checks.jour4 === expected.jour4;
      console.log('Contrôle Jour4 (JJMMAAAA)', expected.jour4, ':', ok ? 'OK' : 'À vérifier', checks.jour4);
    }
    if (expected.lieu) {
      const ok =
        checks.lieuNaissanceAcheteur?.includes(expected.lieu) ||
        checks.lieuNaissance?.includes(expected.lieu) ||
        checks.cityNaiss?.includes(expected.lieu);
      console.log('Contrôle lieu naissance attendu', expected.lieu, ':', ok ? 'OK' : 'À vérifier');
    }
    if (expected.codePostal) {
      const ok = checks.codePostal === expected.codePostal;
      console.log('Contrôle code postal mandat', expected.codePostal, ':', ok ? 'OK' : 'À vérifier', checks.codePostal);
    }
    if (expected.vin) {
      const ok = checks.vin === expected.vin;
      console.log('Contrôle VIN mandat :', ok ? 'OK' : 'À vérifier', checks.vin);
    }
    if (expected.commune) {
      const ok = checks.commune === expected.commune || checks.commune?.includes(expected.commune);
      console.log('Contrôle commune mandat', expected.commune, ':', ok ? 'OK' : 'À vérifier', checks.commune);
    }
    if (expected.marque) {
      const ok = checks.marque === expected.marque || checks.marque?.includes('Peugeot');
      console.log('Contrôle marque mandat', expected.marque, ':', ok ? 'OK' : 'À vérifier', checks.marque);
    }
    if (expected.faitA) {
      const ok = checks.faitA === expected.faitA;
      console.log('Contrôle Fait à', expected.faitA, ':', ok ? 'OK' : 'À vérifier', checks.faitA);
    }
    if (expected.venteJour) {
      const ok = checks.dateVenteJour === expected.venteJour;
      console.log('Contrôle jour date vente', expected.venteJour, ':', ok ? 'OK' : 'À vérifier', checks.dateVenteJour);
    }
    if (expected.mecJour) {
      const ok = checks.jour1 === expected.mecJour;
      console.log('Contrôle jour 1re immat (Jour1)', expected.mecJour, ':', ok ? 'OK' : 'À vérifier', checks.jour1);
    }
  }

  console.log('\nFin du test.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
