'use client';

import React, { useState, useMemo } from 'react';
import { OpeningHourItem, PublicationItem, ReviewItem } from './IndividualProviderProfile';
import { PublicationCard } from '../feed/PublicationCard';
import { EmptyState } from '../ui/EmptyState';

export interface CampusItem {
  id: string;
  name: string;
  address: string;
  phone?: string;
  locationGeom?: string;
  contactPhones?: { label: string; number: string }[];
  openingHours?: Record<string, string>;
  coursesAvailable?: { levelCode: string; priceXAF?: number }[];
}

export interface ActiveCourseItem {
  id: string;
  levelCode: string;
  name: string;
  format: string;
  schedule: string;
  priceXAF: number;
  seatsLeft: number;
  startDate: string;
}

export interface DeutschInstitutProfileProps {
  id: string;
  displayName: string;
  shortBio: string;
  fullDescription: string;
  profilePicUrl?: string;
  coverPicUrl?: string;
  yearFounded?: number;
  campuses?: CampusItem[];
  activeCourses?: ActiveCourseItem[];
  services?: { id?: string; title: string; priceXAF?: number; priceText?: string; description: string }[];
  openingHours?: OpeningHourItem[];
  publications?: PublicationItem[];
  reviews?: ReviewItem[];
  subscriptionStatus?: 'ACTIVE' | 'GRACE_1' | 'GRACE_2' | 'EXPIRED';
  followerCount?: number;
  isFollowing?: boolean;
  currentUserAccountName?: string;
  verified?: boolean;
  likedPublicationIds?: Set<string>;
  publicationLikesMap?: Record<string, number>;
  onLikePublication?: (pubId: string) => void;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
  onBack?: () => void;
}

const defaultInstitutCourses: ActiveCourseItem[] = [
  {
    id: 'c-1',
    levelCode: 'B2',
    name: 'Préparation Prépa-TestDaF Intensive B2',
    format: 'Présentiel + Laboratoire de langue',
    schedule: 'Lun – Ven (08h00 – 12h30)',
    priceXAF: 120000,
    seatsLeft: 4,
    startDate: '01 Sept. 2026',
  },
  {
    id: 'c-2',
    levelCode: 'B1',
    name: 'Allemand Intermédiaire Goethe-Zertifikat B1',
    format: 'Présentiel',
    schedule: 'Lun – Jeu (13h30 – 17h00)',
    priceXAF: 95000,
    seatsLeft: 8,
    startDate: '15 Sept. 2026',
  },
  {
    id: 'c-3',
    levelCode: 'A2',
    name: 'Allemand Élémentaire A2',
    format: 'Présentiel',
    schedule: 'Samedi (08h00 – 15h00)',
    priceXAF: 75000,
    seatsLeft: 12,
    startDate: '20 Sept. 2026',
  },
];

export const defaultInstitutCampuses: CampusItem[] = [
  {
    id: 'camp-1',
    name: 'Campus Douala — Akwa',
    address: 'Boulevard de la Liberté, face Direction Orange, Douala',
    contactPhones: [{ label: 'Accueil Douala', number: '+237 699 00 11 22' }],
  },
  {
    id: 'camp-2',
    name: 'Campus Yaoundé — Bastos',
    address: 'Avenue Rosa Parks, à 200m Ambassade d\'Allemagne, Yaoundé',
    contactPhones: [{ label: 'Accueil Yaoundé', number: '+237 677 33 44 55' }],
  },
];

const defaultInstitutHours: OpeningHourItem[] = [
  { day: 'Lundi', hours: '07:30 – 18:30', isToday: true },
  { day: 'Mardi', hours: '07:30 – 18:30' },
  { day: 'Mercredi', hours: '07:30 – 18:30' },
  { day: 'Jeudi', hours: '07:30 – 18:30' },
  { day: 'Vendredi', hours: '07:30 – 18:30' },
  { day: 'Samedi', hours: '08:00 – 15:00' },
  { day: 'Dimanche', hours: 'Fermé' },
];

const defaultInstitutReviews: ReviewItem[] = [
  {
    id: 'rev-inst-1',
    authorName: 'Emmanuel K.',
    rating: 5,
    date: '10 Août 2026',
    comment: 'Excellente école d\'allemand ! J\'ai réussi mon Goethe-Zertifikat B2 du premier coup.',
  },
  {
    id: 'rev-inst-2',
    authorName: 'Chantal M.',
    rating: 5,
    date: '04 Août 2026',
    comment: 'Enseignants très qualifiés et labo de langue moderne. Je recommande vivement !',
  },
];

