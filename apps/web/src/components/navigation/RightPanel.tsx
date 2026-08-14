import React from 'react';
import { ProviderSummary } from '../search/CompactProviderCard';

interface RightPanelProps {
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onOpenPassPro: () => void;
  selectedProvider?: ProviderSummary | null;
  onContactClick?: (provider: ProviderSummary) => void;
}

export function RightPanel({
  radiusKm,
  onRadiusChange,
  onOpenPassPro,
  selectedProvider,
  onContactClick,
}: RightPanelProps) {
  return (
    <aside
      className="desktop-right-panel"
      style={{
        width: '320px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        padding: '24px 18px',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
      }}
    >
      {selectedProvider ? (
        /* PROFILE-AWARE CONTEXTUAL PANEL */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-fade-in">
          {/* Header */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#5B21B6', letterSpacing: '0.5px' }}>
              PANNEAU CONTEXTUEL PROFIL
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {selectedProvider.name}
            </h3>
          </div>

          {/* Widget 1: Response SLA & Availability */}
          <div style={{ backgroundColor: '#F5F3FF', borderRadius: '14px', padding: '16px', border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#5B21B6' }}>
                Réactivité Garantie
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#4C1D95', lineHeight: 1.5 }}>
              Réponse habituelle en moins de 15 min. Disponible pour accompagnement immédiat.
            </div>
          </div>

          {/* Widget 2: Trust & Verified Credentials */}
          <div style={{ backgroundColor: '#ECFDF5', borderRadius: '14px', padding: '16px', border: '1px solid #A7F3D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🛡️</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>
                Vérification Officielle
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.5 }}>
              Identité, diplômes et agrément d&apos;accompagnement vérifiés par la plateforme RECHERCHE.
            </div>
          </div>

          {/* Widget 3: Quick Action Button */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              Besoin d&apos;un renseignement ?
            </div>
            <button
              onClick={() => onContactClick && onContactClick(selectedProvider)}
              style={{
                width: '100%',
                minHeight: '44px',
                backgroundColor: '#5B21B6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(91, 33, 182, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Envoyer un message</span>
              <span>💬</span>
            </button>
          </div>

        </div>
      ) : (
        /* DISCOVERY SPATIAL SEARCH PANEL */
        <>
          {/* Widget 1: Spatial Radius Widget */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Rayon de recherche (PostGIS)
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#5B21B6' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Widget 2: Trust & Ecosystem Verification */}
          <div style={{ backgroundColor: '#ECFDF5', borderRadius: '14px', padding: '16px', border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
              ✓ Prestataires Contrôlés
            </div>
            <p style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.4 }}>
              Tous les prestataires affichant le badge vert sont vérifiés auprès de l&apos;écosystème germano-africain.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
