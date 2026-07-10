/**
 * Script pour analyser tous les PDFs CERFA et générer un mapping
 */

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERFA_DIR = path.join(__dirname, '../../public/cerfa');

async function analyzeAllCerfa() {
  console.log('\n🔍 Analyse de tous les PDFs CERFA...\n');
  
  const files = fs.readdirSync(CERFA_DIR).filter(f => 
    f.toLowerCase().endsWith('.pdf') && 
    !f.startsWith('.') &&
    !f.toLowerCase().includes('test') &&
    !f.toLowerCase().includes('mapping')
  );

  const analysis = {};

  for (const file of files) {
    const filePath = path.join(CERFA_DIR, file);
    console.log(`\n📄 Analyse de: ${file}`);
    console.log('─'.repeat(60));
    
    try {
      const pdfBytes = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      analysis[file] = {
        totalFields: fields.length,
        fields: fields.map(f => ({
          name: f.getName(),
          type: f.constructor.name
        }))
      };
      
      console.log(`✅ ${fields.length} champs trouvés`);
      fields.slice(0, 10).forEach((field, i) => {
        console.log(`   ${i + 1}. ${field.getName()} (${field.constructor.name})`);
      });
      if (fields.length > 10) {
        console.log(`   ... et ${fields.length - 10} autres champs`);
      }
      
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
      analysis[file] = { error: error.message };
    }
  }

  // Générer un rapport
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RAPPORT D\'ANALYSE');
  console.log('='.repeat(60));
  
  for (const [file, data] of Object.entries(analysis)) {
    if (data.error) {
      console.log(`\n❌ ${file}: ERREUR - ${data.error}`);
    } else {
      console.log(`\n✅ ${file}: ${data.totalFields} champs`);
    }
  }

  // Sauvegarder l'analyse
  const reportPath = path.join(__dirname, '../../cerfa_analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
  
  return analysis;
}

analyzeAllCerfa().catch(console.error);

