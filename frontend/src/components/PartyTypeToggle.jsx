import React from 'react';
import './PartyTypeToggle.css';

/**
 * Sélecteur Professionnel / Particulier
 */
export default function PartyTypeToggle({ id, label, value, onChange }) {
  const current = value === 'pro' ? 'pro' : 'particulier';
  return (
    <div className="party-type" role="group" aria-label={label}>
      {label && <p className="party-type-label">{label}</p>}
      <div className="party-type-options">
        <button
          type="button"
          id={`${id}-particulier`}
          className={`party-type-btn ${current === 'particulier' ? 'active' : ''}`}
          onClick={() => onChange('particulier')}
          aria-pressed={current === 'particulier'}
        >
          Particulier
        </button>
        <button
          type="button"
          id={`${id}-pro`}
          className={`party-type-btn ${current === 'pro' ? 'active' : ''}`}
          onClick={() => onChange('pro')}
          aria-pressed={current === 'pro'}
        >
          Professionnel
        </button>
      </div>
    </div>
  );
}
