import React, { useState } from 'react';

export function Header() {
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
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Brand Identity */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#5B21B6',
              letterSpacing: '-0.5px',
            }}
          >
            RECHERCHE
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#F5F3FF',
              color: '#5B21B6',
              padding: '2px 6px',
              borderRadius: '9999px',
              border: '1px solid #DDD6FE',
            }}
          >
            V1
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', marginTop: '1px' }}>
          « L&apos;information est la clé »
        </div>
      </div>

      {/* Right Controls: Location Pill & Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* City Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#334155',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '4px 8px',
            borderRadius: '9999px',
          }}
        >
          <span>📍</span>
          <span>Douala</span>
        </div>

        {/* Language Switcher Button */}
        <button
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
