'use client';

import React, { useState, useRef } from 'react';
import { PassProPaymentModal } from '../subscription/PassProPaymentModal';
import { PublicationCard } from '../feed/PublicationCard';
import { ProviderProfileEditorModal } from './ProviderProfileEditorModal';

export interface RoleDashboardItem {
  userRoleId: string;
  roleCode: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT';
  roleName: string;
  displayName: string;
  status: string;
  isConfigured: boolean;
  publicationStatus: 'DRAFT' | 'CONFIGURED' | 'PUBLISHED' | 'UNPUBLISHED';
  subscriptionStatus: 'ACTIVE' | 'GRACE_1' | 'GRACE_2' | 'EXPIRED';
  expirationDate: string;
  graceDaysLeft?: number;
  priceXAF: number;
  followers: number;
  rating: number;
  reviewCount: number;
  bio: string;
  fullDescription?: string;
  profilePicUrl?: string;
  coverPicUrl?: string;
  city: string;
  quarter?: string;
  contactEmail?: string;
  latitude?: number;
  longitude?: number;
  phoneNumbers?: { label: string; number: string }[];
  services?: { id?: string; title: string; priceXAF?: number; priceText?: string; description: string }[];
  openingHours?: { day: string; hours: string; isToday?: boolean }[];
  courses?: { id?: string; levelCode: string; name: string; format: string; schedule: string; priceXAF: number; seatsLeft: number; startDate: string }[];
  campuses?: { id?: string; name: string; address: string; city?: string; quarter?: string; phone?: string; contactPhones?: { label: string; number: string }[]; description?: string }[];
}

export interface PublishedContentItem {
  id: string;
  roleId: string;
  title: string;
  body: string;
  createdAt: string;
  status: 'PUBLISHED' | 'DRAFT' | 'HIDDEN' | 'EXPIRED';
  daysLeft?: number;
  mediaType?: 'photo' | 'video' | 'mixed';
  mediaUrls?: string[];
  providerName?: string;
  providerRole?: string;
  providerCity?: string;
  providerVerified?: boolean;
  viewCount?: number;
  likeCount?: number;
}

export interface MediaGalleryItem {
  id: string;
  roleId: string;
  type: 'photo' | 'video' | 'text';
  title: string;
  url?: string;
  body?: string;
  createdAt: string;
}

export interface FollowerItem {
  id: string;
  name: string;
  city: string;
  dateSubscribed: string;
  avatar: string;
  roleTag: string;
}

export interface ProviderReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  targetRole: string;
}

export interface ProviderDashboardProps {
  unlockedRoles: RoleDashboardItem[];
  activeRole: RoleDashboardItem | null;
  posts: PublishedContentItem[];
  mediaItems?: MediaGalleryItem[];
  unreadMessagesCount?: number;
  onSelectRole: (roleId: string) => void;
  onAddRole: (newRoleData: Omit<RoleDashboardItem, 'userRoleId'>) => void;
  onTogglePublish?: (roleId: string, publish: boolean) => void;
  onUpdateRoleProfile?: (roleId: string, updatedData: Partial<RoleDashboardItem>) => void;
  onRenewRoleSubscription?: (roleId: string) => void;
  onCreatePublication?: (roleId: string, title: string, body: string, mediaType?: 'photo' | 'video' | 'mixed', mediaUrls?: string[]) => void;
  onTogglePublicationStatus?: (publicationId: string) => void;
  onRepublishPublication?: (publicationId: string) => void;
  onDeletePublication?: (publicationId: string) => void;
  onCreateMedia?: (roleId: string, type: 'photo' | 'video' | 'text', title: string, url?: string, body?: string) => void;
  onDeleteMedia?: (mediaId: string) => void;
  onOpenRoleMessages?: (roleCode: string) => void;
}

const ALL_V1_ROLES: {
  code: RoleDashboardItem['roleCode'];
  name: string;
  tagline: string;
  description: string;
  priceXAF: number;
  priceText: string;
  icon: string;
}[] = [
  {
    code: 'BETREUER',
    name: 'Betreuer',
    tagline: 'Accompagnement & Logement Étudiant',
    description: 'Service d\'assistance locale, recherche de chambre d\'étudiant (Wohnheim/WG) et démarches d\'installation.',
    priceXAF: 2000,
    priceText: '2.000 FCFA / mois',
    icon: '🏠',
  },
  {
    code: 'LEHRER',
    name: 'Enseignant',
    tagline: 'Enseignant DSH / TestDaF',
    description: 'Professeur particulier qualifié proposant des cours intensifs de préparation aux épreuves linguistiques.',
    priceXAF: 4000,
    priceText: '4.000 FCFA / mois',
    icon: '🎓',
  },
  {
    code: 'VISA_COMPANION',
    name: 'Accompagnateur Visa',
    tagline: 'Accompagnateur Visa Allemagne',
    description: 'Expert en accompagnement de procédures de demande de visa d\'études, audit Sperrkonto et rendez-vous ambassade.',
    priceXAF: 7000,
    priceText: '7.000 FCFA / mois',
    icon: '🛂',
  },
  {
    code: 'DEUTSCH_INSTITUT',
    name: 'Institut de langue',
    tagline: 'Institut / École d\'Allemand',
    description: 'Centre de formation linguistique agréé préparant aux examens officiels Goethe-Zertifikat A1-C1 et TestDaF.',
    priceXAF: 10000,
    priceText: '10.000 FCFA / mois',
    icon: '🏫',
  },
];

