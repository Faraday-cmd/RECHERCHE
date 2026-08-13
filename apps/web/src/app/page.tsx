'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/navigation/Header';
import { BottomNav, NavTab } from '../components/navigation/BottomNav';
import { DesktopSidebar } from '../components/navigation/DesktopSidebar';
import { RightPanel } from '../components/navigation/RightPanel';
import { CompactProviderCard, ProviderSummary } from '../components/search/CompactProviderCard';
import { FilterDrawer, FilterState } from '../components/search/FilterDrawer';
import { IndividualProviderProfile } from '../components/provider/IndividualProviderProfile';
import { DeutschInstitutProfile } from '../components/provider/DeutschInstitutProfile';
import { ProviderDashboard, RoleDashboardItem, PublishedContentItem, MediaGalleryItem } from '../components/provider/ProviderDashboard';
import { ConversationList, AvailableMessageRole } from '../components/messaging/ConversationList';
import { ActiveChatView, MessageBubble } from '../components/messaging/ActiveChatView';
import { PassProPaymentModal } from '../components/subscription/PassProPaymentModal';
import { PublicationCard } from '../components/feed/PublicationCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Toast } from '../components/ui/Toast';
import { getClientEnv } from '../lib/env.config';

export interface ConversationThread {
  id: string;
  providerId: string;
  roleCode?: string;
  recipientName: string;
  recipientRole: string;
  recipientAvatar?: string;
  verified?: boolean;
  messages: MessageBubble[];
  updatedAt: string;
  unreadCount?: number;
}

const initialProviders: ProviderSummary[] = [
  {
    id: 'prov-1',
    name: 'Dr. Thomas MBIDA',
    role: 'BETREUER',
    city: 'Douala',
    quarter: 'Akwa',
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
    quarter: 'Bastos',
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
    quarter: 'Bonapriso',
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
    quarter: 'Makepe',
    distanceKm: 3.5,
    rating: 4.7,
    reviewCount: 19,
    verified: false,
  },
];

const initialConversations: ConversationThread[] = [
  {
    id: 'conv-user-1',
    providerId: 'prov-4',
    roleCode: 'USER',
    recipientName: 'Cabinet Visa Germany Direct',
    recipientRole: 'Accompagnateur Visa',
    verified: false,
    messages: [
      { id: 'm0', sender: 'provider', text: 'Bonjour ! Votre passeport et votre attestation sont-ils prêts ?', timestamp: '09:15' },
    ],
    updatedAt: '09:15',
    unreadCount: 2,
  },
  {
    id: 'conv-prov-1',
    providerId: 'prov-1',
    roleCode: 'BETREUER',
    recipientName: 'Marc A.',
    recipientRole: 'Candidat Étudiant',
    verified: true,
    messages: [
      { id: 'm1', sender: 'provider', text: 'Bonjour ! Les réservations de chambre à Yaoundé sont ouvertes.', timestamp: '10:42' },
    ],
    updatedAt: '10:42',
    unreadCount: 5,
  },
  {
    id: 'conv-prov-3',
    providerId: 'prov-3',
    roleCode: 'LEHRER',
    recipientName: 'Jean-Paul K.',
    recipientRole: 'Candidat TestDaF',
    verified: true,
    messages: [
      { id: 'm2', sender: 'provider', text: 'La prochaine session intensive d\'Allemand B2 débute lundi.', timestamp: 'Hier' },
    ],
    updatedAt: 'Hier',
    unreadCount: 3,
  },
];

const initialProviderRoles: RoleDashboardItem[] = [
  {
    userRoleId: 'ur-1',
    roleCode: 'LEHRER',
    roleName: 'Enseignant',
    displayName: 'Prof. Karl SCHMIDT',
    status: 'ACTIVE',
    isConfigured: true,
    publicationStatus: 'PUBLISHED',
    subscriptionStatus: 'ACTIVE',
    expirationDate: '15 Sept. 2026',
    priceXAF: 4000,
    followers: 142,
    rating: 5.0,
    reviewCount: 42,
    city: 'Douala',
    bio: 'Enseignant certifié spécialisé dans la préparation intensive aux épreuves du TestDaF et DSH.',
  },
  {
    userRoleId: 'ur-2',
    roleCode: 'BETREUER',
    roleName: 'Betreuer',
    displayName: 'Dr. Thomas MBIDA',
    status: 'ACTIVE',
    isConfigured: true,
    publicationStatus: 'PUBLISHED',
    subscriptionStatus: 'GRACE_1',
    expirationDate: '11 Août 2026',
    graceDaysLeft: 1,
    priceXAF: 2000,
    followers: 89,
    rating: 4.9,
    reviewCount: 28,
    city: 'Douala',
    bio: 'Accompagnement personnalisé pour l\'installation étudiant et la recherche de logement en Allemagne.',
  },
];

