import ExcelJS from 'exceljs';

function val(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return '';
}

function partyName(party = {}) {
  const company = val(party, 'raisonSociale');
  const person = [val(party, 'prenom'), val(party, 'nom')].filter(Boolean).join(' ');
  return company || person || '';
}

/**
 * Construit un fichier .xlsx (Buffer) à partir des documents enregistrés.
 */
export async function buildDocumentsWorkbook(documents = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ActeDeVente.fr';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Saisies clients', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheet.columns = [
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Source', key: 'source', width: 12 },
    { header: 'Type document', key: 'type', width: 16 },
    { header: 'Fichier', key: 'fileName', width: 28 },
    { header: 'Compte email', key: 'userEmail', width: 28 },
    { header: 'Compte nom', key: 'userName', width: 22 },
    { header: 'Vendeur / Société', key: 'vendeur', width: 24 },
    { header: 'Vendeur type', key: 'vendeurType', width: 12 },
    { header: 'Vendeur SIRET', key: 'vendeurSiret', width: 16 },
    { header: 'Vendeur email', key: 'vendeurEmail', width: 24 },
    { header: 'Vendeur téléphone', key: 'vendeurTel', width: 16 },
    { header: 'Vendeur adresse', key: 'vendeurAdresse', width: 28 },
    { header: 'Vendeur CP', key: 'vendeurCp', width: 10 },
    { header: 'Vendeur ville', key: 'vendeurVille', width: 16 },
    { header: 'Acheteur', key: 'acheteur', width: 24 },
    { header: 'Acheteur type', key: 'acheteurType', width: 12 },
    { header: 'Acheteur SIRET', key: 'acheteurSiret', width: 16 },
    { header: 'Acheteur email', key: 'acheteurEmail', width: 24 },
    { header: 'Acheteur téléphone', key: 'acheteurTel', width: 16 },
    { header: 'Acheteur adresse', key: 'acheteurAdresse', width: 28 },
    { header: 'Acheteur CP', key: 'acheteurCp', width: 10 },
    { header: 'Acheteur ville', key: 'acheteurVille', width: 16 },
    { header: 'Acheteur naissance', key: 'acheteurNaissance', width: 14 },
    { header: 'Acheteur lieu naissance', key: 'acheteurLieuNaissance', width: 18 },
    { header: 'Marque', key: 'marque', width: 14 },
    { header: 'Modèle', key: 'modele', width: 14 },
    { header: 'Immatriculation', key: 'immat', width: 14 },
    { header: 'VIN', key: 'vin', width: 20 },
    { header: '1ère immat', key: 'premiereImmat', width: 12 },
    { header: 'Kilométrage', key: 'km', width: 12 },
    { header: 'Couleur', key: 'couleur', width: 12 },
    { header: 'Date vente', key: 'dateVente', width: 12 },
    { header: 'Prix TTC', key: 'prix', width: 12 },
    { header: 'Mode paiement', key: 'paiement', width: 14 },
    { header: 'N° facture', key: 'facture', width: 14 },
    { header: 'Lieu signature', key: 'lieuSignature', width: 16 },
    { header: 'Vendeur UE', key: 'vendeurUE', width: 22 },
    { header: 'Vendeur UE TVA', key: 'vendeurUETva', width: 16 },
    { header: 'Vendeur UE pays', key: 'vendeurUEPays', width: 12 }
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', wrapText: true };

  for (const doc of documents) {
    const client = doc.clientData || {};
    const societe = doc.societeData || {};
    const vehicule = doc.vehiculeData || {};
    const vente = doc.venteData || {};
    const vendeurUE = doc.vendeurUEData || {};
    const user = doc.userId && typeof doc.userId === 'object' ? doc.userId : null;

    sheet.addRow({
      date: doc.createdAt ? new Date(doc.createdAt).toLocaleString('fr-FR') : '',
      source: doc.source === 'public' ? 'Public' : 'Compte',
      type: doc.type || '',
      fileName: doc.fileName || '',
      userEmail: user?.email || (doc.source === 'public' ? '(sans compte)' : ''),
      userName: user ? [user.prenom, user.nom].filter(Boolean).join(' ') : '',
      vendeur: partyName(societe),
      vendeurType: val(societe, 'type'),
      vendeurSiret: val(societe, 'siret'),
      vendeurEmail: val(societe, 'email'),
      vendeurTel: val(societe, 'telephone'),
      vendeurAdresse: val(societe, 'adresse'),
      vendeurCp: val(societe, 'codePostal'),
      vendeurVille: val(societe, 'ville'),
      acheteur: partyName(client),
      acheteurType: val(client, 'type'),
      acheteurSiret: val(client, 'siret'),
      acheteurEmail: val(client, 'email'),
      acheteurTel: val(client, 'telephone'),
      acheteurAdresse: val(client, 'adresse'),
      acheteurCp: val(client, 'codePostal'),
      acheteurVille: val(client, 'ville'),
      acheteurNaissance: val(client, 'dateNaissance'),
      acheteurLieuNaissance: val(client, 'lieuNaissance'),
      marque: val(vehicule, 'marque'),
      modele: val(vehicule, 'modele'),
      immat: val(vehicule, 'immatriculation'),
      vin: val(vehicule, 'vin'),
      premiereImmat: val(vehicule, 'datePremiereImmat'),
      km: val(vehicule, 'kilometrage'),
      couleur: val(vehicule, 'couleur'),
      dateVente: val(vente, 'dateVente'),
      prix: val(vente, 'prixTTC'),
      paiement: val(vente, 'modePaiement'),
      facture: val(vente, 'numeroFacture'),
      lieuSignature: val(vente, 'lieuSignature'),
      vendeurUE: partyName(vendeurUE) || val(vendeurUE, 'raisonSociale'),
      vendeurUETva: val(vendeurUE, 'numeroTVA'),
      vendeurUEPays: val(vendeurUE, 'pays')
    });
  }

  return workbook.xlsx.writeBuffer();
}
