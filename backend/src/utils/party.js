/**
 * Helpers pro / particulier pour vendeur (societe) et acheteur (client).
 */

export function partyType(party = {}) {
  return party.type === 'pro' ? 'pro' : 'particulier';
}

/** Identité affichée sur les documents */
export function partyDisplayName(party = {}) {
  if (partyType(party) === 'pro') {
    return String(party.raisonSociale || '').trim();
  }
  const full = `${party.prenom || ''} ${party.nom || ''}`.trim();
  return full || String(party.raisonSociale || '').trim();
}

/** SIRET uniquement pour un professionnel */
export function partySiret(party = {}) {
  if (partyType(party) !== 'pro') return '';
  return String(party.siret || '').replace(/\s/g, '');
}

export function isPro(party) {
  return partyType(party) === 'pro';
}

export function isParticulier(party) {
  return partyType(party) !== 'pro';
}
