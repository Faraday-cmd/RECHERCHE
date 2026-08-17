import React, { useState, useEffect } from 'react';

export interface FilterState {
  roleFilter: string;
  radiusKm: number;
  verifiedOnly: boolean;
  country?: string;
  city?: string;
  quarter?: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
}

const COUNTRIES = [
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Cameroun: ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Dschang', 'Maroua', 'Ngaoundéré', 'Buea'],
  Allemagne: ['Berlin', 'München', 'Frankfurt', 'Hamburg', 'Köln', 'Stuttgart', 'Leipzig'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux'],
  Gabon: ['Libreville', 'Port-Gentil'],
  "Côte d'Ivoire": ['Abidjan', 'Yamoussoukro'],
};

const QUARTERS_BY_CITY: Record<string, string[]> = {
  Douala: ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'Makepe', 'Logbessou', 'Beedi', 'Ndogpassi', 'Bonamoussadi', 'Kotto', 'Bépanda', 'PK10/PK12/PK14', 'Yassa', 'Ndokoti'],
  Yaoundé: ['Bastos', 'Ngoa-Ekelle', 'Biyem-Assi', 'Mvan', 'Odza', 'Essos', 'Mendong', 'Omnisports', 'Melen', 'Nsam', 'Emana', 'Jouvence', 'Nkolbisson'],
  Bafoussam: ['Tamdja', 'Djeleng', 'Kouogouo', 'Haoussa', 'Bamendzi', 'Sokourjou'],
  Garoua: ['Roumde Adjia', 'Poumpoumre', 'Grand Marché', 'Lainde', 'Yelwa'],
  Bamenda: ['Commercial Avenue', 'Up Station', 'Nkwen', 'Mankon', 'Bambili'],
  Dschang: ['Campus', 'Foroke', 'Keleng', 'Sinotex', 'Bafou'],
  Berlin: ['Mitte', 'Kreuzberg', 'Neukölln', 'Charlottenburg', 'Prenzlauer Berg'],
  München: ['Altstadt', 'Schwabing', 'Maxvorstadt', 'Sendling'],
  Paris: ['1er Arrondissement', 'Le Marais', 'Montmartre', 'Latin Quarter'],
};

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...filters,
    country: filters.country || 'Cameroun',
    city: filters.city || 'Douala',
    quarter: filters.quarter || 'ALL',
  });

  const [isCustomCityActive, setIsCustomCityActive] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [isCustomQuarterActive, setIsCustomQuarterActive] = useState(false);
  const [customQuarterInput, setCustomQuarterInput] = useState('');

  useEffect(() => {
    setLocalFilters({
      ...filters,
      country: filters.country || 'Cameroun',
      city: filters.city || 'Douala',
      quarter: filters.quarter || 'ALL',
    });
  }, [filters]);

  // Automatic country localization detection
  useEffect(() => {
    if (!filters.country) {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timeZone.includes('Berlin') || timeZone.includes('Europe/Berlin')) {
          setLocalFilters((prev) => ({ ...prev, country: 'Allemagne' }));
        } else if (timeZone.includes('Paris') || timeZone.includes('Europe/Paris')) {
          setLocalFilters((prev) => ({ ...prev, country: 'France' }));
        } else {
          setLocalFilters((prev) => ({ ...prev, country: 'Cameroun' }));
        }
      } catch (e) {
        setLocalFilters((prev) => ({ ...prev, country: 'Cameroun' }));
      }
    }
  }, [filters.country]);

  // Keyboard Escape Key Accessibility Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCountry = localFilters.country || 'Cameroun';
  const availableCities = CITIES_BY_COUNTRY[currentCountry] || CITIES_BY_COUNTRY['Cameroun'];
  const currentCity = localFilters.city || 'Douala';
  const availableQuarters = QUARTERS_BY_CITY[currentCity] || [];

  const roles = [
    { id: 'ALL', label: 'Tous les prestataires' },
    { id: 'LEHRER', label: 'Enseignants d\'Allemand (DSH / TestDaF)' },
    { id: 'BETREUER', label: 'Betreuer' },
    { id: 'VISA_COMPANION', label: 'Accompagnateurs Demande de Visa' },
    { id: 'DEUTSCH_INSTITUT', label: 'Instituts d\'Allemand' },
  ];

  const currentFlag = COUNTRIES.find((c) => c.name === currentCountry)?.flag || '🇨🇲';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-drawer-title"
    >
      {/* Backdrop Dimmer */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -4px 24px rgba(15, 23, 42, 0.18)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10001,
        }}
      >
        {/* Scrollable Filter Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 16px 20px' }}>
          <div style={{ width: '36px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '9999px', margin: '0 auto 16px auto' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 id="filter-drawer-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Filtres & Localisation de Recherche
            </h2>
            <button
              onClick={onClose}
              aria-label="Fermer les filtres"
              style={{
                backgroundColor: '#F1F5F9',
                border: 'none',
                borderRadius: '9999px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#64748B',
              }}
            >
              ✕
            </button>
          </div>

          {/* AUTOMATIC COUNTRY LOCALIZATION BANNER */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#F5F3FF',
              borderRadius: '14px',
              border: '1px solid #DDD6FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>{currentFlag}</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Localisation Détectée Automatiquement
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  {currentCountry} <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>(GPS / IP Actif)</span>
                </div>
              </div>
            </div>
            <select
              value={currentCountry}
              onChange={(e) => {
                const newCountry = e.target.value;
                const newCities = CITIES_BY_COUNTRY[newCountry] || [];
                setLocalFilters({
                  ...localFilters,
                  country: newCountry,
                  city: newCities[0] || 'ALL',
                  quarter: 'ALL',
                });
              }}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#5B21B6',
                border: '1px solid #DDD6FE',
                borderRadius: '8px',
                padding: '4px 8px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Section 1: City */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
              🏙️ 1. Ville
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, city: 'ALL', quarter: 'ALL' })}
                style={{
                  minHeight: '36px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: localFilters.city === 'ALL' ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                  backgroundColor: localFilters.city === 'ALL' ? '#F5F3FF' : '#FFFFFF',
                  color: localFilters.city === 'ALL' ? '#5B21B6' : '#475569',
                  fontWeight: localFilters.city === 'ALL' ? 800 : 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Toutes les villes de {currentCountry}
              </button>

              {availableCities.map((city) => {
                const isSelected = localFilters.city === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, city, quarter: 'ALL' })}
                    style={{
                      minHeight: '36px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                      color: isSelected ? '#5B21B6' : '#0F172A',
                      fontWeight: isSelected ? 800 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Section 2: Quarter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
              📍 2. Quartier / Zone Spécifique
            </label>

            {localFilters.city !== 'ALL' ? (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomQuarterActive(false);
                      setLocalFilters({ ...localFilters, quarter: 'ALL' });
                    }}
                    style={{
                      minHeight: '36px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: !isCustomQuarterActive && localFilters.quarter === 'ALL' ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                      backgroundColor: !isCustomQuarterActive && localFilters.quarter === 'ALL' ? '#F5F3FF' : '#FFFFFF',
                      color: !isCustomQuarterActive && localFilters.quarter === 'ALL' ? '#5B21B6' : '#475569',
                      fontWeight: !isCustomQuarterActive && localFilters.quarter === 'ALL' ? 800 : 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Tous les quartiers de {localFilters.city}
                  </button>

                  {availableQuarters.map((qtr) => {
                    const isSelected = !isCustomQuarterActive && localFilters.quarter === qtr;
                    return (
                      <button
                        key={qtr}
                        type="button"
                        onClick={() => {
                          setIsCustomQuarterActive(false);
                          setLocalFilters({ ...localFilters, quarter: qtr });
                        }}
                        style={{
                          minHeight: '36px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                          color: isSelected ? '#5B21B6' : '#0F172A',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {qtr}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCustomQuarterActive(!isCustomQuarterActive)}
                    style={{
                      minHeight: '36px',
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: isCustomQuarterActive ? '2px solid #5B21B6' : '1px dashed #5B21B6',
                      backgroundColor: isCustomQuarterActive ? '#F5F3FF' : '#FFFFFF',
                      color: '#5B21B6',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    + Autre quartier
                  </button>
                </div>

                {isCustomQuarterActive && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={customQuarterInput}
                      onChange={(e) => {
                        setCustomQuarterInput(e.target.value);
                        setLocalFilters({ ...localFilters, quarter: e.target.value.trim() || 'ALL' });
                      }}
                      placeholder={`Saisissez le nom du quartier à ${localFilters.city}...`}
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '0 14px',
                        borderRadius: '10px',
                        border: '1px solid #5B21B6',
                        fontSize: '13px',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                Sélectionnez d&apos;abord une ville ci-dessus pour choisir un quartier spécifique.
              </p>
            )}
          </div>

          {/* Filter Section 3: Role Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
              🏷️ 3. Catégorie de prestataire
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map((r) => {
                const isSelected = localFilters.roleFilter === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setLocalFilters({ ...localFilters, roleFilter: r.id })}
                    style={{
                      minHeight: '44px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                      color: isSelected ? '#5B21B6' : '#0F172A',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{r.label}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Section 4: Radius Slider */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="radius-slider" style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                🎯 4. Rayon de recherche géographique
              </label>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B21B6' }}>
                {localFilters.radiusKm} km
              </span>
            </div>
            <input
              id="radius-slider"
              type="range"
              min="1"
              max="50"
              value={localFilters.radiusKm}
              onChange={(e) => setLocalFilters({ ...localFilters, radiusKm: parseInt(e.target.value, 10) })}
              style={{ width: '100%', accentColor: '#5B21B6', height: '6px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* PINNED STICKY FOOTER FOR APPLY BUTTON */}
        <div
          style={{
            padding: '12px 20px calc(16px + env(safe-area-inset-bottom, 0px)) 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onApplyFilters(localFilters);
              onClose();
            }}
            style={{
              width: '100%',
              minHeight: '50px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(91, 33, 182, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>🔍</span>
            <span>Rechercher dans cette zone</span>
          </button>
        </div>
      </div>
    </div>
  );
}
