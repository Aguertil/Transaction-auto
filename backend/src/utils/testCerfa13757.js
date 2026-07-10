/**
 * Script de test pour identifier les champs du CERFA 13757
 * 
 * Ce script génère un PDF de test où chaque champ est rempli avec son identifiant
 * pour permettre de voir visuellement quel champ correspond à quoi.
 * 
 * Usage: node src/utils/testCerfa13757.js
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERFA_DIR = path.join(__dirname, '../../public/cerfa');
const OUTPUT_DIR = path.join(__dirname, '../../public/cerfa');

async function testCerfa13757() {
  const cerfaPath = path.join(CERFA_DIR, 'cerfa_13757_03.pdf');
  
  if (!fs.existsSync(cerfaPath)) {
    console.error(`❌ Fichier non trouvé: ${cerfaPath}`);
    process.exit(1);
  }

  console.log(`\n🔍 Test du mapping CERFA 13757\n`);
  console.log(`📄 Fichier source: ${cerfaPath}\n`);

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  const basePath = 'FormulaireGf[0].Page1[0]';
  const subformPath = 'FormulaireGf[0].Page1[0].#subform[0]';

  // Liste des champs à tester avec leur description
  const testFields = [
    { index: 0, path: `${basePath}.Champ_de_texte1[0]`, label: 'NOM' },
    { index: 1, path: `${basePath}.Champ_de_texte1[1]`, label: 'PRENOM' },
    { index: 2, path: `${basePath}.Champ_de_texte1[2]`, label: 'ADRESSE' },
    { index: 3, path: `${basePath}.Champ_de_texte1[3]`, label: 'CODE_POSTAL' },
    { index: 4, path: `${basePath}.Champ_de_texte1[4]`, label: 'VILLE' },
    { index: 5, path: `${basePath}.Champ_de_texte1[5]`, label: 'IMMATRICULATION' },
    { index: 6, path: `${subformPath}.Champ_de_texte1[6]`, label: 'VIN' },
    { index: 7, path: `${basePath}.Champ_de_texte1[7]`, label: 'MARQUE' },
    { index: 8, path: `${basePath}.Champ_de_texte1[8]`, label: 'MODELE' },
    { index: 9, path: `${basePath}.Champ_de_texte1[9]`, label: 'DATE_JOUR' },
    { index: 10, path: `${basePath}.Champ_de_texte1[10]`, label: 'DATE_MOIS' },
    { index: 12, path: `${basePath}.Champ_de_texte1[12]`, label: 'DATE_ANNEE' },
    { index: 13, path: `${basePath}.Champ_de_texte1[13]`, label: 'TELEPHONE' },
    { index: 14, path: `${basePath}.Champ_de_texte1[14]`, label: 'EMAIL' },
  ];

  console.log('📝 Remplissage des champs avec leurs identifiants...\n');

  for (const field of testFields) {
    try {
      const textField = form.getTextField(field.path);
      const testValue = `[${field.index}] ${field.label}`;
      textField.setText(testValue);
      console.log(`✅ ${field.path} = "${testValue}"`);
    } catch (e) {
      console.log(`❌ ${field.path} = ERREUR: ${e.message}`);
    }
  }

  // Sauvegarder le PDF de test
  const outputPath = path.join(OUTPUT_DIR, 'cerfa_13757_03_TEST_MAPPING.pdf');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`\n✅ PDF de test généré: ${outputPath}`);
  console.log(`\n💡 Instructions:`);
  console.log(`   1. Ouvrez le PDF de test dans Adobe Reader`);
  console.log(`   2. Regardez quel champ correspond à quel label`);
  console.log(`   3. Notez les correspondances et corrigez le mapping dans documentGenerator.js`);
  console.log(`\n📋 Exemple de correspondance:`);
  console.log(`   Si vous voyez "[0] NOM" dans le champ "Nom de la voie",`);
  console.log(`   alors Champ_de_texte1[0] correspond à "Nom de la voie" et non à "Nom"`);
  console.log(`\n`);
}

testCerfa13757().catch(console.error);

