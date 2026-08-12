'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/navigation/Header';
import { BottomNav, NavTab } from '../components/navigation/BottomNav';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { RightPanel } from '../components/navigation/RightPanel';
import { CompactProviderCard, ProviderSummary } from '../components/search/CompactProviderCard';
import { FilterDrawer, FilterState } from '../components/search/FilterDrawer';
import { IndividualProviderProfile } from '../components/provider/IndividualProviderProfile';
import { DeutschInstitutProfile } from '../components/provider/DeutschInstitutProfile';
import { ProviderDashboard } from '../components/provider/ProviderDashboard';
import { ConversationList, ConversationItem } from '../components/messaging/ConversationList';
import { PassProPaymentModal } from '../components/subscription/PassProPaymentModal';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Toast } from '../components/ui/Toast';
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
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    roleFilter: 'ALL',
    radiusKm: 10,
    verifiedOnly: false,
  });

  const [providers, setProviders] = useState<ProviderSummary[]>(initialProviders);

  useEffect(() => {
    async function fetchPublicInfo() {
      setIsLoading(true);
      try {
        const env = getClientEnv();
        const res = await fetch(`${env.apiUrl}/info/public`);
        if (!res.ok) {
          throw new Error('API non disponible');
        }
      } catch (e) {
        // Log silently, fallback to resilient offline baseline
      } finally {
        setIsLoading(false);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center' }}>
      {/* 1. Left Persistent Sidebar for Tablet & Desktop (> 768px) */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenPassPro={() => setIsPassModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <div style={{ flex: 1, maxWidth: '800px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header (Visible on Mobile) */}
        <div className="md:hidden">
          <Header />
        </div>

        {/* Main Content Body */}
        <main style={{ padding: '20px 16px 80px 16px', flex: 1 }}>
          {apiError && (
            <ErrorBanner message={apiError} onRetry={() => setApiError(null)} />
          )}

          {/* TAB 1: DÉCOUVERTE (FEED & SPATIAL SEARCH) */}
          {activeTab === 'decouverte' && (
            <div>
              {/* Search Bar & Mobile Filter Trigger */}
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
                      aria-label="Rechercher des prestataires"
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
                    aria-label="Ouvrir les filtres de recherche"
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
                        aria-pressed={isSelected}
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

              {/* Provider Cards Layout Grid */}
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '12px',
                }}
              >
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : filteredProviders.length > 0 ? (
                  filteredProviders.map((p) => (
                    <CompactProviderCard
                      key={p.id}
                      provider={p}
                      onSelect={(sel) => setSelectedProvider(sel)}
                    />
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <EmptyState
                      icon="🔎"
                      title="Aucun prestataire trouvé"
                      description="Aucun prestataire ne correspond à vos critères de filtre actuels ou à votre rayon de recherche."
                      actionLabel="Réinitialiser tous les filtres"
                      onAction={() => setFilters({ roleFilter: 'ALL', radiusKm: 50, verifiedOnly: false })}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: PRESTATAIRES */}
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
                onContactClick={() => {
                  setToastMessage('Redirection vers la messagerie avec Dr. Thomas MBIDA');
                  setActiveTab('messages');
                }}
              />

              <DeutschInstitutProfile
                id="prov-2"
                displayName="Institut Goethe Partner Cameroon"
                shortBio="Centre d'excellence pour l'apprentissage de la langue allemande et la préparation aux épreuves du Goethe-Zertifikat A1-C1."
                fullDescription={`L'Institut Goethe Partner Cameroon forme chaque année plus de 800 étudiants aux exigences linguistiques et culturelles allemandes.\n\nNos engagements:\n- Enseignants certifiés et matériel pédagogique moderne\n- Examens blancs hebdomadaires gratuits pour nos abonnés\n- Salles de cours climatisées et médiathèque ouverte 6j/7.`}
                onContactClick={() => {
                  setToastMessage("Redirection vers la messagerie de l'Institut");
                  setActiveTab('messages');
                }}
              />
            </div>
          )}

          {/* TAB 3: MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              <ConversationList
                conversations={mockConversations}
                onSelect={(id) => setToastMessage(`Discussion sélectionnée (${id})`)}
                activeRoleContextName="Apprenant / Candidat"
              />
            </div>
          )}

          {/* TAB 4: PASS PRO */}
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

          {/* TAB 5: PROFIL */}
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
        </main>
      </div>

      {/* 3. Right Contextual Panel for Desktop Screens (> 1024px) */}
      <RightPanel
        radiusKm={filters.radiusKm}
        onRadiusChange={(radius) => setFilters({ ...filters, radiusKm: radius })}
        onOpenPassPro={() => setIsPassModalOpen(true)}
      />

      {/* Mobile Sticky Bottom Navigation (< 768px) */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      </div>

      {/* Filter Drawer Sheet */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />

      {/* Pass Pro Payment Modal */}
      <PassProPaymentModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onPaymentSuccess={() => setToastMessage('Pass Pro activé avec succès via Mobile Money !')}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
