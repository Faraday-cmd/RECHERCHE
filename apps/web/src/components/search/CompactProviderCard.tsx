import React from 'react';

export interface ProviderSummary {
  id: string;
  name: string;
  role: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT';
  city: string;
  distanceKm?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  avatarUrl?: string;
}

interface CompactProviderCardProps {
  provider: ProviderSummary;
  onSelect: (provider: ProviderSummary) => void;
  onContactClick?: (provider: ProviderSummary, e: React.MouseEvent) => void;
}

export function CompactProviderCard({
  provider,
  onSelect,
  onContactClick,
}: CompactProviderCardProps) {
  // Role Label & Color Badge Mapping
  const roleBadges: Record<
    ProviderSummary['role'],
    { label: string; bg: string; color: string }
  > = {
    LEHRER: { label: 'Enseignant DSH/TestDaF', bg: '#F5F3FF', color: '#5B21B6' },
    BETREUER: { label: 'Betreuer & Logement', bg: '#EFF6FF', color: '#1D4ED8' },
    VISA_COMPANION: { label: 'Compagnon Visa', bg: '#FFFBEB', color: '#B45309' },
    DEUTSCH_INSTITUT: { label: 'Institut d\'Allemand', bg: '#ECFDF5', color: '#047857' },
  };

  const badge = roleBadges[provider.role];

  return (
    <article
      onClick={() => onSelect(provider)}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '12px 14px',
        boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: '88px', // Flexible minimum height target without clipping text
      }}
    >
      {/* Left Avatar Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '9999px',
            backgroundColor: '#EDE9FE',
            color: '#5B21B6',
            fontWeight: 700,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #DDD6FE',
          }}
        >
          {provider.name.charAt(0)}
        </div>
        {provider.verified && (
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '10px',
              width: '16px',
              height: '16px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
            }}
            title="Prestataire Vérifié"
          >
            ✓
          </span>
        )}
      </div>

      {/* Center Details Block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {provider.name}
          </h3>
        </div>

        {/* Profession Tag Badge */}
        <div style={{ marginTop: '2px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: badge.bg,
              color: badge.color,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-block',
            }}
          >
            {badge.label}
          </span>
        </div>

        {/* Meta Info: Distance & Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748B',
            marginTop: '4px',
          }}
        >
          <span>📍 {provider.city} {provider.distanceKm !== undefined ? `(${provider.distanceKm} km)` : ''}</span>
          {provider.rating && (
            <span style={{ fontWeight: 600, color: '#D97706' }}>
              ★ {provider.rating} {provider.reviewCount ? `(${provider.reviewCount})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Right Primary CTA Button */}
      <div style={{ flexShrink: 0 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onContactClick) {
              onContactClick(provider, e);
            } else {
              onSelect(provider);
            }
          }}
          style={{
            minHeight: '36px',
            padding: '0 12px',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 2px 0 rgba(91, 33, 182, 0.2)',
          }}
        >
          <span>Voir</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}
