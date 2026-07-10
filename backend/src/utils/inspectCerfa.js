/**
 * Script utilitaire pour inspecter les champs d'un PDF CERFA
 * 
 * Usage: node src/utils/inspectCerfa.js <chemin_vers_pdf>
 * 
 * Ce script liste tous les champs de formulaire présents dans un PDF CERFA
 * pour faciliter l'adaptation du code si les noms de champs changent.
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectCerfa(pdfPath) {
  try {
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ Fichier non trouvé: ${pdfPath}`);
      process.exit(1);
    }

    console.log(`\n🔍 Inspection du fichier: ${pdfPath}\n`);

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    
    console.log(`📋 Nombre total de champs: ${fields.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LISTE DES CHAMPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    fields.forEach((field, index) => {
      const type = field.constructor.name;
      const name = field.getName();
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   Type: ${type}`);
      
      if (type === 'PDFTextField') {
        const textField = form.getTextField(name);
        console.log(`   Valeur par défaut: "${textField.getText() || '(vide)'}"`);
      } else if (type === 'PDFCheckBox') {
        const checkBox = form.getCheckBox(name);
        console.log(`   Coché: ${checkBox.isChecked()}`);
      } else if (type === 'PDFDropdown') {
        const dropdown = form.getDropdown(name);
        console.log(`   Options: ${dropdown.getOptions().join(', ')}`);
      } else if (type === 'PDFRadioGroup') {
        const radioGroup = form.getRadioGroup(name);
        console.log(`   Options: ${radioGroup.getOptions().join(', ')}`);
      }
      
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Astuce: Utilisez ces noms de champs dans documentGenerator.js');
    console.log('   pour adapter le code si les formulaires CERFA sont mis à jour.\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'inspection:', error.message);
    process.exit(1);
  }
}

// Récupération du chemin depuis les arguments
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error('❌ Usage: node src/utils/inspectCerfa.js <chemin_vers_pdf>');
  console.error('\nExemple:');
  console.error('  node src/utils/inspectCerfa.js ../public/cerfa/cerfa_15776_02.pdf');
  process.exit(1);
}

// Résolution du chemin
const resolvedPath = path.isAbsolute(pdfPath) 
  ? pdfPath 
  : path.resolve(__dirname, pdfPath);

inspectCerfa(resolvedPath);




