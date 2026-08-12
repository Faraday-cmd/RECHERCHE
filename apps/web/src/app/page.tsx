'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/navigation/Header';
import { BottomNav, NavTab } from '../components/navigation/BottomNav';
import { CompactProviderCard, ProviderSummary } from '../components/search/CompactProviderCard';
import { FilterDrawer, FilterState } from '../components/search/FilterDrawer';
import { IndividualProviderProfile } from '../components/provider/IndividualProviderProfile';
import { DeutschInstitutProfile } from '../components/provider/DeutschInstitutProfile';
import { ProviderDashboard } from '../components/provider/ProviderDashboard';
import { ConversationList, ConversationItem } from '../components/messaging/ConversationList';
import { PassProPaymentModal } from '../components/subscription/PassProPaymentModal';
import { getClientEnv } from '../lib/env.config';

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

const mockConversations: ConversationItem[] = [
  {
    id: 'conv-1',
    type: 'USER_PROVIDER',
    recipientName: 'Dr. Thomas MBIDA',
    recipientRole: 'Betreuer & Logement',
    lastMessage: 'Bonjour ! Les réservations de chambre à Yaoundé sont ouvertes.',
    updatedAt: '10:42',
    unreadCount: 1,
  },
  {
    id: 'conv-2',
    type: 'USER_PROVIDER',
    recipientName: 'Prof. Karl SCHMIDT',
    recipientRole: 'Enseignant DSH/TestDaF',
    lastMessage: 'La prochaine session intensive d\'Allemand B2 débute lundi.',
    updatedAt: 'Hier',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('decouverte');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSummary | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    roleFilter: 'ALL',
    radiusKm: 10,
    verifiedOnly: false,
  });

  const [providers, setProviders] = useState<ProviderSummary[]>(initialProviders);

  useEffect(() => {
    async function fetchPublicInfo() {
      try {
        const env = getClientEnv();
        const res = await fetch(`${env.apiUrl}/info/public`);
        if (res.ok) {
          const data = await res.json();
          console.log('[RECHERCHE LIVE API] Fetched public announcements:', data.length);
        }
      } catch (e) {
        // Safe fallback
      }
    }
    fetchPublicInfo();
  }, []);

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

      {/* Main Content Body */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        {/* TAB 1: DÉCOUVERTE (FEED & SPATIAL SEARCH) */}
        {activeTab === 'decouverte' && (
          <div>
            {/* Search Input & Filter Trigger */}
            <section style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                </button>
              </div>
            </section>

            {/* Category Filter Pills */}
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
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Title Bar */}
            <section style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Prestataires à proximité
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                {filteredProviders.length} résultat(s)
              </span>
            </section>

            {/* Compact Cards List */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProviders.map((p) => (
                <CompactProviderCard
                  key={p.id}
                  provider={p}
                  onSelect={(sel) => setSelectedProvider(sel)}
                />
              ))}
            </section>
          </div>
        )}

        {/* TAB 2: PRESTATAIRES (CATALOG & PROFILE VIEWS) */}
        {activeTab === 'prestataires' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Profils des Prestataires Vérifiés
            </h2>
            <IndividualProviderProfile
              id="prov-1"
              roleCode="BETREUER"
              roleName="Betreuer & Logement Étudiant"
              displayName="Dr. Thomas MBIDA"
              shortBio="Accompagnateur spécialisé pour l'installation, les démarches universitaires et la réservation de logement en Allemagne."
              fullDescription={`Spécialiste de la mobilité estudiantine germano-camerounaise depuis 2018.\n\nServices proposés:\n- Recherche et réservation de chambre d'étudiant (Wohnheim/WG)\n- Prise en charge à l'aéroport et accompagnement inscription ville (Bürgeramt)\n- Assistance ouverture compte bloqué bancaire.`}
              city="Douala"
              distanceKm={2.4}
              rating={4.9}
              reviewCount={28}
              verified={true}
              onContactClick={() => setActiveTab('messages')}
            />

            <DeutschInstitutProfile
              id="prov-2"
              displayName="Institut Goethe Partner Cameroon"
              shortBio="Centre d'excellence pour l'apprentissage de la langue allemande et la préparation aux épreuves du Goethe-Zertifikat A1-C1."
              fullDescription={`L'Institut Goethe Partner Cameroon forme chaque année plus de 800 étudiants aux exigences linguistiques et culturelles allemandes.\n\nNos engagements:\n- Enseignants certifiés et matériel pédagogique moderne\n- Examens blancs hebdomadaires gratuits pour nos abonnés\n- Salles de cours climatisées et médiathèque ouverte 6j/7.`}
              onContactClick={() => setActiveTab('messages')}
            />
          </div>
        )}

        {/* TAB 3: MESSAGES (ROLE-ISOLATED CHAT INBOX) */}
        {activeTab === 'messages' && (
          <div>
            <ConversationList
              conversations={mockConversations}
              onSelect={(id) => alert(`Ouverture de la conversation ${id}`)}
              activeRoleContextName="Apprenant / Candidat"
            />
          </div>
        )}

        {/* TAB 4: PASS PRO (SUBSCRIPTIONS & USSD PAYMENT GATEWAY) */}
        {activeTab === 'pass' && (
          <div>
            <ProviderDashboard
              unlockedRoles={[
                { userRoleId: 'ur-1', roleCode: 'LEHRER', roleName: 'Enseignant DSH/TestDaF', status: 'ACTIVE', isConfigured: true, publicationStatus: 'PUBLISHED' },
                { userRoleId: 'ur-2', roleCode: 'BETREUER', roleName: 'Betreuer Logement', status: 'ACTIVE', isConfigured: true, publicationStatus: 'CONFIGURED' },
              ]}
              activeRole={{ userRoleId: 'ur-1', roleCode: 'LEHRER', roleName: 'Enseignant DSH/TestDaF', status: 'ACTIVE', isConfigured: true, publicationStatus: 'PUBLISHED' }}
              onSelectRole={(rId) => console.log('Selected role:', rId)}
            />
          </div>
        )}

        {/* TAB 5: PROFIL (USER SETTINGS & PRIVACY LOCATION TOGGLE) */}
        {activeTab === 'profil' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
              Mon Profil & Paramètres Privacy
            </h2>
            <div style={{ padding: '12px', backgroundColor: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD6FE', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#5B21B6' }}>Confidentialité de la localisation (PostGIS)</div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Votre position géographique exacte n&apos;est jamais partagée publiquement. Seul le rayon approximatif (ex: 2.4 km) est affiché.
              </p>
            </div>
            <button
              onClick={() => setIsPassModalOpen(true)}
              style={{
                width: '100%',
                minHeight: '46px',
                backgroundColor: '#5B21B6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Recharger mon compte Mobile Money (Orange / MTN)
            </button>
          </div>
        )}

        {/* Progressive Disclosure Modal Drawer for Provider Card Details */}
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
              <div style={{ width: '36px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '9999px', margin: '0 auto 16px auto' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
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
                <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#F5F3FF', color: '#5B21B6', padding: '4px 10px', borderRadius: '6px' }}>
                  {selectedProvider.role}
                </span>
                <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: 600, color: '#D97706' }}>
                  ★ {selectedProvider.rating} ({selectedProvider.reviewCount} avis)
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setActiveTab('messages');
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

        {/* Global Pass Pro Modal */}
        <PassProPaymentModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
        />
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
