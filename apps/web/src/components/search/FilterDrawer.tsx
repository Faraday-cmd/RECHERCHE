import React from 'react';

export interface FilterState {
  roleFilter: string;
  radiusKm: number;
  verifiedOnly: boolean;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Keyboard Escape Key Accessibility Handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roles = [
    { id: 'ALL', label: 'Tous les prestataires' },
    { id: 'LEHRER', label: 'Enseignants d\'Allemand (DSH / TestDaF)' },
    { id: 'BETREUER', label: 'Betreuer & Logement étudiant' },
    { id: 'VISA_COMPANION', label: 'Compagnons Demande de Visa' },
    { id: 'DEUTSCH_INSTITUT', label: 'Instituts d\'Allemand' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
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
          padding: '20px 20px 32px 20px',
          boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.12)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '36px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '9999px', margin: '0 auto 16px auto' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 id="filter-drawer-title" style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Filtres de recherche
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

        {/* Filter Section 1: Role Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Catégorie de prestataire
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map((r) => {
              const isSelected = localFilters.roleFilter === r.id;
              return (
                <button
                  key={r.id}
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

        {/* Filter Section 2: PostGIS Radius Slider */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="radius-slider" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Rayon de recherche géographique
            </label>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#5B21B6' }}>
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

        {/* Apply Action Button */}
        <button
          onClick={() => {
            onApplyFilters(localFilters);
            onClose();
          }}
          style={{
            width: '100%',
            minHeight: '48px',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
}
