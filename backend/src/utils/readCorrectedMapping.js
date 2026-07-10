/**
 * Script pour lire le PDF corrigé et extraire les correspondances
 * 
 * Usage: node src/utils/readCorrectedMapping.js
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERFA_DIR = path.join(__dirname, '../../public/cerfa');

async function readCorrectedMapping() {
  const cerfaPath = path.join(CERFA_DIR, 'cerfa_13757_03_TEST_MAPPING.pdf');
  
  if (!fs.existsSync(cerfaPath)) {
    console.error(`❌ Fichier non trouvé: ${cerfaPath}`);
    process.exit(1);
  }

  console.log(`\n🔍 Lecture du PDF corrigé: ${cerfaPath}\n`);

  const existingPdfBytes = fs.readFileSync(cerfaPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  const basePath = 'FormulaireGf[0].Page1[0]';
  const subformPath = 'FormulaireGf[0].Page1[0].#subform[0]';

  // Liste des champs à lire
  const fields = [
    { index: 0, path: `${basePath}.Champ_de_texte1[0]`, name: 'Champ_de_texte1[0]' },
    { index: 1, path: `${basePath}.Champ_de_texte1[1]`, name: 'Champ_de_texte1[1]' },
    { index: 2, path: `${basePath}.Champ_de_texte1[2]`, name: 'Champ_de_texte1[2]' },
    { index: 3, path: `${basePath}.Champ_de_texte1[3]`, name: 'Champ_de_texte1[3]' },
    { index: 4, path: `${basePath}.Champ_de_texte1[4]`, name: 'Champ_de_texte1[4]' },
    { index: 5, path: `${basePath}.Champ_de_texte1[5]`, name: 'Champ_de_texte1[5]' },
    { index: 6, path: `${subformPath}.Champ_de_texte1[6]`, name: 'Champ_de_texte1[6] (subform)' },
    { index: 7, path: `${basePath}.Champ_de_texte1[7]`, name: 'Champ_de_texte1[7]' },
    { index: 8, path: `${basePath}.Champ_de_texte1[8]`, name: 'Champ_de_texte1[8]' },
    { index: 9, path: `${basePath}.Champ_de_texte1[9]`, name: 'Champ_de_texte1[9]' },
    { index: 10, path: `${basePath}.Champ_de_texte1[10]`, name: 'Champ_de_texte1[10]' },
    { index: 12, path: `${basePath}.Champ_de_texte1[12]`, name: 'Champ_de_texte1[12]' },
    { index: 13, path: `${basePath}.Champ_de_texte1[13]`, name: 'Champ_de_texte1[13]' },
    { index: 14, path: `${basePath}.Champ_de_texte1[14]`, name: 'Champ_de_texte1[14]' },
  ];

  console.log('📋 Valeurs trouvées dans le PDF corrigé:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const mapping = {};

  for (const field of fields) {
    try {
      const textField = form.getTextField(field.path);
      const value = textField.getText();
      console.log(`${field.name.padEnd(30)} = "${value}"`);
      
      // Extraire le type de données attendu depuis la valeur
      if (value.includes('[') && value.includes(']')) {
        const match = value.match(/\[(\d+)\]\s*(.+)/);
        if (match) {
          const originalIndex = parseInt(match[1]);
          const label = match[2].trim();
          mapping[field.index] = { originalIndex, label, path: field.path };
        }
      } else if (value.trim()) {
        // Si la valeur ne contient pas de label de test, c'est probablement une correction manuelle
        console.log(`  ⚠️  Valeur corrigée manuellement: "${value}"`);
        mapping[field.index] = { value: value.trim(), path: field.path };
      }
    } catch (e) {
      console.log(`${field.name.padEnd(30)} = ERREUR: ${e.message}`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Mapping détecté:\n');

  // Afficher le mapping suggéré
  const dataMapping = {
    'client.nom': null,
    'client.prenom': null,
    'client.adresse': null,
    'client.codePostal': null,
    'client.ville': null,
    'vehicule.immatriculation': null,
    'vehicule.vin': null,
    'vehicule.marque': null,
    'vehicule.modele': null,
  };

  for (const [index, info] of Object.entries(mapping)) {
    if (info.label) {
      const labelUpper = info.label.toUpperCase();
      if (labelUpper.includes('NOM') && !labelUpper.includes('PRENOM')) {
        dataMapping['client.nom'] = parseInt(index);
      } else if (labelUpper.includes('PRENOM')) {
        dataMapping['client.prenom'] = parseInt(index);
      } else if (labelUpper.includes('ADRESSE') || labelUpper.includes('VOIE')) {
        dataMapping['client.adresse'] = parseInt(index);
      } else if (labelUpper.includes('CODE_POSTAL') || labelUpper.includes('POSTAL')) {
        dataMapping['client.codePostal'] = parseInt(index);
      } else if (labelUpper.includes('VILLE')) {
        dataMapping['client.ville'] = parseInt(index);
      } else if (labelUpper.includes('IMMATRICULATION') || labelUpper.includes('IMMAT')) {
        dataMapping['vehicule.immatriculation'] = parseInt(index);
      } else if (labelUpper.includes('VIN') || labelUpper.includes('IDENTIFICATION')) {
        dataMapping['vehicule.vin'] = parseInt(index);
      } else if (labelUpper.includes('MARQUE')) {
        dataMapping['vehicule.marque'] = parseInt(index);
      } else if (labelUpper.includes('MODELE') || labelUpper.includes('MODEL')) {
        dataMapping['vehicule.modele'] = parseInt(index);
      }
    }
  }

  console.log('Mapping suggéré pour le code:');
  console.log(JSON.stringify(dataMapping, null, 2));
  console.log('\n');

  return mapping;
}

readCorrectedMapping().catch(console.error);

