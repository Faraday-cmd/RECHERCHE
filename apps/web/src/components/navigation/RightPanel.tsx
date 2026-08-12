import React from 'react';

interface RightPanelProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onOpenPassPro: () => void;
}

export function RightPanel({
  radiusKm,
  onRadiusChange,
  onOpenPassPro,
}: RightPanelProps) {
  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: '300px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        padding: '24px 16px',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Widget 1: Spatial Radius Widget */}
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
            Rayon de recherche (PostGIS)
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6' }}>
            {radiusKm} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={radiusKm}
          onChange={(e) => onRadiusChange(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: '#5B21B6', height: '6px', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
          <span>1 km</span>
          <span>25 km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Widget 2: Mobile Money Payment Prompt */}
      <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '16px', border: '1px solid #FDE68A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#B45309', marginBottom: '4px' }}>
          <span>📲</span>
          <span>Recharge Mobile Money</span>
        </div>
        <p style={{ fontSize: '12px', color: '#92400E', lineHeight: 1.4, marginBottom: '12px' }}>
          Paiement rapide instantané via Orange Money (#150#) ou MTN MoMo (*126#).
        </p>
        <button
          onClick={onOpenPassPro}
          style={{
            width: '100%',
            minHeight: '38px',
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Ouvrir le guichet USSD
        </button>
      </div>

      {/* Widget 3: Trust & Ecosystem Verification */}
      <div style={{ backgroundColor: '#ECFDF5', borderRadius: '12px', padding: '16px', border: '1px solid #A7F3D0' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
          ✓ Prestataires Contrôlés
        </div>
        <p style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.4 }}>
          Tous les prestataires affichant le badge vert sont vérifiés auprès de l&apos;écosystème germano-africain.
        </p>
      </div>
    </aside>
  );
}