export const DeutschInstitutProfile: React.FC<DeutschInstitutProfileProps> = ({
  displayName,
  shortBio,
  fullDescription,
  profilePicUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
  coverPicUrl,
  yearFounded = 2018,
  verified = true,
  campuses = defaultInstitutCampuses,
  activeCourses = defaultInstitutCourses,
  services,
  openingHours = defaultInstitutHours,
  publications = [],
  reviews = defaultInstitutReviews,
  subscriptionStatus = 'ACTIVE',
  followerCount = 380,
  isFollowing = false,
  currentUserAccountName = 'Marc ALAIN',
  likedPublicationIds,
  publicationLikesMap,
  onLikePublication,
  onFollowToggle,
  onContactClick,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'services' | 'content' | 'campuses' | 'hours' | 'reviews'>('info');
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);

  // REVIEWS STATE FOR INSTITUT
  const [reviewList, setReviewList] = useState<ReviewItem[]>(reviews && reviews.length > 0 ? reviews : defaultInstitutReviews);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');

  const currentAverageRating = useMemo(() => {
    if (reviewList.length === 0) return 4.8;
    const sum = reviewList.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviewList.length) * 10) / 10;
  }, [reviewList]);

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
      comment: newComment.trim() || 'Avis positif laissé sur le profil de l\'institut.',
    };
    setReviewList([newRevItem, ...reviewList]);
    setIsAddReviewModalOpen(false);
    setNewComment('');
    setNewRating(5);
  };

  const displayCourses = activeCourses && activeCourses.length > 0 ? activeCourses : defaultInstitutCourses;
  const displayCampuses = campuses && campuses.length > 0 ? campuses : defaultInstitutCampuses;
  const displayHours = openingHours && openingHours.length > 0 ? openingHours : defaultInstitutHours;
  const displayServices = services && services.length > 0 ? services : [
    {
      id: 'serv-inst-1',
      title: 'Formation Linguistique Allemande Intensif (A1-C1)',
      priceXAF: 95000,
      priceText: '95.000 FCFA',
      description: 'Module complet d\'apprentissage de la langue avec certification officielle.',
    },
    {
      id: 'serv-inst-2',
      title: 'Session d\'Examen Officiel Goethe-Zertifikat / TestDaF',
      priceXAF: 45000,
      priceText: '45.000 FCFA',
      description: 'Passation des épreuves écrites et orales dans nos centres agréés.',
    },
  ];

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
      {/* EXPIRED BLUR OVERLAY */}
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
            L&apos;abonnement de cet institut d&apos;allemand a expiré. Ce profil est temporairement masqué en attente de renouvellement.
          </p>
        </div>
      )}

      {/* HERO CONTAINER */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          backgroundColor: '#047857',
          backgroundImage: `url(${coverPicUrl || profilePicUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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

        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
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
              }}
            >
              ← Retour
            </button>
          )}

          <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#047857', color: '#FFFFFF', padding: '4px 12px', borderRadius: '9999px', marginLeft: 'auto' }}>
            DEUTSCH INSTITUT
          </span>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '16px', right: '16px', zIndex: 10, color: '#FFFFFF' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            {displayName}
          </h1>
          <div style={{ fontSize: '13px', color: '#A7F3D0', fontWeight: 600, marginTop: '2px' }}>
            {shortBio}
          </div>
          <div style={{ fontSize: '12px', color: '#FBBF24', fontWeight: 700, marginTop: '6px' }}>
            ★ {currentAverageRating} ({reviewList.length} avis)
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
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontWeight: 800,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #A7F3D0',
                flexShrink: 0,
              }}
            >
              🏫
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                INSTITUT D&apos;ALLEMAND CERTIFIÉ — Fondé en {yearFounded}
              </div>
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600, marginTop: '1px' }}>
                Centre d&apos;examens Goethe & TestDaF Partner
              </div>
            </div>
          </div>

          <button
            onClick={handleFollow}
            style={{
              minHeight: '38px',
              padding: '0 14px',
              borderRadius: '10px',
              border: following ? '1px solid #E2E8F0' : '1px solid #047857',
              backgroundColor: following ? '#F8FAFC' : '#047857',
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

      {/* INSTITUT TABBED DISCLOSURE */}
      <div style={{ padding: '16px 16px 10px 16px' }}>
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
            { id: 'info', label: 'Présentation' },
            { id: 'courses', label: `Cours (${displayCourses.length})` },
            { id: 'services', label: `Services & Tarifs (${displayServices.length})` },
            { id: 'content', label: `Publications (${publications.length})` },
            { id: 'campuses', label: `Campus (${displayCampuses.length})` },
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
                  borderBottom: isTabActive ? '3px solid #047857' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isTabActive ? '#047857' : '#64748B',
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
        {activeTab === 'info' && (
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {fullDescription}
          </div>
        )}

        {/* TAB 2: COURS DISPONIBLES (IMAGE 4 REFERENCE) */}
        {activeTab === 'courses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayCourses.map((crs) => (
              <div key={crs.id} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '4px' }}>
                      NIVEAU {crs.levelCode}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '4px 0 0 0' }}>
                      {crs.name}
                    </h4>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#047857', whiteSpace: 'nowrap' }}>
                    {crs.priceXAF.toLocaleString()} FCFA
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>📅 Début: {crs.startDate}</span>
                  <span>🕒 {crs.schedule}</span>
                  <span>🪑 {crs.seatsLeft} places restantes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2.5: SERVICES & TARIFS (IMAGE 2 REFERENCE) */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayServices.map((serv, idx) => (
              <div
                key={serv.id || idx}
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {serv.title}
                  </h4>
                  {(serv.priceText || serv.priceXAF) && (
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#047857', whiteSpace: 'nowrap' }}>
                      {serv.priceText || `${serv.priceXAF?.toLocaleString()} FCFA`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.5 }}>
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
                      roleId: 'DEUTSCH_INSTITUT',
                      title: pub.title,
                      body: pub.body,
                      createdAt: pub.createdAt,
                      status: 'PUBLISHED',
                      mediaType: pub.mediaType,
                      mediaUrls: pub.mediaUrls,
                      providerName: pub.providerName || displayName,
                      providerRole: pub.providerRole || 'DEUTSCH_INSTITUT',
                      providerCity: pub.providerCity || 'Yaoundé',
                      providerVerified: pub.providerVerified ?? verified,
                    }}
                    isFollowed={isFollowing}
                    onFollowClick={onFollowToggle}
                    isLiked={likedPublicationIds?.has(pub.id)}
                    likeCount={publicationLikesMap?.[pub.id] ?? 12}
                    onLikeClick={onLikePublication ? () => onLikePublication(pub.id) : undefined}
                    onContactClick={onContactClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📢"
                title="Aucune publication pour cet institut"
                description="Cet institut d'allemand n'a pas encore publié d'annonces d'information."
              />
            )}
          </div>
        )}

        {/* TAB 4: CAMPUS (IMAGE 3 REFERENCE) */}
        {activeTab === 'campuses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayCampuses.map((camp) => (
              <div key={camp.id} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  📍 {camp.name}
                </h4>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{camp.address}</div>
                {(camp.phone || (camp.contactPhones && camp.contactPhones.length > 0)) && (
                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '6px' }}>
                    📞 {camp.phone || `${camp.contactPhones?.[0]?.label}: ${camp.contactPhones?.[0]?.number}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: HORAIRES D'OUVERTURE */}
        {activeTab === 'hours' && (
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
              🕒 Horaires de l&apos;Institut
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
                    backgroundColor: h.isToday ? '#ECFDF5' : '#FFFFFF',
                    border: h.isToday ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: h.isToday ? 800 : 600, color: h.isToday ? '#047857' : '#334155' }}>
                    {h.day} {h.isToday && '(Aujourd\'hui)'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: h.isToday ? '#047857' : '#64748B' }}>
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AVIS ET ÉVALUATIONS */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                  backgroundColor: '#047857',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(4, 120, 87, 0.25)',
                }}
              >
                <span>✍️</span>
                <span>Ajouter un avis</span>
              </button>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '14px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#047857' }}>{currentAverageRating}</div>
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

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={onContactClick}
            disabled={isExpired}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: isExpired ? '#CBD5E1' : '#047857',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: isExpired ? 'not-allowed' : 'pointer',
              boxShadow: isExpired ? 'none' : '0 4px 12px rgba(4, 120, 87, 0.25)',
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
            <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0', fontSize: '12px', color: '#047857' }}>
              👤 Publié en tant que : <strong style={{ color: '#0F172A' }}>{currentUserAccountName}</strong> (Compte vérifié)
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Votre avis / commentaire (optionnel)
              </label>
              <textarea
                placeholder="Partagez votre expérience avec cet institut..."
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
                style={{ minHeight: '42px', padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: '#047857', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
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
