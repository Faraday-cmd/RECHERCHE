import React from 'react';

export interface ProviderSummary {
  id: string;
  name: string;
  role: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT';
  city: string;
  quarter?: string;
  distanceKm?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  avatarUrl?: string;
  campusesLabel?: string;
}

interface CompactProviderCardProps {
  provider: ProviderSummary;
  onSelect: (provider: ProviderSummary) => void;
}

export function CompactProviderCard({
  provider,
  onSelect,
}: CompactProviderCardProps) {
  const roleBadges: Record<
    ProviderSummary['role'],
    { label: string; bg: string; color: string; accentColor: string }
  > = {
    LEHRER: { label: 'Enseignant DSH/TestDaF', bg: '#F5F3FF', color: '#5B21B6', accentColor: '#7C3AED' },
    BETREUER: { label: 'Betreuer', bg: '#EFF6FF', color: '#1D4ED8', accentColor: '#3B82F6' },
    VISA_COMPANION: { label: 'Accompagnateur Visa', bg: '#FFFBEB', color: '#B45309', accentColor: '#F59E0B' },
    DEUTSCH_INSTITUT: { label: 'Institut d\'Allemand', bg: '#ECFDF5', color: '#047857', accentColor: '#10B981' },
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
        boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '94px',
        transition: 'all 0.2s ease',
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
      {/* Role Accent Bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: badge.accentColor,
        }}
      />

      {/* Left Avatar Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0, marginLeft: '4px' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: '#EDE9FE',
            color: '#5B21B6',
            fontWeight: 800,
            fontSize: '22px',
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
              fontWeight: 800,
            }}
            title="Prestataire Contrôlé"
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
            fontWeight: 800,
            color: '#0F172A',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.2px',
          }}
        >
          {provider.name}
        </h3>

        <div style={{ marginTop: '3px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
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
            gap: '10px',
            fontSize: '12px',
            color: '#64748B',
            marginTop: '5px',
          }}
        >
          <span>
            📍 {provider.role === 'DEUTSCH_INSTITUT' && provider.campusesLabel
              ? provider.campusesLabel
              : `${provider.city}${provider.quarter ? ` — ${provider.quarter}` : ''}`}
            {provider.distanceKm !== undefined ? ` (${provider.distanceKm} km)` : ''}
          </span>
          {provider.rating && (
            <span style={{ fontWeight: 700, color: '#D97706' }}>
              ★ {provider.rating} {provider.reviewCount ? `(${provider.reviewCount})` : ''}
            </span>
          )}
        </div>
      </div>

      {/* Right Action Button ("Voir ->" ALWAYS opens profile) */}
      <div style={{ flexShrink: 0 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(provider);
          }}
          style={{
            minHeight: '38px',
            padding: '0 14px',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 6px rgba(91, 33, 182, 0.2)',
          }}
        >
          <span>Voir</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}
