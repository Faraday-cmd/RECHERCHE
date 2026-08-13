'use client';

import React, { useState, useMemo } from 'react';
import { PublicationCard } from '../feed/PublicationCard';
import { EmptyState } from '../ui/EmptyState';

export interface OpeningHourItem {
  day: string;
  hours: string;
  isToday?: boolean;
}

export interface PublicationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  mediaType?: 'photo' | 'video' | 'mixed';
  mediaUrls?: string[];
  providerName?: string;
  providerRole?: string;
  providerCity?: string;
  providerVerified?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  priceXAF?: number;
  priceText?: string;
  description: string;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface IndividualProviderProfileProps {
  id: string;
  roleCode: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION';
  roleName: string;
  displayName: string;
  shortBio: string;
  fullDescription: string;
  city?: string;
  distanceKm?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  profilePicUrl?: string;
  coverPicUrl?: string;
  phoneNumbers?: { label: string; number: string }[];
  services?: ServiceItem[];
  openingHours?: OpeningHourItem[];
  publications?: PublicationItem[];
  reviews?: ReviewItem[];
  subscriptionStatus?: 'ACTIVE' | 'GRACE_1' | 'GRACE_2' | 'EXPIRED';
  followerCount?: number;
  isFollowing?: boolean;
  currentUserAccountName?: string;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
  onBack?: () => void;
}

const defaultOpeningHours: OpeningHourItem[] = [
  { day: 'Lundi', hours: '08:00 – 18:00', isToday: true },
  { day: 'Mardi', hours: '08:00 – 18:00' },
  { day: 'Mercredi', hours: '08:00 – 18:00' },
  { day: 'Jeudi', hours: '08:00 – 18:00' },
  { day: 'Vendredi', hours: '08:00 – 18:00' },
  { day: 'Samedi', hours: '09:00 – 14:00' },
  { day: 'Dimanche', hours: 'Sur rendez-vous' },
];

const defaultServices: ServiceItem[] = [
  {
    id: 'serv-1',
    title: 'Recherche & Réservation Logement Étudiant (WG / Studio)',
    priceXAF: 25000,
    priceText: '25.000 FCFA',
    description: 'Accompagnement complet pour trouver une chambre meublée à proximité de votre campus en Allemagne avec attestation d\'hébergement.',
  },
  {
    id: 'serv-2',
    title: 'Accompagnement Démarches Visa & Compte Bloqué (Sperrkonto)',
    priceXAF: 35000,
    priceText: '35.000 FCFA',
    description: 'Vérification du dossier administratif, conseils pour la prise de rendez-vous ambassade et ouverture du compte bloqué.',
  },
  {
    id: 'serv-3',
    title: 'Prise en charge à l\'arrivée & Inscription Ville (Bürgeramt)',
    priceXAF: 20000,
    priceText: '20.000 FCFA',
    description: 'Accueil à la gare/aéroport, aide aux premiers achats et accompagnement pour la déclaration de domicile à la mairie allemande.',
  },
];

const defaultReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Jean-Marc K.',
    rating: 5,
    date: '12 Août 2026',
    comment: 'Service d\'accompagnement exemplaire pour la constitution de mon dossier et la réservation de logement. Réponses très rapides !',
  },
  {
    id: 'rev-2',
    authorName: 'Sandrine T.',
    rating: 5,
    date: '02 Août 2026',
    comment: 'Prestataire très à l\'écoute et réactif. Je recommande vivement pour toutes les démarches en Allemagne.',
  },
];

