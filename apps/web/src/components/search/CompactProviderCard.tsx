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
        borderRadius: '16px',
        padding: '14px 16px',
        boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: '92px',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Voir le profil de ${provider.name}, ${badge.label}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(provider);
        }
      }}
    >
      {/* Left Avatar Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#EDE9FE',
            color: '#5B21B6',
            fontWeight: 800,
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #DDD6FE',
            overflow: 'hidden',
          }}
        >
          {provider.avatarUrl ? (
            <img src={provider.avatarUrl} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            provider.name.charAt(0)
          )}
        </div>
        {provider.verified && (
          <span
            style={{
              position: 'absolute',
              bottom: '-3px',
              right: '-3px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              fontSize: '10px',
              width: '18px',
              height: '18px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFFFFF',
              fontWeight: 700,
            }}
            title="Prestataire Vérifié"
          >
            ✓
          </span>
        )}
      </div>

      {/* Center Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
            <span style={{ fontWeight: 700, color: '#D97706' }}>
              ★ {provider.rating} {provider.reviewCount ? `(${provider.reviewCount})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Right Primary Action Button */}
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
            minHeight: '38px',
            padding: '0 14px',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(91, 33, 182, 0.15)',
          }}
        >
          <span>Voir</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}