const sampleFollowers: FollowerItem[] = [
  { id: 'fol-1', name: 'Marc ALAIN', city: 'Yaoundé', dateSubscribed: '02 Août 2026', avatar: '👨‍🎓', roleTag: 'Candidat Étudiant' },
  { id: 'fol-2', name: 'Sandrine TCHOUA', city: 'Douala', dateSubscribed: '05 Août 2026', avatar: '👩‍🎓', roleTag: 'Candidat Master' },
  { id: 'fol-3', name: 'Jean-Paul KOUAM', city: 'Bafoussam', dateSubscribed: '10 Août 2026', avatar: '👨‍💻', roleTag: 'Candidat TestDaF' },
  { id: 'fol-4', name: 'Carine MBIDA', city: 'Douala', dateSubscribed: '11 Août 2026', avatar: '👩‍🔬', roleTag: 'Candidat Visa' },
];

const sampleReviews: ProviderReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Jean-Marc K.',
    rating: 5,
    date: '12 Août 2026',
    comment: 'Service d\'accompagnement exemplaire pour la constitution de mon dossier et la réservation de logement. Réponses très rapides et conseils avisés !',
    targetRole: 'Betreuer',
  },
  {
    id: 'rev-2',
    authorName: 'Sandrine T.',
    rating: 5,
    date: '02 Août 2026',
    comment: 'Très professionnel et à l\'écoute. Mon dossier d\'admission et visa ont été validés rapidement grâce à ses vérifications rigoureuses.',
    targetRole: 'Enseignant',
  },
  {
    id: 'rev-3',
    authorName: 'Eric M.',
    rating: 4,
    date: '28 Juillet 2026',
    comment: 'Super préparation pour les épreuves de compréhension orale et d\'expression écrite du TestDaF.',
    targetRole: 'Enseignant',
  },
];

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  unlockedRoles,
  activeRole,
  posts,
  unreadMessagesCount = 0,
  onSelectRole,
  onAddRole,
  onUpdateRoleProfile,
  onRenewRoleSubscription,
  onCreatePublication,
  onTogglePublicationStatus,
  onRepublishPublication,
  onDeletePublication,
  onOpenRoleMessages,
}) => {
  const [activeDashboardSection, setActiveDashboardSection] = useState<'publications' | 'followers' | 'reviews' | 'courses'>('publications');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetRole, setPaymentTargetRole] = useState<{ code?: string; name?: string; priceXAF?: number }>({});

  const [isAddRoleWizardOpen, setIsAddRoleWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [selectedRoleCode, setSelectedRoleCode] = useState<RoleDashboardItem['roleCode'] | null>(null);

  const [paymentProvider, setPaymentProvider] = useState<'ORANGE_MONEY' | 'MTN_MOMO'>('ORANGE_MONEY');
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('699000000');

  const [roleDisplayName, setRoleDisplayName] = useState('');
  const [roleBio, setRoleBio] = useState('');
  const [roleCity, setRoleCity] = useState('Douala');
  const [rolePhone, setRolePhone] = useState('+237 699 11 22 33');

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(activeRole?.displayName || '');
  const [editBio, setEditBio] = useState(activeRole?.bio || '');
  const [editCity, setEditCity] = useState(activeRole?.city || '');

  // Add Publication Modal State (📢 Publications)
  const [isAddPublicationModalOpen, setIsAddPublicationModalOpen] = useState(false);
  const [newPubTitle, setNewPubTitle] = useState('');
  const [newPubBody, setNewPubBody] = useState('');
  const [pubPhotos, setPubPhotos] = useState<string[]>([]);
  const [pubVideoUrl, setPubVideoUrl] = useState('');
  const [pubVideoFileName, setPubVideoFileName] = useState('');

  // Course Management State (🎓 Cours Actuels - Institut Dashboard Only)
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseLevelCode, setCourseLevelCode] = useState('B2');
  const [courseName, setCourseName] = useState('');
  const [coursePriceXAF, setCoursePriceXAF] = useState(120000);
  const [courseFormat, setCourseFormat] = useState('Présentiel + Laboratoire de langue');
  const [courseSchedule, setCourseSchedule] = useState('Lun – Ven (08h00 – 12h30)');
  const [courseStartDate, setCourseStartDate] = useState('01 Sept. 2026');
  const [courseSeatsLeft, setCourseSeatsLeft] = useState(4);

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const existingRoleCodes = new Set(unlockedRoles.map((r) => r.roleCode));
  const availableRolesToCreate = ALL_V1_ROLES.filter((r) => !existingRoleCodes.has(r.code));
  const isMaxRolesReached = unlockedRoles.length >= 4 || availableRolesToCreate.length === 0;

  const activeRolePosts = activeRole ? posts.filter((p) => p.roleId === activeRole.userRoleId) : [];

  const getCreateProfileCtaLabel = (roleCode?: string) => {
    switch (roleCode) {
      case 'BETREUER':
        return 'Créer votre profil de Betreuer';
      case 'LEHRER':
        return "Créer votre profil d'Enseignant";
      case 'VISA_COMPANION':
        return "Créer votre profil d'Accompagnateur Visa";
      case 'DEUTSCH_INSTITUT':
        return "Créer votre profil d'Institut de langue";
      default:
        return 'Créer votre profil Prestataire';
    }
  };

  const handleStartRoleRenewal = (role: RoleDashboardItem) => {
    setPaymentTargetRole({
      code: role.roleCode,
      name: role.roleName,
      priceXAF: role.priceXAF,
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    if (paymentTargetRole.code && activeRole) {
      onRenewRoleSubscription?.(activeRole.userRoleId);
    }
    setIsPaymentModalOpen(false);
  };

  // DEVICE FILE SELECTION HANDLERS FOR MIXED MEDIA
  const handlePhotoFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - pubPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPubPhotos((prev) => [...prev, event.target!.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPubVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPubVideoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (e.target) e.target.value = '';
  };

  const handleCreatePublicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle.trim() || !newPubBody.trim() || !activeRole || activeRole.subscriptionStatus === 'EXPIRED') return;

    let mediaUrls: string[] = [];
    let computedMediaType: 'photo' | 'video' | 'mixed' | undefined = undefined;

    const validPhotos = pubPhotos.filter((p) => p.length > 0).slice(0, 3);
    const hasVideo = Boolean(pubVideoUrl);

    if (validPhotos.length > 0 && hasVideo) {
      computedMediaType = 'mixed';
      mediaUrls = [...validPhotos, pubVideoUrl];
    } else if (validPhotos.length > 0) {
      computedMediaType = 'photo';
      mediaUrls = validPhotos;
    } else if (hasVideo) {
      computedMediaType = 'video';
      mediaUrls = [pubVideoUrl];
    }

    if (onCreatePublication) {
      onCreatePublication(
        activeRole.userRoleId,
        newPubTitle.trim(),
        newPubBody.trim(),
        computedMediaType as any,
        mediaUrls.length > 0 ? mediaUrls : undefined
      );
    }

    setNewPubTitle('');
    setNewPubBody('');
    setPubPhotos([]);
    setPubVideoUrl('');
    setPubVideoFileName('');
    setIsAddPublicationModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRole || activeRole.subscriptionStatus === 'EXPIRED') return;
    if (onUpdateRoleProfile) {
      onUpdateRoleProfile(activeRole.userRoleId, {
        displayName: editName,
        bio: editBio,
        city: editCity,
        isConfigured: true,
      });
    }
    setIsEditProfileModalOpen(false);
  };

  const handleWizardStep1Next = (code: RoleDashboardItem['roleCode']) => {
    setSelectedRoleCode(code);
    const roleInfo = ALL_V1_ROLES.find((r) => r.code === code);
    setRoleDisplayName(roleInfo ? `${roleInfo.name} — Pro` : 'Profil Prestataire');
    setWizardStep(2);
  };

  const handleWizardStep2PaymentComplete = () => {
    if (!selectedRoleCode) return;
    const roleInfo = ALL_V1_ROLES.find((r) => r.code === selectedRoleCode);

    const newRoleObj: Omit<RoleDashboardItem, 'userRoleId'> = {
      roleCode: selectedRoleCode,
      roleName: roleInfo ? roleInfo.name : 'Prestataire',
      displayName: roleDisplayName.trim() || (roleInfo ? roleInfo.name : 'Prestataire'),
      status: 'ACTIVE',
      isConfigured: false,
      publicationStatus: 'DRAFT',
      subscriptionStatus: 'ACTIVE',
      expirationDate: '13 Sept. 2026',
      priceXAF: roleInfo ? roleInfo.priceXAF : 2000,
      followers: 0,
      rating: 5.0,
      reviewCount: 0,
      city: roleCity,
      bio: roleBio.trim() || roleInfo?.description || 'Nouveau profil prestataire.',
      phoneNumbers: [{ label: 'Accueil', number: rolePhone }],
    };

    onAddRole(newRoleObj);
    setIsAddRoleWizardOpen(false);
    setWizardStep(1);
    setSelectedRoleCode(null);
  };

  function renderWizard() {
    const roleObj = ALL_V1_ROLES.find((r) => r.code === selectedRoleCode);
    const roleNameStr = roleObj ? roleObj.name : 'Enseignant';
    const priceFormatted = roleObj ? roleObj.priceText : '4,000 FCFA / mois';

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          className="animate-slide-up"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            textAlign: 'left',
          }}
        >
          <button
            type="button"
            onClick={() => setIsAddRoleWizardOpen(false)}
            aria-label="Fermer"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
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

          {wizardStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px' }}>💳</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Choisissez votre nouveau rôle
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Chaque rôle dispose de son propre tarif d&apos;abonnement indépendant.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {availableRolesToCreate.map((role) => (
                  <div
                    key={role.code}
                    onClick={() => handleWizardStep1Next(role.code)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: '#F5F3FF',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {role.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {role.name}
                        </h4>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B21B6' }}>
                          {role.priceText}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💳</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Abonnement {roleNameStr}
                </h3>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Paiement d&apos;abonnement dédié pour débloquer votre profil {roleNameStr}.
              </p>

              <div style={{ padding: '16px', backgroundColor: '#F5F3FF', borderRadius: '16px', border: '1px solid #DDD6FE' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TARIF ABONNEMENT RÔLE:
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {priceFormatted}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  MODE DE PAIEMENT MOBILE MONEY
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('ORANGE_MONEY')}
                    style={{
                      minHeight: '46px',
                      borderRadius: '12px',
                      border: paymentProvider === 'ORANGE_MONEY' ? '2px solid #D97706' : '1px solid #E2E8F0',
                      backgroundColor: paymentProvider === 'ORANGE_MONEY' ? '#FFFBEB' : '#FFFFFF',
                      color: '#B45309',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🟠</span>
                    <span>Orange Money (#150#)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('MTN_MOMO')}
                    style={{
                      minHeight: '46px',
                      borderRadius: '12px',
                      border: paymentProvider === 'MTN_MOMO' ? '2px solid #D97706' : '1px solid #E2E8F0',
                      backgroundColor: paymentProvider === 'MTN_MOMO' ? '#FFFBEB' : '#FFFFFF',
                      color: '#B45309',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🟡</span>
                    <span>MTN MoMo (*126#)</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  NUMÉRO DE TÉLÉPHONE MOBILE MONEY
                </label>
                <input
                  type="tel"
                  value={paymentPhoneNumber}
                  onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                  placeholder="699000000"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleWizardStep2PaymentComplete}
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
                  marginTop: '4px',
                  boxShadow: '0 4px 14px rgba(91, 33, 182, 0.3)',
                }}
              >
                Payer {priceFormatted}
              </button>

              <button
                type="button"
                onClick={() => setWizardStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '2px',
                }}
              >
                ← Choisir un autre rôle
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!unlockedRoles || unlockedRoles.length === 0 || !activeRole) {
    return (
      <div
        style={{
          maxWidth: '680px',
          margin: '32px auto',
          padding: '40px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.06)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Aucun Dashboard disponible
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', marginBottom: '24px', lineHeight: 1.6 }}>
          Vous n&apos;avez pas encore de rôle prestataire sur la plateforme RECHERCHE.
          <br />
          Ajoutez un rôle pour proposer vos services d&apos;enseignement, de logement, ou d&apos;accompagnement visa.
        </p>

        {!isMaxRolesReached && (
          <button
            onClick={() => {
              setWizardStep(1);
              setIsAddRoleWizardOpen(true);
            }}
            style={{
              minHeight: '48px',
              padding: '0 28px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(91, 33, 182, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>+</span>
            <span>Ajouter un rôle</span>
          </button>
        )}

        {isAddRoleWizardOpen && renderWizard()}
      </div>
    );
  }

  const isExpiredRole = activeRole.subscriptionStatus === 'EXPIRED';
  const isGraceRole = activeRole.subscriptionStatus === 'GRACE_1' || activeRole.subscriptionStatus === 'GRACE_2';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* HEADER & ROLE SELECTOR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#5B21B6', backgroundColor: '#F5F3FF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #DDD6FE' }}>
                DASHBOARD PRESTATAIRE
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor:
                    activeRole.subscriptionStatus === 'ACTIVE'
                      ? '#ECFDF5'
                      : isGraceRole
                      ? '#FFFBEB'
                      : '#FEF2F2',
                  color:
                    activeRole.subscriptionStatus === 'ACTIVE'
                      ? '#047857'
                      : isGraceRole
                      ? '#B45309'
                      : '#DC2626',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                {activeRole.subscriptionStatus === 'ACTIVE'
                  ? '🟢 ABONNEMENT ACTIF'
                  : isGraceRole
                  ? '🟠 DÉLAI DE GRÂCE (2 JOURS)'
                  : '🔴 ABONNEMENT EXPIRÉ'}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '6px', margin: 0 }}>
              Mon Dashboard — {activeRole.displayName}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => onOpenRoleMessages?.(activeRole.roleCode)}
              style={{
                minHeight: '40px',
                padding: '0 14px',
                backgroundColor: '#F5F3FF',
                color: '#5B21B6',
                border: '1px solid #DDD6FE',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              aria-label={`Ouvrir les messages pour ${activeRole.roleName}`}
            >
              <span>💬 Messages</span>
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {isGraceRole && (
              <button
                type="button"
                onClick={() => handleStartRoleRenewal(activeRole)}
                style={{
                  minHeight: '40px',
                  padding: '0 14px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                }}
              >
                <span>🔄</span>
                <span>Renouveler l&apos;abonnement</span>
              </button>
            )}

            <button
              type="button"
              disabled={isExpiredRole}
              onClick={() => {
                if (isExpiredRole) return;
                setEditName(activeRole.displayName);
                setEditBio(activeRole.bio || '');
                setEditCity(activeRole.city || '');
                setIsEditProfileModalOpen(true);
              }}
              style={{
                minHeight: '40px',
                padding: '0 14px',
                backgroundColor: isExpiredRole ? '#F1F5F9' : '#FFFFFF',
                color: isExpiredRole ? '#94A3B8' : '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isExpiredRole ? 'not-allowed' : 'pointer',
                opacity: isExpiredRole ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title={isExpiredRole ? "Profil verrouillé. Renouvelez votre abonnement pour modifier." : ""}
            >
              <span>✏️</span>
              <span>Modifier le profil</span>
            </button>
          </div>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', flexShrink: 0 }}>
            Changer de rôle ({unlockedRoles.length}/4):
          </span>
          {unlockedRoles.map((role) => {
            const isSel = activeRole.userRoleId === role.userRoleId;
            const statusDot =
              role.subscriptionStatus === 'ACTIVE'
                ? '🟢'
                : role.subscriptionStatus === 'GRACE_1' || role.subscriptionStatus === 'GRACE_2'
                ? '🟠'
                : '🔴';
            const statusText =
              role.subscriptionStatus === 'ACTIVE'
                ? 'Actif'
                : role.subscriptionStatus === 'GRACE_1'
                ? 'Grâce 1 jour'
                : role.subscriptionStatus === 'GRACE_2'
                ? 'Grâce 2 jours'
                : 'Expiré';

            return (
              <button
                key={role.userRoleId}
                onClick={() => onSelectRole(role.userRoleId)}
                style={{
                  minHeight: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: isSel ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  color: isSel ? '#5B21B6' : '#475569',
                  fontWeight: isSel ? 800 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
                <span>{statusDot}</span>
                <span>{role.roleName} — {statusText}</span>
              </button>
            );
          })}

          {!isMaxRolesReached && (
            <button
              onClick={() => {
                setWizardStep(1);
                setIsAddRoleWizardOpen(true);
              }}
              style={{
                minHeight: '38px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px dashed #5B21B6',
                backgroundColor: '#FFFFFF',
                color: '#5B21B6',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + Ajouter un rôle
            </button>
          )}
        </div>
      </div>

      {/* RENEWAL CTA BANNER WHEN EXPIRED (REQUIREMENT 2 & 8 - PLACED DIRECTLY BELOW MAIN HEADER) */}
      {isExpiredRole && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            borderRadius: '20px',
            padding: '24px',
            border: '2px solid #FCA5A5',
            boxShadow: '0 8px 24px -4px rgba(220, 38, 38, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #FCA5A5',
              }}
            >
              🔒
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Abonnement {activeRole.roleName} Expiré — Accès Verrouillé
                </h2>
                <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#DC2626', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                  GRÂCE EXPIRÉE
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
                Le délai de grâce de 2 jours est terminé. Votre profil n&apos;est plus visible dans la recherche publique et vos annonces ont été masquées du fil Infos.
                <br />
                <strong>Vos données et vos publications restent intactes et conservées en toute sécurité.</strong> Renouvelez dès maintenant pour débloquer votre dashboard et réapparaître immédiatement en ligne.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => handleStartRoleRenewal(activeRole)}
              style={{
                minHeight: '48px',
                padding: '0 24px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🔄</span>
              <span>Renouveler l&apos;abonnement ({activeRole.priceXAF.toLocaleString('fr-FR')} FCFA / mois)</span>
            </button>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B91C1C' }}>
              🟢 Déblocage instantané après paiement Mobile Money
            </span>
          </div>
        </div>
      )}

      {/* NOTIFICATION BANNER FOR GRACE PERIOD */}
      {isGraceRole && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid #FCD34D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                Abonnement expiré — Délai de grâce actif (2 jours)
              </div>
              <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                Renouvelez avant la fin du délai de grâce pour éviter le verrouillage du profil et le retrait du fil Infos.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleStartRoleRenewal(activeRole)}
            style={{
              minHeight: '38px',
              padding: '0 16px',
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Renouveler (2.000 FCFA)
          </button>
        </div>
      )}

      {/* REQUIREMENT 3 & 4: DASHBOARD CONTENT CONTAINER (BLURRED & OBSCURED UNDERNEATH WHEN EXPIRED) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          filter: isExpiredRole ? 'blur(8px)' : 'none',
          opacity: isExpiredRole ? 0.45 : 1,
          pointerEvents: isExpiredRole ? 'none' : 'auto',
          userSelect: isExpiredRole ? 'none' : 'auto',
          transition: 'all 0.3s ease',
        }}
      >
      {!activeRole.isConfigured ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '48px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.05)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              backgroundColor: '#F5F3FF',
              color: '#5B21B6',
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid #DDD6FE',
            }}
          >
            ✨
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {getCreateProfileCtaLabel(activeRole.roleCode)}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '10px', marginBottom: '28px', maxWidth: '460px', lineHeight: 1.6 }}>
            Félicitations pour votre abonnement ! Remplissez les informations de votre profil pour être visible auprès des candidats et démarrer votre activité.
          </p>
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            style={{
              minHeight: '52px',
              padding: '0 32px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🚀</span>
            <span>{getCreateProfileCtaLabel(activeRole.roleCode)}</span>
          </button>
        </div>
      ) : (
        <>
          {/* CLICKABLE INTERACTIVE SUMMARY CARDS (Abonnés, Publications, Avis Reçus, and Cours Actuels for Institut) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { id: 'followers', label: 'Abonnés', value: activeRole.followers || 142, icon: '👥' },
              { id: 'publications', label: 'Publications', value: activeRolePosts.length, icon: '📢' },
              { id: 'reviews', label: 'Avis Reçus', value: activeRole.reviewCount || 28, icon: '⭐' },
              ...(activeRole.roleCode === 'DEUTSCH_INSTITUT'
                ? [{ id: 'courses', label: 'Cours Actuels', value: activeRole.courses?.length || 3, icon: '🎓' }]
                : []),
            ].map((item) => {
              const isSelected = activeDashboardSection === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveDashboardSection(item.id as any)}
                  style={{
                    backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px',
                    border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                    boxShadow: isSelected ? '0 6px 18px rgba(91, 33, 182, 0.15)' : '0 2px 6px rgba(15, 23, 42, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: isSelected ? 800 : 700, color: isSelected ? '#5B21B6' : '#64748B' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: isSelected ? '#5B21B6' : '#0F172A' }}>
                      {item.value}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#5B21B6' : '#94A3B8' }}>
                      {isSelected ? 'Actif ▼' : 'Détails →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECTION DETAIL SELECTOR BAR */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', overflowX: 'auto' }}>
            {[
              { id: 'publications', label: `📢 Publications (${activeRolePosts.length})` },
              { id: 'followers', label: `👥 Abonnés (${activeRole.followers || 142})` },
              { id: 'reviews', label: `⭐ Avis Reçus (${activeRole.reviewCount || 28})` },
              ...(activeRole.roleCode === 'DEUTSCH_INSTITUT'
                ? [{ id: 'courses', label: `🎓 Cours Actuels (${activeRole.courses?.length || 3})` }]
                : []),
            ].map((tab) => {
              const isCurrent = activeDashboardSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDashboardSection(tab.id as any)}
                  style={{
                    minHeight: '38px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isCurrent ? '#5B21B6' : 'transparent',
                    color: isCurrent ? '#FFFFFF' : '#64748B',
                    fontWeight: isCurrent ? 800 : 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

      {/* VIEW 1: 📢 PUBLICATIONS (EXISTING RICH PUBLICATION MANAGEMENT SYSTEM) */}
      {activeDashboardSection === 'publications' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                📢 Publications & Announcements
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Annonces et informations officielles publiées par votre profil ({activeRole.roleName}), visibles publiquement dans l&apos;onglet Découverte / Infos.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddPublicationModalOpen(true)}
              style={{
                minHeight: '38px',
                padding: '0 14px',
                backgroundColor: '#5B21B6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>+</span>
              <span>Ajouter une publication</span>
            </button>
          </div>

          {activeRolePosts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', fontSize: '13px', color: '#64748B' }}>
              <div>Aucune publication active. Cliquez ci-dessous pour publier une annonce.</div>
              <button
                type="button"
                onClick={() => setIsAddPublicationModalOpen(true)}
                style={{
                  marginTop: '10px',
                  minHeight: '36px',
                  padding: '0 16px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + Ajouter une publication
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeRolePosts.map((post) => {
                const isExpired = post.status === 'EXPIRED' || (post.daysLeft !== undefined && post.daysLeft <= 0);

                return (
                  <div key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* EXPIRATION STATUS BANNER / PILL */}
                    {isExpired ? (
                      <div
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '10px',
                          color: '#DC2626',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>🔴 Publication expirée (durée de 5 jours écoulée)</span>
                        <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: 600 }}>Masquée du fil public</span>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#047857',
                          backgroundColor: '#ECFDF5',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <span>⏳ Expire dans {post.daysLeft ?? 5} jours</span>
                      </div>
                    )}

                    <PublicationCard
                      publication={{
                        id: post.id,
                        roleId: activeRole.userRoleId,
                        title: post.title,
                        body: post.body,
                        createdAt: post.createdAt,
                        status: post.status,
                        mediaType: post.mediaType,
                        mediaUrls: post.mediaUrls,
                        providerName: post.providerName || activeRole.displayName,
                        providerRole: post.providerRole || activeRole.roleCode,
                        providerCity: post.providerCity || activeRole.city,
                        providerVerified: true,
                        viewCount: post.viewCount ?? 24,
                      }}
                      showViewCountInDashboard={true}
                    />

                    {/* Dashboard Action Controls for Provider */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', padding: '4px 8px', fontSize: '12px' }}>
                      {isExpired ? (
                        <button
                          type="button"
                          onClick={() => onRepublishPublication?.(post.id)}
                          style={{
                            minHeight: '36px',
                            padding: '0 16px',
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
                          <span>🔄 Republier</span>
                          <span style={{ fontSize: '11px', opacity: 0.9 }}>(+5 jours)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onTogglePublicationStatus?.(post.id)}
                          style={{ background: 'none', border: 'none', color: '#5B21B6', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          {post.status === 'PUBLISHED' ? '👁️ Masquer l\'annonce' : '🟢 Publier l\'annonce'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeletePublication?.(post.id)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: 👥 ABONNÉS (DETAILED SUBSCRIBERS / FOLLOWERS LIST) */}
      {activeDashboardSection === 'followers' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              👥 Abonnés & Suiveurs du rôle ({activeRole.roleName})
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Liste des étudiants et candidats abonnés à votre profil {activeRole.roleName} pour recevoir vos mises à jour.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sampleFollowers.map((fol) => (
              <div
                key={fol.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#F5F3FF',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #DDD6FE',
                    }}
                  >
                    {fol.avatar}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{fol.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>
                        {fol.roleTag}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      📍 {fol.city} • Abonné le {fol.dateSubscribed}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenRoleMessages?.(activeRole.roleCode)}
                  style={{
                    minHeight: '36px',
                    padding: '0 14px',
                    backgroundColor: '#FFFFFF',
                    color: '#5B21B6',
                    border: '1px solid #DDD6FE',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>💬 Contacter</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: ⭐ AVIS REÇUS (DETAILED REVIEWS & RATINGS LIST) */}
      {activeDashboardSection === 'reviews' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              ⭐ Avis Reçus & Évaluations Candidats
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Commentaires et notes attribués par les étudiants ayant bénéficié de vos services.
            </p>
          </div>

          {/* SUMMARY SCORE HEADER */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F5F3FF',
              borderRadius: '14px',
              border: '1px solid #DDD6FE',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#5B21B6', lineHeight: 1 }}>
              {activeRole.rating || 4.9}
            </div>
            <div>
              <div style={{ color: '#FBBF24', fontSize: '18px', fontWeight: 800 }}>★★★★★</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                Basé sur {activeRole.reviewCount || 28} avis certifiés pour le rôle {activeRole.roleName}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sampleReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{rev.authorName}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{rev.date}</span>
                </div>
                <div style={{ color: '#FBBF24', fontSize: '13px', margin: '2px 0' }}>
                  {'★'.repeat(rev.rating)}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4 (INSTITUT DASHBOARD ONLY): 🎓 COURS ACTUELS (MANAGED INDEPENDENTLY FROM PROFILE) */}
      {activeRole.roleCode === 'DEUTSCH_INSTITUT' && activeDashboardSection === 'courses' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                🎓 Gestion des Cours Actuels de l&apos;Institut
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Offres de cours actives gérées indépendamment du profil, affichées publiquement dans la section Cours.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCourseId(null);
                setCourseName('');
                setCoursePriceXAF(120000);
                setCourseLevelCode('B2');
                setIsAddCourseModalOpen(true);
              }}
              style={{
                minHeight: '38px',
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
              <span>+</span>
              <span>Ajouter un cours actuel</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(activeRole.courses && activeRole.courses.length > 0 ? activeRole.courses : [
              { id: 'c-1', levelCode: 'B2', name: 'Préparation Prépa-TestDaF Intensive B2', format: 'Présentiel + Laboratoire de langue', schedule: 'Lun – Ven (08h00 – 12h30)', priceXAF: 120000, seatsLeft: 4, startDate: '01 Sept. 2026' },
              { id: 'c-2', levelCode: 'B1', name: 'Allemand Intermédiaire Goethe-Zertifikat B1', format: 'Présentiel', schedule: 'Lun – Jeu (13h30 – 17h00)', priceXAF: 95000, seatsLeft: 8, startDate: '15 Sept. 2026' },
              { id: 'c-3', levelCode: 'A2', name: 'Allemand Élémentaire A2', format: 'Présentiel', schedule: 'Samedi (08h00 – 15h00)', priceXAF: 75000, seatsLeft: 12, startDate: '20 Sept. 2026' },
            ]).map((crs) => (
              <div
                key={crs.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#ECFDF5', color: '#047857', padding: '2px 8px', borderRadius: '4px' }}>
                      NIVEAU {crs.levelCode}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {crs.name}
                    </h4>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>📅 Début: {crs.startDate}</span>
                    <span>🕒 {crs.schedule}</span>
                    <span>🪑 {crs.seatsLeft} places restantes</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#047857' }}>
                    {crs.priceXAF.toLocaleString()} FCFA
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourseId(crs.id || null);
                      setCourseLevelCode(crs.levelCode);
                      setCourseName(crs.name);
                      setCoursePriceXAF(crs.priceXAF);
                      setCourseFormat(crs.format);
                      setCourseSchedule(crs.schedule);
                      setCourseStartDate(crs.startDate);
                      setCourseSeatsLeft(crs.seatsLeft);
                      setIsAddCourseModalOpen(true);
                    }}
                    style={{ background: 'none', border: 'none', color: '#5B21B6', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentCourses = activeRole.courses && activeRole.courses.length > 0 ? activeRole.courses : [
                        { id: 'c-1', levelCode: 'B2', name: 'Préparation Prépa-TestDaF Intensive B2', format: 'Présentiel + Laboratoire de langue', schedule: 'Lun – Ven (08h00 – 12h30)', priceXAF: 120000, seatsLeft: 4, startDate: '01 Sept. 2026' },
                        { id: 'c-2', levelCode: 'B1', name: 'Allemand Intermédiaire Goethe-Zertifikat B1', format: 'Présentiel', schedule: 'Lun – Jeu (13h30 – 17h00)', priceXAF: 95000, seatsLeft: 8, startDate: '15 Sept. 2026' },
                        { id: 'c-3', levelCode: 'A2', name: 'Allemand Élémentaire A2', format: 'Présentiel', schedule: 'Samedi (08h00 – 15h00)', priceXAF: 75000, seatsLeft: 12, startDate: '20 Sept. 2026' },
                      ];
                      const updated = currentCourses.filter((c) => c.id !== crs.id);
                      onUpdateRoleProfile?.(activeRole.userRoleId, { courses: updated });
                    }}
                    style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </>
      )}

      {/* MODALS */}
      {isAddRoleWizardOpen && renderWizard()}

      {/* INSTITUT COURSE CREATION / EDIT MODAL */}
      {isAddCourseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2200,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!courseName.trim()) return;
              const currentCourses = activeRole.courses && activeRole.courses.length > 0 ? [...activeRole.courses] : [
                { id: 'c-1', levelCode: 'B2', name: 'Préparation Prépa-TestDaF Intensive B2', format: 'Présentiel + Laboratoire de langue', schedule: 'Lun – Ven (08h00 – 12h30)', priceXAF: 120000, seatsLeft: 4, startDate: '01 Sept. 2026' },
                { id: 'c-2', levelCode: 'B1', name: 'Allemand Intermédiaire Goethe-Zertifikat B1', format: 'Présentiel', schedule: 'Lun – Jeu (13h30 – 17h00)', priceXAF: 95000, seatsLeft: 8, startDate: '15 Sept. 2026' },
                { id: 'c-3', levelCode: 'A2', name: 'Allemand Élémentaire A2', format: 'Présentiel', schedule: 'Samedi (08h00 – 15h00)', priceXAF: 75000, seatsLeft: 12, startDate: '20 Sept. 2026' },
              ];

              let updatedCourses;
              if (editingCourseId) {
                updatedCourses = currentCourses.map((c) =>
                  c.id === editingCourseId
                    ? {
                        ...c,
                        levelCode: courseLevelCode,
                        name: courseName.trim(),
                        priceXAF: Number(coursePriceXAF),
                        format: courseFormat,
                        schedule: courseSchedule,
                        startDate: courseStartDate,
                        seatsLeft: Number(courseSeatsLeft),
                      }
                    : c
                );
              } else {
                const newCrs = {
                  id: `crs-${Date.now()}`,
                  levelCode: courseLevelCode,
                  name: courseName.trim(),
                  priceXAF: Number(coursePriceXAF),
                  format: courseFormat,
                  schedule: courseSchedule,
                  startDate: courseStartDate,
                  seatsLeft: Number(courseSeatsLeft),
                };
                updatedCourses = [...currentCourses, newCrs];
              }

              onUpdateRoleProfile?.(activeRole.userRoleId, { courses: updatedCourses });
              setIsAddCourseModalOpen(false);
              setEditingCourseId(null);
              setCourseName('');
            }}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingCourseId ? '✏️ Modifier le cours actuel' : '🎓 Ajouter un nouveau cours actuel'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '130px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Niveau
                  </label>
                  <select
                    value={courseLevelCode}
                    onChange={(e) => setCourseLevelCode(e.target.value)}
                    style={{ width: '100%', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800 }}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Prix de la formation (FCFA)
                  </label>
                  <input
                    type="number"
                    value={coursePriceXAF}
                    onChange={(e) => setCoursePriceXAF(Number(e.target.value))}
                    required
                    style={{ width: '100%', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Intitulé complet du cours / de la formation
                </label>
                <input
                  type="text"
                  placeholder="Ex: Préparation Prépa-TestDaF Intensive B2"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  style={{ width: '100%', minHeight: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Horaires des cours
                  </label>
                  <input
                    type="text"
                    placeholder="Lun – Ven (08h00 – 12h30)"
                    value={courseSchedule}
                    onChange={(e) => setCourseSchedule(e.target.value)}
                    style={{ width: '100%', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                </div>
                <div style={{ width: '140px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Places restantes
                  </label>
                  <input
                    type="number"
                    value={courseSeatsLeft}
                    onChange={(e) => setCourseSeatsLeft(Number(e.target.value))}
                    style={{ width: '100%', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Date de début des cours
                </label>
                <input
                  type="text"
                  placeholder="01 Sept. 2026"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  style={{ width: '100%', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                style={{ minHeight: '40px', padding: '0 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{ minHeight: '40px', padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#047857', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Enregistrer le cours →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PUBLICATION CREATION MODAL WITH DEVICE FILE SELECTION FOR MIXED MEDIA (IMAGES + VIDEO) */}
      {isAddPublicationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Hidden File Inputs */}
          <input
            ref={photoFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoFilesSelect}
            style={{ display: 'none' }}
          />
          <input
            ref={videoFileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoFileSelect}
            style={{ display: 'none' }}
          />

          <form
            onSubmit={handleCreatePublicationSubmit}
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                📢 Publier une annonce d&apos;information
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPublicationModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Titre de l&apos;annonce / publication <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Ouverture des inscriptions session TestDaF..."
                value={newPubTitle}
                onChange={(e) => setNewPubTitle(e.target.value)}
                required
                style={{ width: '100%', minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Contenu textuel détaillé <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                placeholder="Précisez les modalités, dates ou consignes pour les candidats..."
                value={newPubBody}
                onChange={(e) => setNewPubBody(e.target.value)}
                rows={4}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            {/* OPTIONAL DEVICE MEDIA FILE SELECTOR (MIXED MEDIA: UP TO 3 IMAGES + 1 VIDEO) */}
            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                📎 Médias attachés <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>(Optionnel: Photos et/ou Vidéo)</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                Vous pouvez ajouter jusqu&apos;à 3 images et 1 vidéo dans le même carrousel.
              </p>

              {/* PHOTO DEVICE SELECTION & PREVIEWS */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  📷 Photos (max 3)
                </label>
                {pubPhotos.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {pubPhotos.map((photoSrc, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '76px', height: '76px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                        <img src={photoSrc} alt={`Média ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setPubPhotos(pubPhotos.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(220, 38, 38, 0.9)',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '10px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pubPhotos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      backgroundColor: '#FFFFFF',
                      border: '1px dashed #5B21B6',
                      color: '#5B21B6',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>📷</span>
                    <span>+ Ajouter une photo depuis votre appareil ({pubPhotos.length}/3)</span>
                  </button>
                )}
              </div>

              {/* VIDEO DEVICE SELECTION & PREVIEW */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  🎥 Vidéo (max 1)
                </label>
                {pubVideoUrl ? (
                  <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🎥</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {pubVideoFileName || 'Vidéo attachée'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPubVideoUrl('');
                        setPubVideoFileName('');
                      }}
                      style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      backgroundColor: '#FFFFFF',
                      border: '1px dashed #5B21B6',
                      color: '#5B21B6',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🎥</span>
                    <span>+ Choisir une vidéo depuis votre appareil</span>
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsAddPublicationModalOpen(false)}
                style={{ minHeight: '42px', padding: '0 16px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{ minHeight: '42px', padding: '0 20px', borderRadius: '10px', border: 'none', backgroundColor: '#5B21B6', color: '#FFFFFF', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Publier l&apos;annonce →
              </button>
            </div>
          </form>
        </div>
      )}
      </div>

      {/* FULL ROLE-BASED PROFILE EDITOR & CREATION MODAL */}
      {activeRole && (
        <ProviderProfileEditorModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          role={activeRole}
          onSave={(updatedData) => {
            if (onUpdateRoleProfile) {
              onUpdateRoleProfile(activeRole.userRoleId, updatedData);
            }
            setIsEditProfileModalOpen(false);
          }}
        />
      )}

      {/* ROLE SUBSCRIPTION RENEWAL PAYMENT MODAL */}
      <PassProPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        roleCode={paymentTargetRole.code}
        roleName={paymentTargetRole.name}
        customPriceXAF={paymentTargetRole.priceXAF}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