const initialPosts: PublishedContentItem[] = [
  {
    id: 'post-1',
    roleId: 'ur-1',
    title: 'Ouverture des inscriptions Session Intensive TestDaF B2',
    body: 'Les places pour la session de préparation de septembre sont limitées à 12 étudiants. Entraînement hebdomadaire sur les 4 épreuves officielles avec correction individuelle.',
    createdAt: '10 Août 2026',
    status: 'PUBLISHED',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    ],
    providerName: 'Prof. Karl SCHMIDT',
    providerRole: 'LEHRER',
    providerCity: 'Douala',
    providerVerified: true,
    viewCount: 142,
    daysLeft: 3,
  },
  {
    id: 'post-2',
    roleId: 'ur-2',
    title: 'Disponibilité de 3 chambres en colocation (WG) à Yaoundé Melen',
    body: 'Chambres meublées avec Wi-Fi et proximité campus universitaire. Visite virtuelle disponible et aide à la constitution du dossier de logement.',
    createdAt: '05 Août 2026',
    status: 'EXPIRED',
    mediaType: 'photo',
    mediaUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    ],
    providerName: 'Dr. Thomas MBIDA',
    providerRole: 'BETREUER',
    providerCity: 'Douala',
    providerVerified: true,
    viewCount: 89,
    daysLeft: 0,
  },
  {
    id: 'post-3',
    roleId: 'prov-2',
    title: 'Calendrier officiel des examens Goethe-Zertifikat A1-C1 2026',
    body: 'Les dates d\'examens officiels pour les sessions d\'automne sont publiées. Inscriptions ouvertes aux étudiants externes.',
    createdAt: '01 Août 2026',
    status: 'PUBLISHED',
    mediaType: 'video',
    mediaUrls: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'],
    providerName: 'Institut Goethe Partner Cameroon',
    providerRole: 'DEUTSCH_INSTITUT',
    providerCity: 'Yaoundé',
    providerVerified: true,
    viewCount: 230,
    daysLeft: 4,
  },
];

