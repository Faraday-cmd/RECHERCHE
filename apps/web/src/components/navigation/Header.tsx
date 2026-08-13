import React, { useState } from 'react';

export interface HeaderProps {
  currentCity?: string;
  onLocationClick?: () => void;
}

export function Header({ currentCity, onLocationClick }: HeaderProps = {}) {
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Right Controls: Location Pill & Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* City Indicator Badge (Display only - location modified uniquely in Mon Profil) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#5B21B6',
            backgroundColor: '#F5F3FF',
            border: '1px solid #DDD6FE',
            padding: '5px 12px',
            borderRadius: '9999px',
            userSelect: 'none',
          }}
        >
          <span>📍</span>
          <span>{currentCity || 'Douala'}</span>
        </div>

        {/* Language Switcher Button */}
        <button
          type="button"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          style={{
            minHeight: '36px',
            padding: '0 10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#5B21B6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Changer de langue"
        >
          {locale.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