export const IndividualProviderProfile: React.FC<IndividualProviderProfileProps> = ({
  roleCode,
  roleName,
  displayName,
  shortBio,
  fullDescription,
  city = 'Douala',
  distanceKm = 2.4,
  rating = 4.9,
  reviewCount = 28,
  verified = true,
  profilePicUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  coverPicUrl,
  services = defaultServices,
  openingHours = defaultOpeningHours,
  publications = [],
  reviews = defaultReviews,
  subscriptionStatus = 'ACTIVE',
  followerCount = 142,
  isFollowing = false,
  currentUserAccountName = 'Marc ALAIN',
  onFollowToggle,
  onContactClick,
  onBack,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'content' | 'hours' | 'reviews'>('about');

  // DYNAMIC REVIEWS & RATING STATE
  const [reviewList, setReviewList] = useState<ReviewItem[]>(reviews && reviews.length > 0 ? reviews : defaultReviews);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');

  const currentAverageRating = useMemo(() => {
    if (reviewList.length === 0) return rating;
    const sum = reviewList.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviewList.length) * 10) / 10;
  }, [reviewList, rating]);

  const isExpired = subscriptionStatus === 'EXPIRED';

  const handleFollow = () => {
    if (isExpired) return;
    setFollowing(!following);
    setCount(following ? count - 1 : count + 1);
    if (onFollowToggle) onFollowToggle();
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRevItem: ReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: currentUserAccountName,
      rating: newRating,
      date: 'À l\'instant',
      comment: newComment.trim() || 'Avis laissé sur le profil.',
    };
    setReviewList([newRevItem, ...reviewList]);
    setIsAddReviewModalOpen(false);
    setNewComment('');
    setNewRating(5);
  };

  const displayServices = services.length > 0 ? services : defaultServices;
  const displayHours = openingHours.length > 0 ? openingHours : defaultOpeningHours;

  return (
    <article
      style={{
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: '24px',
      }}
    >
      {/* EXPIRED SUBSCRIPTION BLUR OVERLAY */}
      {isExpired && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid #FECACA',
            }}
          >
            🔒
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Profil temporairement indisponible
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', maxWidth: '420px', lineHeight: 1.6 }}>
            L&apos;abonnement de ce prestataire pour le rôle {roleName} a expiré. Ce profil est temporairement masqué en attente de renouvellement.
          </p>
        </div>
      )}

      {/* HERO CONTAINER */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          backgroundColor: '#3B0764',
          backgroundImage: `url(${coverPicUrl || profilePicUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          filter: isExpired ? 'blur(4px)' : 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.55) 50%, rgba(15, 23, 42, 0.2) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 20,
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Retour aux résultats"
              style={{
                minHeight: '40px',
                padding: '0 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>←</span>
              <span>Retour</span>
            </button>
          )}

          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '9999px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              marginLeft: 'auto',
            }}
          >
            {roleName}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '16px',
            right: '16px',
            zIndex: 10,
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                margin: 0,
                color: '#FFFFFF',
                textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                wordBreak: 'break-word',
              }}
            >
              {displayName}
            </h1>
            {verified && (
              <span
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                }}
                title="Profil Certifié & Vérifié"
              >
                ✓ VERIFIED PRO
              </span>
            )}
          </div>

          <div style={{ fontSize: '13px', color: '#DDD6FE', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>
            {shortBio}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px',
              fontSize: '12px',
              color: '#F1F5F9',
              flexWrap: 'wrap',
            }}
          >
            <span>📍 {city} ({distanceKm} km)</span>
            <span style={{ color: '#FBBF24', fontWeight: 700 }}>★ {currentAverageRating} ({reviewList.length} avis)</span>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                border: '1px solid rgba(110, 231, 183, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              🟢 Ouvert aujourd&apos;hui
            </span>
          </div>
        </div>
      </div>

      {/* FLOATING AFFILIATION CARD */}
      <div style={{ padding: '0 16px', marginTop: '-20px', position: 'relative', zIndex: 30 }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#F5F3FF',
                color: '#5B21B6',
                fontWeight: 800,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #DDD6FE',
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0)}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                RECHERCHE ECOSYSTEM
              </div>
              <div style={{ fontSize: '11px', color: '#5B21B6', fontWeight: 600, marginTop: '1px' }}>
                Accompagnement Universitaire & Logement Allemagne
              </div>
            </div>
          </div>

          <button
            onClick={handleFollow}
            style={{
              minHeight: '38px',
              padding: '0 14px',
              borderRadius: '10px',
              border: following ? '1px solid #E2E8F0' : '1px solid #5B21B6',
              backgroundColor: following ? '#F8FAFC' : '#5B21B6',
              color: following ? '#475569' : '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {following ? 'Abonné' : "S'abonner"} ({count})
          </button>
        </div>
      </div>

      {/* TABBED NAVIGATION */}
      <div style={{ padding: '16px 16px 10px 16px', maxWidth: '100%', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            gap: '16px',
            marginBottom: '16px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            scrollbarWidth: 'none',
          }}
        >
          {[
            { id: 'about', label: 'Présentation' },
            { id: 'services', label: 'Services & Tarifs' },
            { id: 'content', label: `Publications (${publications.length})` },
            { id: 'hours', label: "Horaires d'ouverture" },
            { id: 'reviews', label: `Avis (${reviewList.length})` },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  minHeight: '44px',
                  padding: '0 4px',
                  border: 'none',
                  borderBottom: isTabActive ? '3px solid #5B21B6' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isTabActive ? '#5B21B6' : '#64748B',
                  fontWeight: isTabActive ? 800 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PRÉSENTATION */}
        {activeTab === 'about' && (
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
            {fullDescription}
          </div>
        )}

        {/* TAB 2: SERVICES & TARIFS */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayServices.map((serv) => (
              <div
                key={serv.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {serv.title}
                  </h4>
                  {(serv.priceText || serv.priceXAF) && (
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B21B6', whiteSpace: 'nowrap' }}>
                      {serv.priceText || `${serv.priceXAF?.toLocaleString()} FCFA`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                  {serv.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PUBLICATIONS */}
        {activeTab === 'content' && (
          <div>
            {publications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {publications.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    publication={{
                      id: pub.id,
                      roleId: roleCode,
                      title: pub.title,
                      body: pub.body,
                      createdAt: pub.createdAt,
                      status: 'PUBLISHED',
                      mediaType: pub.mediaType,
                      mediaUrls: pub.mediaUrls,
                      providerName: pub.providerName || displayName,
                      providerRole: pub.providerRole || roleCode,
                      providerCity: pub.providerCity || city,
                      providerVerified: pub.providerVerified ?? verified,
                    }}
                    onContactClick={onContactClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📢"
                title="Aucune publication pour ce rôle"
                description={`Ce prestataire n'a pas encore publié d'annonces sous son rôle ${roleName}.`}
              />
            )}
          </div>
        )}

        {/* TAB 4: HORAIRES D'OUVERTURE */}
        {activeTab === 'hours' && (
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
              🕒 Horaires de disponibilité du prestataire
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayHours.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: h.isToday ? '#F5F3FF' : '#FFFFFF',
                    border: h.isToday ? '1px solid #DDD6FE' : '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: h.isToday ? 800 : 600, color: h.isToday ? '#5B21B6' : '#334155' }}>
                    {h.day} {h.isToday && '(Aujourd\'hui)'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: h.isToday ? '#5B21B6' : '#64748B' }}>
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AVIS ET ÉVALUATIONS WITH "AJOUTER UN AVIS" BUTTON */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header Title with "Ajouter un avis" button at top-right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ⭐ Avis et Évaluations ({reviewList.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsAddReviewModalOpen(true)}
                style={{
                  minHeight: '36px',
                  padding: '0 14px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(91, 33, 182, 0.25)',
                }}
              >
                <span>✍️</span>
                <span>Ajouter un avis</span>
              </button>
            </div>

            {/* Score Summary Box */}
            <div style={{ padding: '16px', backgroundColor: '#F5F3FF', borderRadius: '14px', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#5B21B6' }}>{currentAverageRating}</div>
              <div>
                <div style={{ color: '#FBBF24', fontSize: '16px', fontWeight: 700 }}>★ {currentAverageRating} / 5.0</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Basé sur {reviewList.length} avis certifiés</div>
              </div>
            </div>

            {reviewList.map((rev) => (
              <div key={rev.id} style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{rev.authorName}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{rev.date}</span>
                </div>
                <div style={{ color: '#FBBF24', fontSize: '12px', margin: '2px 0' }}>{'★'.repeat(rev.rating)}</div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.5 }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* INLINE PRIMARY CONTACT CTA */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={onContactClick}
            disabled={isExpired}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: isExpired ? '#CBD5E1' : '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: isExpired ? 'not-allowed' : 'pointer',
              boxShadow: isExpired ? 'none' : '0 4px 12px rgba(91, 33, 182, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>Contacter le prestataire</span>
            <span>💬</span>
          </button>
        </div>
      </div>

      {/* AJOUTER UN AVIS MODAL */}
      {isAddReviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <form
            onSubmit={handleAddReviewSubmit}
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ⭐ Laisser un avis pour {displayName}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Votre note globale
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    style={{
                      fontSize: '30px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: star <= newRating ? '#FBBF24' : '#CBD5E1',
                      transition: 'transform 0.1s ease',
                      padding: '0 4px',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* AUTOMATIC ACCOUNT NAME NOTICE */}
            <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
              👤 Publié en tant que : <strong style={{ color: '#0F172A' }}>{currentUserAccountName}</strong> (Compte vérifié)
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Votre avis / commentaire (optionnel)
              </label>
              <textarea
                placeholder="Partagez votre expérience avec ce prestataire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsAddReviewModalOpen(false)}
                style={{ minHeight: '42px', padding: '0 16px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{ minHeight: '42px', padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: '#5B21B6', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Envoyer mon avis →
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};