const initialMediaItems: MediaGalleryItem[] = [
  {
    id: 'med-1',
    roleId: 'ur-1',
    type: 'photo',
    title: 'Salles de cours et médiathèque allemande',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    createdAt: '08 Août 2026',
  },
  {
    id: 'med-2',
    roleId: 'ur-2',
    type: 'photo',
    title: 'Aperçu résidence et chambres d\'étudiants meublées (WG)',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    createdAt: '06 Août 2026',
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shallow = [...arr];
  for (let i = shallow.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shallow[i], shallow[j]] = [shallow[j], shallow[i]];
  }
  return shallow;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('decouverte');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSummary | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    roleFilter: 'INFOS',
    radiusKm: 10,
    verifiedOnly: false,
    country: 'Cameroun',
    city: 'Douala',
    quarter: 'ALL',
  });

  const [accountInfo, setAccountInfo] = useState({
    fullName: 'Marc ALAIN',
    email: 'marc.alain@recherche.cm',
    phone: '+237 699 88 77 66',
    city: 'Douala',
    country: 'Cameroun',
    roleLabel: 'Candidat / Apprenant',
    walletBalanceXAF: 15000,
  });
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editAccountData, setEditAccountData] = useState({ ...accountInfo });

  const [providers, setProviders] = useState<ProviderSummary[]>(initialProviders);
  const [conversations, setConversations] = useState<ConversationThread[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessageRoleCode, setActiveMessageRoleCode] = useState<string>('USER');

  const [unlockedRoles, setUnlockedRoles] = useState<RoleDashboardItem[]>(initialProviderRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialProviderRoles[0]?.userRoleId || '');
  const [posts, setPosts] = useState<PublishedContentItem[]>(initialPosts);
  const [mediaItems, setMediaItems] = useState<MediaGalleryItem[]>(initialMediaItems);

  const userCity = accountInfo.city || filters.city || 'Douala';

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
        // Safe fallback
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicInfo();
  }, []);

  const allIndexedProviders = useMemo(() => {
    const list = [...providers];
    unlockedRoles.forEach((role) => {
      if (role.isConfigured && !list.some((p) => p.id === role.userRoleId)) {
        list.push({
          id: role.userRoleId,
          name: role.displayName,
          role: role.roleCode,
          city: role.city || 'Douala',
          distanceKm: 2.1,
          rating: role.rating || 5.0,
          reviewCount: role.reviewCount || 0,
          verified: true,
        });
      }
    });
    return list;
  }, [providers, unlockedRoles]);

  const dynamicProvidersList = useMemo(() => {
    let filtered = allIndexedProviders.filter((p) => {
      // Exclude expired providers completely from public search/discovery (Requirement 5)
      const matchingRole = unlockedRoles.find((r) => r.userRoleId === p.id);
      if (matchingRole && matchingRole.subscriptionStatus === 'EXPIRED') {
        return false;
      }

      if (filters.roleFilter !== 'INFOS' && filters.roleFilter !== 'ALL' && p.role !== filters.roleFilter) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      if (filters.radiusKm && p.distanceKm && p.distanceKm > filters.radiusKm) return false;

      // Filter by City
      if (filters.city && filters.city !== 'ALL' && p.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }

      // Filter by Quarter
      if (filters.quarter && filters.quarter !== 'ALL') {
        if (!p.quarter || !p.quarter.toLowerCase().includes(filters.quarter.toLowerCase())) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          (p.quarter && p.quarter.toLowerCase().includes(q))
        );
      }
      return true;
    });

    const targetCity = filters.city && filters.city !== 'ALL' ? filters.city : userCity;
    const localGroup = shuffleArray(filtered.filter((p) => p.city.toLowerCase() === targetCity.toLowerCase()));
    const otherGroup = shuffleArray(filtered.filter((p) => p.city.toLowerCase() !== targetCity.toLowerCase()));

    return [...localGroup, ...otherGroup];
  }, [allIndexedProviders, filters, searchQuery, userCity, unlockedRoles]);

  const dynamicInfosFeed = useMemo(() => {
    const publishedOnly = posts.filter((p) => {
      if (p.status !== 'PUBLISHED' || (p.daysLeft !== undefined && p.daysLeft <= 0)) {
        return false;
      }
      // Exclude publications from EXPIRED providers from public Infos feed (Requirement 6)
      const ownerRole = unlockedRoles.find((r) => r.userRoleId === p.roleId);
      if (ownerRole && ownerRole.subscriptionStatus === 'EXPIRED') {
        return false;
      }
      return true;
    });

    const enriched = publishedOnly.map((post) => {
      const ownerRole = unlockedRoles.find((r) => r.userRoleId === post.roleId);
      const ownerProvider = allIndexedProviders.find((p) => p.id === post.roleId);

      return {
        ...post,
        providerName: post.providerName || ownerRole?.displayName || ownerProvider?.name || 'Dr. Thomas MBIDA',
        providerRole: post.providerRole || ownerRole?.roleCode || ownerProvider?.role || 'BETREUER',
        providerCity: post.providerCity || ownerRole?.city || ownerProvider?.city || 'Douala',
        providerVerified: post.providerVerified ?? ownerProvider?.verified ?? true,
      };
    });

    const localPosts = shuffleArray(enriched.filter((p) => p.providerCity.toLowerCase() === userCity.toLowerCase()));
    const otherPosts = shuffleArray(enriched.filter((p) => p.providerCity.toLowerCase() !== userCity.toLowerCase()));

    return [...localPosts, ...otherPosts];
  }, [posts, unlockedRoles, allIndexedProviders, userCity]);

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleContactProvider = (provider: ProviderSummary) => {
    let conv = conversations.find((c) => c.providerId === provider.id);
    if (!conv) {
      conv = {
        id: `conv-${provider.id}`,
        providerId: provider.id,
        roleCode: 'USER',
        recipientName: provider.name,
        recipientRole:
          provider.role === 'LEHRER'
            ? 'Enseignant'
            : provider.role === 'BETREUER'
            ? 'Betreuer'
            : provider.role === 'VISA_COMPANION'
            ? 'Accompagnateur Visa'
            : 'Institut de langue',
        verified: provider.verified,
        messages: [],
        updatedAt: 'Maintenant',
        unreadCount: 0,
      };
      setConversations((prev) => [conv!, ...prev]);
    }
    setActiveConversationId(conv.id);
    setActiveMessageRoleCode('USER');
    setSelectedProvider(null);
    setActiveTab('messages');
  };

  const handleSendMessage = (convId: string, text: string) => {
    const newMsg: MessageBubble = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
            updatedAt: newMsg.timestamp,
            unreadCount: 0,
          };
        }
        return c;
      })
    );
  };

  const handleAddRole = (newRoleData: Omit<RoleDashboardItem, 'userRoleId'>) => {
    const newRole: RoleDashboardItem = {
      ...newRoleData,
      userRoleId: `ur-${Date.now()}`,
    };

    setUnlockedRoles((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.userRoleId);
    setToastMessage(`Abonnement "${newRole.roleName}" activé avec succès ! Complétez votre profil.`);
  };

  const handleRenewRoleSubscription = (roleId: string) => {
    setUnlockedRoles((prev) =>
      prev.map((r) => {
        if (r.userRoleId === roleId) {
          return {
            ...r,
            subscriptionStatus: 'ACTIVE',
            expirationDate: '13 Sept. 2026',
            graceDaysLeft: undefined,
          };
        }
        return r;
      })
    );
    setToastMessage('Abonnement renouvelé avec succès ! Votre profil public est réactivé.');
  };

  const handleUpdateRoleProfile = (roleId: string, updatedData: Partial<RoleDashboardItem>) => {
    setUnlockedRoles((prev) =>
      prev.map((r) => {
        if (r.userRoleId === roleId) {
          return { ...r, ...updatedData, isConfigured: true };
        }
        return r;
      })
    );
    setToastMessage('Profil mis à jour et publié !');
  };

  const handleCreatePublication = (
    roleId: string,
    title: string,
    body: string,
    mediaType?: 'photo' | 'video' | 'mixed',
    mediaUrls?: string[]
  ) => {
    const activeRoleObj = unlockedRoles.find((r) => r.userRoleId === roleId);

    const newPub: PublishedContentItem = {
      id: `post-${Date.now()}`,
      roleId,
      title,
      body,
      createdAt: 'À l\'instant',
      status: 'PUBLISHED',
      mediaType,
      mediaUrls,
      providerName: activeRoleObj?.displayName || 'Mon Profil Prestataire',
      providerRole: activeRoleObj?.roleCode || 'BETREUER',
      providerCity: activeRoleObj?.city || 'Douala',
      providerVerified: true,
      viewCount: 0,
      daysLeft: 5,
    };

    setPosts((prev) => [newPub, ...prev]);
    setToastMessage('Publication ajoutée et publiée dans le fil Infos Découverte pour 5 jours !');
  };

  const handleRepublishPublication = (publicationId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === publicationId) {
          return {
            ...p,
            status: 'PUBLISHED',
            createdAt: 'À l\'instant (republié)',
            daysLeft: 5,
          };
        }
        return p;
      })
    );
    setToastMessage('Publication republiée avec succès pour une durée de 5 jours !');
  };

  const handleCreateMedia = (roleId: string, type: 'photo' | 'video' | 'text', title: string, url?: string, body?: string) => {
    const newMedia: MediaGalleryItem = {
      id: `med-${Date.now()}`,
      roleId,
      type,
      title,
      url: url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      body,
      createdAt: 'Aujourd\'hui',
    };
    setMediaItems((prev) => [newMedia, ...prev]);
    setToastMessage('Contenu multimédia ajouté à la galerie !');
  };

  const handleTogglePublicationStatus = (publicationId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === publicationId) {
          return { ...p, status: p.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED' };
        }
        return p;
      })
    );
  };

  const handleDeletePublication = (publicationId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== publicationId));
    setToastMessage('Publication supprimée.');
  };

  const handleDeleteMedia = (mediaId: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
    setToastMessage('Média supprimé de la galerie.');
  };

  const roleIcons: Record<string, string> = {
    USER: '👤',
    BETREUER: '🟢',
    LEHRER: '🟣',
    VISA_COMPANION: '🟠',
    DEUTSCH_INSTITUT: '🟢',
  };

  const roleLabels: Record<string, string> = {
    USER: 'Utilisateur',
    LEHRER: 'Enseignant',
    BETREUER: 'Betreuer',
    VISA_COMPANION: 'Accompagnateur Visa',
    DEUTSCH_INSTITUT: 'Institut de langue',
  };

  const availableMessageRoles: AvailableMessageRole[] = [
    {
      code: 'USER',
      label: roleLabels.USER,
      icon: roleIcons.USER,
      unreadCount: conversations
        .filter((c) => !c.roleCode || c.roleCode === 'USER')
        .reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    },
    ...unlockedRoles.map((r) => ({
      code: r.roleCode,
      label: roleLabels[r.roleCode] || r.roleName,
      icon: roleIcons[r.roleCode] || '🟢',
      unreadCount: conversations
        .filter((c) => c.roleCode === r.roleCode)
        .reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    })),
  ];

  const filteredConversations = conversations.filter((c) => {
    if (activeMessageRoleCode === 'USER') {
      return !c.roleCode || c.roleCode === 'USER';
    }
    return c.roleCode === activeMessageRoleCode;
  });

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeRole = unlockedRoles.find((r) => r.userRoleId === selectedRoleId) || unlockedRoles[0] || null;

  const activeRoleUnreadCount = activeRole
    ? conversations
        .filter((c) => c.roleCode === activeRole.roleCode)
        .reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedProvider(null);
          setActiveTab(tab);
        }}
      />

      <div style={{ flex: 1, maxWidth: '820px', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <Header currentCity={accountInfo.city || filters.city} />

        <main style={{ padding: '16px 16px 90px 16px', flex: 1, minWidth: 0, width: '100%' }}>
          {apiError && (
            <ErrorBanner message={apiError} onRetry={() => setApiError(null)} />
          )}

          {selectedProvider ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedProvider.role === 'DEUTSCH_INSTITUT' ? (
                (() => {
                  const matchingRole = unlockedRoles.find((r) => r.userRoleId === selectedProvider.id);
                  return (
                    <DeutschInstitutProfile
                      id={selectedProvider.id}
                      displayName={matchingRole?.displayName || selectedProvider.name}
                      shortBio={matchingRole?.bio || "Centre agréé spécialisé pour l'apprentissage de la langue allemande et la préparation au Goethe-Zertifikat A1-C1."}
                      fullDescription={matchingRole?.fullDescription || matchingRole?.bio || `L'Institut Goethe Partner Cameroon forme les étudiants aux exigences linguistiques et culturelles allemandes.\n\nServices:\n- Enseignants certifiés\n- Salles de cours climatisées\n- Examens blancs hebdomadaires.`}
                      yearFounded={2018}
                      profilePicUrl={matchingRole?.profilePicUrl}
                      coverPicUrl={matchingRole?.coverPicUrl}
                      activeCourses={matchingRole?.courses as any}
                      campuses={matchingRole?.campuses as any}
                      services={matchingRole?.services as any}
                      openingHours={matchingRole?.openingHours as any}
                      publications={posts.filter((p) => {
                        if (p.status !== 'PUBLISHED') return false;
                        return p.roleId === selectedProvider.id || (p.providerRole === 'DEUTSCH_INSTITUT' && p.providerName === selectedProvider.name);
                      })}
                      followerCount={matchingRole?.followers || 380}
                      verified={selectedProvider.verified}
                      subscriptionStatus="ACTIVE"
                      onBack={() => setSelectedProvider(null)}
                      onContactClick={() => handleContactProvider(selectedProvider)}
                    />
                  );
                })()
              ) : (
                (() => {
                  const matchingRole = unlockedRoles.find((r) => r.userRoleId === selectedProvider.id);
                  return (
                    <IndividualProviderProfile
                      id={selectedProvider.id}
                      roleCode={selectedProvider.role as any}
                      roleName={
                        selectedProvider.role === 'LEHRER'
                          ? 'Enseignant'
                          : selectedProvider.role === 'BETREUER'
                          ? 'Betreuer'
                          : 'Accompagnateur Visa'
                      }
                      displayName={matchingRole?.displayName || selectedProvider.name}
                      shortBio={matchingRole?.bio || "Accompagnateur spécialisé pour la mobilité estudiantine germano-africaine."}
                      fullDescription={matchingRole?.fullDescription || matchingRole?.bio || `Spécialiste de l'accompagnement étudiant pour l'Allemagne.\n\nPrestations:\n- Inscription université & logement\n- Préparation visa et entretien\n- Entraînement linguistique.`}
                      profilePicUrl={matchingRole?.profilePicUrl}
                      coverPicUrl={matchingRole?.coverPicUrl}
                      services={matchingRole?.services as any}
                      openingHours={matchingRole?.openingHours as any}
                      phoneNumbers={matchingRole?.phoneNumbers}
                      city={matchingRole?.city || selectedProvider.city}
                      distanceKm={selectedProvider.distanceKm}
                      rating={selectedProvider.rating}
                      reviewCount={selectedProvider.reviewCount}
                      publications={posts.filter((p) => {
                        if (p.status !== 'PUBLISHED') return false;
                        return p.roleId === selectedProvider.id || (p.providerRole === selectedProvider.role && p.providerName === selectedProvider.name);
                      })}
                      verified={selectedProvider.verified}
                      subscriptionStatus={selectedProvider.id === 'prov-1' ? 'GRACE_1' : 'ACTIVE'}
                      onBack={() => setSelectedProvider(null)}
                      onContactClick={() => handleContactProvider(selectedProvider)}
                    />
                  );
                })()
              )}
            </div>
          ) : (
            <>
              {/* TAB 1: DÉCOUVERTE */}
              {activeTab === 'decouverte' && (
                <div>
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

                  {/* CATEGORY PILLS */}
                  <section
                    style={{
                      marginBottom: '20px',
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      maxWidth: '100%',
                      paddingBottom: '8px',
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', width: 'max-content', paddingRight: '16px' }}>
                      {[
                        { id: 'INFOS', label: '📢 Infos & Announcements' },
                        { id: 'LEHRER', label: '🎓 Enseignants' },
                        { id: 'BETREUER', label: '🏠 Betreuer' },
                        { id: 'VISA_COMPANION', label: '🛂 Accompagnateurs Visa' },
                        { id: 'DEUTSCH_INSTITUT', label: '🏫 Instituts' },
                      ].map((cat) => {
                        const isSelected = filters.roleFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setFilters({ ...filters, roleFilter: cat.id })}
                            aria-pressed={isSelected}
                            style={{
                              minHeight: '36px',
                              padding: '0 14px',
                              borderRadius: '9999px',
                              border: isSelected ? '1px solid #5B21B6' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? '#5B21B6' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#475569',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* CASE A: INFOS FEED WITH "CONTACTER" & CLICKABLE PROVIDER NAME */}
                  {filters.roleFilter === 'INFOS' ? (
                    <div>
                      <section style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          📢 Fil d&apos;informations & Publications
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Priorité {userCity} • {dynamicInfosFeed.length} publication(s)
                        </span>
                      </section>

                      {dynamicInfosFeed.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {dynamicInfosFeed.map((pub) => (
                            <PublicationCard
                              key={pub.id}
                              publication={pub}
                              onContactClick={() => {
                                const providerSummary: ProviderSummary = {
                                  id: pub.roleId || 'prov-1',
                                  name: pub.providerName || 'Dr. Thomas MBIDA',
                                  role: (pub.providerRole || 'BETREUER') as any,
                                  city: pub.providerCity || 'Douala',
                                  verified: pub.providerVerified ?? true,
                                };
                                handleContactProvider(providerSummary);
                              }}
                              onProviderNameClick={() => {
                                const providerSummary: ProviderSummary = {
                                  id: pub.roleId || 'prov-1',
                                  name: pub.providerName || 'Dr. Thomas MBIDA',
                                  role: (pub.providerRole || 'BETREUER') as any,
                                  city: pub.providerCity || 'Douala',
                                  verified: pub.providerVerified ?? true,
                                };
                                setSelectedProvider(providerSummary);
                              }}
                              onOpenFullscreenImage={(imgUrl) => setFullscreenImageUrl(imgUrl)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon="📢"
                          title="Aucune publication disponible"
                          description="Les prestataires n'ont pas encore publié d'annonces d'informations."
                        />
                      )}
                    </div>
                  ) : (
                    /* CASE B: ROLE CATEGORY SEARCH RESULTS */
                    <div>
                      {/* ACTIVE GEOGRAPHIC AREA BANNER */}
                      {(filters.city !== 'ALL' || (filters.quarter && filters.quarter !== 'ALL')) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE', marginBottom: '14px' }}>
                          <span style={{ fontSize: '16px' }}>📍</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#5B21B6' }}>
                            Zone ciblée : {filters.country || 'Cameroun'} {filters.city && filters.city !== 'ALL' ? `➔ ${filters.city}` : ''} {filters.quarter && filters.quarter !== 'ALL' ? ` (${filters.quarter})` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFilters({ ...filters, city: 'ALL', quarter: 'ALL' })}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#DC2626', fontWeight: 800, fontSize: '11px', cursor: 'pointer' }}
                          >
                            ✕ Effacer la zone
                          </button>
                        </div>
                      )}

                      <section style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          Prestataires — {filters.roleFilter === 'LEHRER' ? 'Enseignants' : filters.roleFilter === 'BETREUER' ? 'Betreuer' : filters.roleFilter === 'VISA_COMPANION' ? 'Accompagnateurs Visa' : 'Instituts'}
                        </h2>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {dynamicProvidersList.length} résultat(s)
                        </span>
                      </section>

                      <section
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: '14px',
                        }}
                      >
                        {isLoading ? (
                          <>
                            <SkeletonCard />
                            <SkeletonCard />
                          </>
                        ) : dynamicProvidersList.length > 0 ? (
                          dynamicProvidersList.map((p) => (
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
                              title="Aucun prestataire dans cette catégorie"
                              description="Aucun profil prestataire ne correspond à cette catégorie dans votre secteur."
                              actionLabel="Voir le fil d'infos Découverte"
                              onAction={() => setFilters({ ...filters, roleFilter: 'INFOS' })}
                            />
                          </div>
                        )}
                      </section>
                    </div>
                  )}
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
                    roleName="Betreuer"
                    displayName="Dr. Thomas MBIDA"
                    shortBio="Accompagnateur spécialisé pour l'installation, les démarches universitaires et la réservation de logement en Allemagne."
                    fullDescription={`Spécialiste de la mobilité estudiantine germano-camerounaise depuis 2018.\n\nServices proposés:\n- Recherche et réservation de chambre d'étudiant (Wohnheim/WG)\n- Prise en charge à l'aéroport et accompagnement inscription ville (Bürgeramt)\n- Assistance ouverture compte bloqué bancaire.`}
                    city="Douala"
                    distanceKm={2.4}
                    rating={4.9}
                    reviewCount={28}
                    verified={true}
                    publications={posts.filter(
                      (p) => p.status === 'PUBLISHED' && (p.roleId === 'ur-2' || p.roleId === 'prov-1' || (p.providerRole === 'BETREUER' && p.providerName === 'Dr. Thomas MBIDA'))
                    )}
                    subscriptionStatus="GRACE_1"
                    onContactClick={() =>
                      handleContactProvider({
                        id: 'prov-1',
                        name: 'Dr. Thomas MBIDA',
                        role: 'BETREUER',
                        city: 'Douala',
                        verified: true,
                      })
                    }
                  />

                  <DeutschInstitutProfile
                    id="prov-2"
                    displayName="Institut Goethe Partner Cameroon"
                    shortBio="Centre d'excellence pour l'apprentissage de la langue allemande et la préparation aux épreuves du Goethe-Zertifikat A1-C1."
                    fullDescription={`L'Institut Goethe Partner Cameroon forme chaque année plus de 800 étudiants aux exigences linguistiques et culturelles allemandes.\n\nNos engagements:\n- Enseignants certifiés et matériel pédagogique moderne\n- Examens blancs hebdomadaires gratuits pour nos abonnés\n- Salles de cours climatisées et médiathèque ouverte 6j/7.`}
                    publications={posts.filter(
                      (p) => p.status === 'PUBLISHED' && (p.roleId === 'prov-2' || (p.providerRole === 'DEUTSCH_INSTITUT' && p.providerName?.includes('Goethe')))
                    )}
                    subscriptionStatus="ACTIVE"
                    onContactClick={() =>
                      handleContactProvider({
                        id: 'prov-2',
                        name: 'Institut Goethe Partner Cameroon',
                        role: 'DEUTSCH_INSTITUT',
                        city: 'Yaoundé',
                        verified: true,
                      })
                    }
                  />
                </div>
              )}

              {/* TAB 3: MESSAGES */}
              {activeTab === 'messages' && (
                <div>
                  {activeConv ? (
                    <ActiveChatView
                      providerId={activeConv.providerId}
                      recipientName={activeConv.recipientName}
                      recipientRole={activeConv.recipientRole}
                      verified={activeConv.verified}
                      messages={activeConv.messages}
                      onSendMessage={(text) => handleSendMessage(activeConv.id, text)}
                      onBack={() => setActiveConversationId(null)}
                    />
                  ) : (
                    <ConversationList
                      conversations={filteredConversations.map((c) => ({
                        id: c.id,
                        type: 'USER_PROVIDER',
                        recipientName: c.recipientName,
                        recipientRole: c.recipientRole,
                        lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'Nouvelle conversation',
                        updatedAt: c.updatedAt,
                        unreadCount: c.unreadCount,
                      }))}
                      selectedId={activeConversationId || undefined}
                      onSelect={(id) => handleSelectConversation(id)}
                      availableRoles={availableMessageRoles}
                      activeMessageRoleCode={activeMessageRoleCode}
                      onSelectMessageRole={(roleCode) => setActiveMessageRoleCode(roleCode)}
                    />
                  )}
                </div>
              )}

              {/* TAB 4: DASHBOARD PRESTATAIRE */}
              {activeTab === 'dashboard' && (
                <div>
                  <ProviderDashboard
                    unlockedRoles={unlockedRoles}
                    activeRole={activeRole}
                    posts={posts}
                    mediaItems={mediaItems}
                    unreadMessagesCount={activeRoleUnreadCount}
                    onSelectRole={(rId) => setSelectedRoleId(rId)}
                    onAddRole={handleAddRole}
                    onRenewRoleSubscription={handleRenewRoleSubscription}
                    onUpdateRoleProfile={handleUpdateRoleProfile}
                    onCreatePublication={handleCreatePublication}
                    onTogglePublicationStatus={handleTogglePublicationStatus}
                    onRepublishPublication={handleRepublishPublication}
                    onDeletePublication={handleDeletePublication}
                    onCreateMedia={handleCreateMedia}
                    onDeleteMedia={handleDeleteMedia}
                    onOpenRoleMessages={(roleCode) => {
                      setActiveMessageRoleCode(roleCode);
                      setActiveTab('messages');
                    }}
                  />
                </div>
              )}

              {/* TAB 5: PROFIL (MON COMPTE & INFORMATIONS PERSONNELLES) */}
              {activeTab === 'profil' && (
                <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* MAIN USER ACCOUNT CARD */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Mon Compte & Informations Personnelles
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', margin: 0 }}>
                          Gérez vos informations de compte utilisateur et coordonnées personnelles.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditingAccount) {
                            setAccountInfo(editAccountData);
                            setFilters((prev) => ({
                              ...prev,
                              city: editAccountData.city,
                              country: editAccountData.country,
                            }));
                            setIsEditingAccount(false);
                            setToastMessage(`Informations de compte & localisation enregistrées (${editAccountData.city}) !`);
                          } else {
                            setEditAccountData({ ...accountInfo });
                            setIsEditingAccount(true);
                          }
                        }}
                        style={{
                          minHeight: '40px',
                          padding: '0 16px',
                          backgroundColor: isEditingAccount ? '#059669' : '#F5F3FF',
                          color: isEditingAccount ? '#FFFFFF' : '#5B21B6',
                          border: isEditingAccount ? 'none' : '1px solid #DDD6FE',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{isEditingAccount ? '💾 Enregistrer' : '✏️ Modifier le compte'}</span>
                      </button>
                    </div>

                    {/* USER PROFILE SUMMARY HEADER */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#EDE9FE', color: '#5B21B6', fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #DDD6FE', flexShrink: 0 }}>
                        👨‍🎓
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {accountInfo.fullName}
                          </h3>
                          <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                            🟢 Compte Vérifié
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                          {accountInfo.email} • {accountInfo.phone}
                        </p>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6', marginTop: '4px' }}>
                          📍 {accountInfo.city}, {accountInfo.country} • Statut : {accountInfo.roleLabel}
                        </div>
                      </div>
                    </div>

                    {/* ACCOUNT DETAILS FIELDS (VIEW OR EDIT MODE) */}
                    {!isEditingAccount ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Nom & Prénom
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {accountInfo.fullName}
                          </div>
                        </div>

                        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Adresse E-mail
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {accountInfo.email}
                          </div>
                        </div>

                        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Numéro de Téléphone
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {accountInfo.phone}
                          </div>
                        </div>

                        <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Ville & Pays
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {accountInfo.city}, {accountInfo.country}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', backgroundColor: '#F5F3FF', padding: '16px', borderRadius: '14px', border: '1px solid #DDD6FE' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            NOM & PRÉNOM
                          </label>
                          <input
                            type="text"
                            value={editAccountData.fullName}
                            onChange={(e) => setEditAccountData({ ...editAccountData, fullName: e.target.value })}
                            style={{ width: '100%', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            ADRESSE E-MAIL
                          </label>
                          <input
                            type="email"
                            value={editAccountData.email}
                            onChange={(e) => setEditAccountData({ ...editAccountData, email: e.target.value })}
                            style={{ width: '100%', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            NUMÉRO DE TÉLÉPHONE
                          </label>
                          <input
                            type="tel"
                            value={editAccountData.phone}
                            onChange={(e) => setEditAccountData({ ...editAccountData, phone: e.target.value })}
                            style={{ width: '100%', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            VILLE DE RÉSIDENCE
                          </label>
                          <input
                            type="text"
                            value={editAccountData.city}
                            onChange={(e) => setEditAccountData({ ...editAccountData, city: e.target.value })}
                            style={{ width: '100%', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRESERVED SUBSCRIPTION TESTING & PRIVACY SETTINGS */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
                      Mon Profil & Configuration Localisation
                    </h3>

                    {activeRole && (
                      <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                          Simulateur de Phase d&apos;Abonnement ({activeRole.roleName}):
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {[
                            { id: 'ACTIVE', label: '🟢 Actif' },
                            { id: 'GRACE_1', label: '🟠 Grâce (2 jours)' },
                            { id: 'EXPIRED', label: '🔴 Expiré (Masqué / Flouté)' },
                          ].map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => {
                                setUnlockedRoles((prev) =>
                                  prev.map((r) =>
                                    r.userRoleId === activeRole.userRoleId
                                      ? { ...r, subscriptionStatus: st.id as any }
                                      : r
                                  )
                                );
                                setToastMessage(`Statut du rôle ${activeRole.roleName} réglé sur: ${st.label}`);
                              }}
                              style={{
                                minHeight: '34px',
                                padding: '0 12px',
                                borderRadius: '8px',
                                border: activeRole.subscriptionStatus === st.id ? '2px solid #5B21B6' : '1px solid #CBD5E1',
                                backgroundColor: activeRole.subscriptionStatus === st.id ? '#F5F3FF' : '#FFFFFF',
                                color: activeRole.subscriptionStatus === st.id ? '#5B21B6' : '#334155',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ padding: '12px 14px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#5B21B6' }}>Confidentialité de la localisation (PostGIS)</div>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                        Votre position géographique exacte n&apos;est jamais partagée publiquement. Seul le rayon approximatif (ex: 2.4 km) est affiché.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Right Contextual Panel */}
      <RightPanel
        radiusKm={filters.radiusKm}
        onRadiusChange={(radius) => setFilters({ ...filters, radiusKm: radius })}
        onOpenPassPro={() => setIsPassModalOpen(true)}
        selectedProvider={selectedProvider}
        onContactClick={(prov) => handleContactProvider(prov)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedProvider(null);
          setActiveTab(tab);
        }}
      />

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
        onPaymentSuccess={() => setToastMessage('Abonnement activé avec succès via Mobile Money !')}
      />

      {/* FULLSCREEN IMAGE MODAL VIEWER */}
      {fullscreenImageUrl && (
        <div
          onClick={() => setFullscreenImageUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <button
            onClick={() => setFullscreenImageUrl(null)}
            aria-label="Fermer l'image"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              width: '44px',
              height: '44px',
              fontSize: '20px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <img
            src={fullscreenImageUrl}
            alt="Plein écran"
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
