'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/navigation/Header';
import { BottomNav, NavTab } from '../components/navigation/BottomNav';
import { CompactProviderCard, ProviderSummary } from '../components/search/CompactProviderCard';
import { FilterDrawer, FilterState } from '../components/search/FilterDrawer';
import { getClientEnv } from '../lib/env.config';

// Fallback Provider Data for Initial Render / Offline Baseline
const initialProviders: ProviderSummary[] = [
  {
    id: 'prov-1',
    name: 'Dr. Thomas MBIDA',
    role: 'BETREUER',
    city: 'Douala',
    distanceKm: 2.4,
    rating: 4.9,
    reviewCount: 28,
    verified: true,
  },
  {
    id: 'prov-2',
    name: 'Institut Goethe Partner Cameroon',
    role: 'DEUTSCH_INSTITUT',
    city: 'Yaoundé',
    distanceKm: 5.1,
    rating: 4.8,
    reviewCount: 64,
    verified: true,
  },
  {
    id: 'prov-3',
    name: 'Prof. Karl SCHMIDT',
    role: 'LEHRER',
    city: 'Douala',
    distanceKm: 1.8,
    rating: 5.0,
    reviewCount: 42,
    verified: true,
  },
  {
    id: 'prov-4',
    name: 'Cabinet Visa Germany Direct',
    role: 'VISA_COMPANION',
    city: 'Douala',
    distanceKm: 3.5,
    rating: 4.7,
    reviewCount: 19,
    verified: false,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('decouverte');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSummary | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    roleFilter: 'ALL',
    radiusKm: 10,
    verifiedOnly: false,
  });

  const [providers, setProviders] = useState<ProviderSummary[]>(initialProviders);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Providers from Production / Local NestJS API if available
  useEffect(() => {
    async function fetchProviders() {
      setIsLoading(true);
      try {
        const env = getClientEnv();
        const res = await fetch(`${env.apiUrl}/info/public`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map real API results if available
            console.log('[RECHERCHE API] Public items fetched:', data.length);
          }
        }
      } catch (e) {
        // Fallback to pre-rendered provider catalog seamlessly
      } finally {
        setIsLoading(false);
      }
    }
    fetchProviders();
  }, []);

  // Filter Providers locally based on state
  const filteredProviders = providers.filter((p) => {
    if (filters.roleFilter !== 'ALL' && p.role !== filters.roleFilter) return false;
    if (filters.verifiedOnly && !p.verified) return false;
    if (filters.radiusKm && p.distanceKm && p.distanceKm > filters.radiusKm) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Shell Header */}
      <Header />

      {/* Main Content Area */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        {/* Search Bar & Filter Trigger */}
        <section style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ position: 'absolute', left: '14px', fontSize: '16px', color: '#94A3B8' }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Rechercher enseignant, betreuer, institut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '46px',
                  paddingLeft: '42px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
                }}
              />
            </div>
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{
                minHeight: '46px',
                padding: '0 14px',
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: '10px',
                color: '#5B21B6',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚙️</span>
              <span>Filtres</span>
              {filters.roleFilter !== 'ALL' && (
                <span
                  style={{
                    backgroundColor: '#5B21B6',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    width: '6px',
                    height: '6px',
                  }}
                />
              )}
            </button>
          </div>
        </section>

        {/* Quick Category Filter Pills */}
        <section style={{ marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
            {[
              { id: 'ALL', label: 'Tous' },
              { id: 'LEHRER', label: 'Enseignants' },
              { id: 'BETREUER', label: 'Betreuer & Logement' },
              { id: 'VISA_COMPANION', label: 'Compagnons Visa' },
              { id: 'DEUTSCH_INSTITUT', label: 'Instituts' },
            ].map((cat) => {
              const isSelected = filters.roleFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, roleFilter: cat.id })}
                  style={{
                    minHeight: '36px',
                    padding: '0 12px',
                    borderRadius: '9999px',
                    border: isSelected ? '1px solid #5B21B6' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#5B21B6' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 2px 4px rgba(91, 33, 182, 0.15)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section Title & Result Count */}
        <section style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Prestataires à proximité
          </h2>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {filteredProviders.length} trouvé(s)
          </span>
        </section>

        {/* Compact Provider Cards List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredProviders.length > 0 ? (
            filteredProviders.map((p) => (
              <CompactProviderCard
                key={p.id}
                provider={p}
                onSelect={(selected) => setSelectedProvider(selected)}
              />
            ))
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '32px 16px',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔎</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Aucun prestataire trouvé
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '300px', margin: '0 auto 16px auto' }}>
                Essayez d&apos;élargir votre rayon de recherche ou de réinitialiser vos filtres.
              </p>
              <button
                onClick={() => setFilters({ roleFilter: 'ALL', radiusKm: 50, verifiedOnly: false })}
                style={{
                  minHeight: '38px',
                  padding: '0 16px',
                  backgroundColor: '#F5F3FF',
                  color: '#5B21B6',
                  border: '1px solid #DDD6FE',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        {/* Provider Detail Drawer (Progressive Disclosure Modal) */}
        {selectedProvider && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div
              onClick={() => setSelectedProvider(null)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <div
              className="animate-slide-up"
              style={{
                position: 'relative',
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '24px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.12)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  backgroundColor: '#CBD5E1',
                  borderRadius: '9999px',
                  margin: '0 auto 16px auto',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedProvider.name}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    📍 {selectedProvider.city} • {selectedProvider.distanceKm} km
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    borderRadius: '9999px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#F5F3FF',
                    color: '#5B21B6',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  {selectedProvider.role}
                </span>
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: '#D97706' }}>
                  ★ {selectedProvider.rating} ({selectedProvider.reviewCount} avis)
                </span>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '14px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  À propos du prestataire
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Prestataire certifié de l&apos;écosystème germano-africain disponible pour accompagnement, cours et conseils d&apos;orientation.
                </p>
              </div>

              <button
                onClick={() => {
                  alert(`Ouverture du chat avec ${selectedProvider.name}`);
                  setSelectedProvider(null);
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
                Envoyer un message direct
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Filter Drawer Sheet */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
    </div>
  );
}
