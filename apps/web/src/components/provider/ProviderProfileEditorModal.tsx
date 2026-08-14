'use client';

import React, { useState, useRef } from 'react';
import { RoleDashboardItem } from './ProviderDashboard';

export interface ProviderProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDashboardItem;
  onSave: (updatedData: Partial<RoleDashboardItem>) => void;
}

export const ProviderProfileEditorModal: React.FC<ProviderProfileEditorModalProps> = ({
  isOpen,
  onClose,
  role,
  onSave,
}) => {
  const isInstitut = role.roleCode === 'DEUTSCH_INSTITUT';

  // Dynamic Tabs based on Role (Current Courses REMOVED from profile editor)
  type TabType = 'basic' | 'contact' | 'services' | 'hours' | 'location' | 'campuses';

  const [activeTab, setActiveTab] = useState<TabType>('basic');

  // Form State
  const [displayName, setDisplayName] = useState(role.displayName || '');
  const [bio, setBio] = useState(role.bio || '');
  const [fullDescription, setFullDescription] = useState(role.fullDescription || role.bio || '');
  
  // Real File Upload Data Base64/Blob State (NO URL TEXT INPUTS)
  const [profilePicUrl, setProfilePicUrl] = useState(
    role.profilePicUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  );
  const [coverPicUrl, setCoverPicUrl] = useState(
    role.coverPicUrl ||
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  );

  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);

  // Contact & Location State (Coherent City/Quarter Format)
  const [city, setCity] = useState(role.city || 'Douala');
  const [isCustomCityActive, setIsCustomCityActive] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');

  const [quarter, setQuarter] = useState(role.quarter || (role.city === 'Yaoundé' ? 'Bastos' : 'Akwa'));
  const [isCustomQuarterActive, setIsCustomQuarterActive] = useState(false);
  const [customQuarterInput, setCustomQuarterInput] = useState('');

  const [contactEmail, setContactEmail] = useState(role.contactEmail || 'contact@provider.cm');
  const [phoneNumbers, setPhoneNumbers] = useState<{ label: string; number: string }[]>(
    role.phoneNumbers && role.phoneNumbers.length > 0
      ? role.phoneNumbers
      : [{ label: 'Accueil / WhatsApp', number: '+237 699 11 22 33' }]
  );

  // Campus Form Location State (For Institut de langue)
  const [newCampCity, setNewCampCity] = useState('Douala');
  const [newCampIsCustomCityActive, setNewCampIsCustomCityActive] = useState(false);
  const [newCampCustomCityInput, setNewCampCustomCityInput] = useState('');

  const [newCampQuarter, setNewCampQuarter] = useState('Akwa');
  const [newCampIsCustomQuarterActive, setNewCampIsCustomQuarterActive] = useState(false);
  const [newCampCustomQuarterInput, setNewCampCustomQuarterInput] = useState('');

  // Location Map State (for individual roles)
  const [latitude, setLatitude] = useState(role.latitude || 4.0511);
  const [longitude, setLongitude] = useState(role.longitude || 9.7679);

  // Effective location resolution
  const effectiveCity = isCustomCityActive ? customCityInput.trim() || city : city;
  const effectiveQuarter = isCustomQuarterActive ? customQuarterInput.trim() || quarter : quarter;

  // Validation Check: "Enregistrer le profil" disabled until required info is filled out
  const isFormValid = Boolean(
    displayName.trim().length >= 2 &&
    bio.trim().length >= 5 &&
    phoneNumbers.some((p) => p.number.trim().length >= 6)
  );

  // Services State (Image 2 format)
  const [services, setServices] = useState<
    { id: string; title: string; priceXAF: number; priceText: string; description: string }[]
  >(
    role.services && role.services.length > 0
      ? (role.services.map((s, idx) => ({
          id: s.id || `serv-${idx}`,
          title: s.title,
          priceXAF: s.priceXAF || 25000,
          priceText: s.priceText || `${(s.priceXAF || 25000).toLocaleString()} FCFA`,
          description: s.description,
        })) as any)
      : [
          {
            id: 'serv-1',
            title: 'Recherche & Réservation Logement Étudiant (WG / Studio)',
            priceXAF: 25000,
            priceText: '25.000 FCFA',
            description:
              'Accompagnement complet pour trouver une chambre meublée à proximité de votre campus en Allemagne avec attestation d\'hébergement.',
          },
          {
            id: 'serv-2',
            title: 'Accompagnement Démarches Visa & Compte Bloqué (Sperrkonto)',
            priceXAF: 35000,
            priceText: '35.000 FCFA',
            description:
              'Vérification du dossier administratif, conseils pour la prise de rendez-vous ambassade et ouverture du compte bloqué.',
          },
        ]
  );

  // Horaires State
  const [openingHours, setOpeningHours] = useState<{ day: string; hours: string; isToday?: boolean }[]>(
    role.openingHours && role.openingHours.length > 0
      ? role.openingHours
      : [
          { day: 'Lundi', hours: '08:00 – 18:00', isToday: true },
          { day: 'Mardi', hours: '08:00 – 18:00' },
          { day: 'Mercredi', hours: '08:00 – 18:00' },
          { day: 'Jeudi', hours: '08:00 – 18:00' },
          { day: 'Vendredi', hours: '08:00 – 18:00' },
          { day: 'Samedi', hours: '09:00 – 14:00' },
          { day: 'Dimanche', hours: 'Fermé' },
        ]
  );

  // Campus State (For Institut de langue ONLY — Image 3 format)
  const [campuses, setCampuses] = useState<
    { id: string; name: string; address: string; phone: string; description: string }[]
  >(
    role.campuses && role.campuses.length > 0
      ? (role.campuses.map((c, idx) => ({
          id: c.id || `camp-${idx}`,
          name: c.name,
          address: c.address,
          phone: c.phone || (c.contactPhones?.[0]?.number ? `${c.contactPhones[0].label}: ${c.contactPhones[0].number}` : '+237 699 00 11 22'),
          description: c.description || 'Campus moderne équipé de salles multimédias et laboratoire de langue.',
        })) as any)
      : [
          {
            id: 'camp-1',
            name: 'Campus Douala — Akwa',
            address: 'Boulevard de la Liberté, face Direction Orange, Douala',
            phone: 'Accueil Douala: +237 699 00 11 22',
            description: 'Campus principal avec secrétariat et salles d\'examen agréées.',
          },
          {
            id: 'camp-2',
            name: 'Campus Yaoundé — Bastos',
            address: 'Avenue Rosa Parks, à 200m Ambassade d\'Allemagne, Yaoundé',
            phone: 'Accueil Yaoundé: +237 677 33 44 55',
            description: 'Centre de formation accélérée et cours du soir.',
          },
        ]
  );

  // Temp form field states for adding items
  const [newServTitle, setNewServTitle] = useState('');
  const [newServPrice, setNewServPrice] = useState(25000);
  const [newServDesc, setNewServDesc] = useState('');

  const [newCampName, setNewCampName] = useState('');
  const [newCampAddress, setNewCampAddress] = useState('');
  const [newCampPhone, setNewCampPhone] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');

  if (!isOpen) return null;

  // Native Device Image Upload Handlers (PC File Picker & Mobile Gallery/Photos)
  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePicUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleCoverPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverPicUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAddPhone = () => {
    setPhoneNumbers((prev) => [...prev, { label: 'Bureau', number: '+237 699 00 00 00' }]);
  };

  const handleRemovePhone = (index: number) => {
    setPhoneNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServTitle.trim() || !newServDesc.trim()) return;
    const newServ = {
      id: `serv-${Date.now()}`,
      title: newServTitle.trim(),
      priceXAF: Number(newServPrice),
      priceText: `${Number(newServPrice).toLocaleString()} FCFA`,
      description: newServDesc.trim(),
    };
    setServices((prev) => [...prev, newServ]);
    setNewServTitle('');
    setNewServPrice(25000);
    setNewServDesc('');
  };

  const handleRemoveService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim() || !newCampAddress.trim()) return;
    const newCamp = {
      id: `camp-${Date.now()}`,
      name: newCampName.trim(),
      address: newCampAddress.trim(),
      phone: newCampPhone.trim() || 'Accueil: +237 699 00 11 22',
      description: newCampDesc.trim() || 'Campus secondaire.',
    };
    setCampuses((prev) => [...prev, newCamp]);
    setNewCampName('');
    setNewCampAddress('');
    setNewCampPhone('');
    setNewCampDesc('');
  };

  const handleRemoveCampus = (id: string) => {
    setCampuses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedRoleData: Partial<RoleDashboardItem> = {
      displayName: displayName.trim() || role.roleName,
      bio: bio.trim() || role.bio,
      fullDescription: fullDescription.trim() || bio.trim(),
      profilePicUrl,
      coverPicUrl,
      city: effectiveCity,
      quarter: effectiveQuarter,
      contactEmail,
      phoneNumbers,
      latitude,
      longitude,
      services: services.map((s) => ({
        title: s.title,
        priceXAF: s.priceXAF,
        priceText: s.priceText,
        description: s.description,
      })),
      openingHours,
      campuses: isInstitut
        ? campuses.map((c) => ({
            name: c.name,
            address: c.address,
            phone: c.phone,
            contactPhones: [{ label: 'Accueil', number: c.phone }],
            description: c.description,
          }))
        : undefined,
      isConfigured: true,
    };

    onSave(updatedRoleData);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Hidden Native File Inputs for Photos */}
      <input
        ref={profilePhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePhotoSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={coverPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverPhotoSelect}
        style={{ display: 'none' }}
      />

      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* HEADER BAR (Reference Image Header Style) */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
              CREATION DU PROFIL PRESTATAIRE — {role.roleName}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', color: '#FFFFFF' }}>
              Créer / Éditer mon profil {role.roleName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '9999px',
              width: '34px',
              height: '34px',
              color: '#FFFFFF',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>

        {/* STEP / TAB BAR (100% VISIBLE ON PC & MOBILE) */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderBottom: '1px solid #E2E8F0',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            padding: '6px 12px',
            gap: '6px',
          }}
        >
          {[
            { id: 'basic', label: '1. Infos de base' },
            { id: 'contact', label: '2. Contact & Photos' },
            { id: 'services', label: '3. Services & Tarifs' },
            { id: 'hours', label: '4. Horaires' },
            ...(isInstitut
              ? [{ id: 'campuses', label: '5. Campus' }]
              : [{ id: 'location', label: '5. Localisation Pro' }]),
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  minHeight: '38px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: isActive ? '2px solid #5B21B6' : '1px solid #CBD5E1',
                  backgroundColor: isActive ? '#FFFFFF' : '#F8FAFC',
                  color: isActive ? '#5B21B6' : '#334155',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 8px rgba(91, 33, 182, 0.12)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* BODY FORM CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Nom d&apos;affichage public <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Prof. Karl SCHMIDT ou Institut Goethe Partner"
                  style={{ width: '100%', minHeight: '46px', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Accroche courte (Bio)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Spécialiste de l'accompagnement étudiant pour l'Allemagne"
                  style={{ width: '100%', minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Description détaillée (Présentation publique)
                </label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={5}
                  placeholder="Présentez votre parcours, vos compétences et vos garanties pour les candidats..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', lineHeight: 1.6 }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  S&apos;affiche dans la section Présentation de votre profil public.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT & DEVICE PHOTO UPLOADS (NO URL TEXT FIELDS) */}
          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* REAL DEVICE FILE UPLOAD: PROFILE PHOTO */}
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  📷 Photo de Profil
                </label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                  Sélectionnez une photo depuis votre appareil (Galerie mobile ou fichier PC).
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {profilePicUrl && (
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #5B21B6', flexShrink: 0 }}>
                      <img src={profilePicUrl} alt="Aperçu Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    style={{
                      minHeight: '44px',
                      padding: '0 18px',
                      backgroundColor: '#FFFFFF',
                      border: '1px dashed #5B21B6',
                      color: '#5B21B6',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>📁</span>
                    <span>{profilePicUrl ? "Changer la photo de profil" : "Importer une photo de profil"}</span>
                  </button>
                </div>
              </div>

              {/* REAL DEVICE FILE UPLOAD: COVER BANNER PHOTO */}
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  🖼️ Photo de Couverture (Bannière)
                </label>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px 0' }}>
                  Sélectionnez une bannière d&apos;en-tête depuis votre appareil.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {coverPicUrl && (
                    <div style={{ width: '100%', height: '110px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                      <img src={coverPicUrl} alt="Aperçu Couverture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => coverPhotoInputRef.current?.click()}
                    style={{
                      minHeight: '44px',
                      padding: '0 18px',
                      backgroundColor: '#FFFFFF',
                      border: '1px dashed #5B21B6',
                      color: '#5B21B6',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>📁</span>
                    <span>{coverPicUrl ? "Changer la photo de couverture" : "Importer une photo de couverture"}</span>
                  </button>
                </div>
              </div>



              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email de contact professionnel
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{ width: '100%', minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', margin: 0 }}>
                    Numéros de contact (Affichés au bas de Présentation)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    style={{ fontSize: '12px', color: '#5B21B6', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    + Ajouter numéro
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {phoneNumbers.map((ph, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={ph.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneNumbers((prev) => prev.map((p, i) => (i === idx ? { ...p, label: val } : p)));
                        }}
                        placeholder="Label (ex: Accueil)"
                        style={{ width: '130px', minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                      />
                      <input
                        type="tel"
                        value={ph.number}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneNumbers((prev) => prev.map((p, i) => (i === idx ? { ...p, number: val } : p)));
                        }}
                        placeholder="+237 699 00 00 00"
                        style={{ flex: 1, minHeight: '40px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                      />
                      {phoneNumbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(idx)}
                          style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES & TARIFS (IMAGE 2 EXACT REFERENCE) */}
          {activeTab === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '14px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#5B21B6', margin: 0 }}>
                  💳 Services & Tarifs du Profil
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Ces prestations et tarifs apparaissent directement dans la section Services & Tarifs de votre profil public.
                </p>
              </div>

              {/* LIST OF EXISTING SERVICES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {services.map((serv) => (
                  <div
                    key={serv.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {serv.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#5B21B6' }}>
                          {serv.priceText}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(serv.id)}
                          style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                      {serv.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* FORM TO ADD NEW SERVICE */}
              <form onSubmit={handleAddService} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  + Ajouter un nouveau service
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Titre du service"
                    value={newServTitle}
                    onChange={(e) => setNewServTitle(e.target.value)}
                    style={{ flex: 2, minWidth: '220px', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <input
                    type="number"
                    placeholder="Prix FCFA"
                    value={newServPrice}
                    onChange={(e) => setNewServPrice(Number(e.target.value))}
                    style={{ flex: 1, minWidth: '120px', minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
                <textarea
                  placeholder="Description du service..."
                  value={newServDesc}
                  onChange={(e) => setNewServDesc(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', marginBottom: '8px' }}
                />
                <button
                  type="submit"
                  style={{ minHeight: '36px', padding: '0 16px', backgroundColor: '#5B21B6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Ajouter le service →
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: HORAIRES D'OUVERTURE */}
          {activeTab === 'hours' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px 0' }}>
                Configuration de vos horaires de disponibilité par jour:
              </p>
              {openingHours.map((h, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', width: '100px' }}>{h.day}:</span>
                  <input
                    type="text"
                    value={h.hours}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOpeningHours((prev) => prev.map((item, i) => (i === idx ? { ...item, hours: val } : item)));
                    }}
                    style={{ flex: 1, minHeight: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(h.isToday)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOpeningHours((prev) => prev.map((item, i) => ({ ...item, isToday: i === idx ? checked : false })));
                      }}
                    />
                    Aujourd&apos;hui
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5 (NON-INSTITUT): LOCALISATION PROFESSIONNELLE (COHERENT CITY/QUARTER SELECTOR) */}
          {!isInstitut && activeTab === 'location' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#5B21B6', margin: 0 }}>
                  📍 Sélection de la Localisation Professionnelle Cohérente
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
                  Sélectionnez la ville et le quartier de votre activité professionnelle pour correspondre parfaitement avec la recherche des candidats.
                </p>
              </div>

              {/* 1. VILLE SELECTION */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  🏙️ 1. Ville d&apos;exercice professionnel <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                  {['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Dschang'].map((cityName) => {
                    const isSelected = !isCustomCityActive && city === cityName;
                    return (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          setIsCustomCityActive(false);
                          setCity(cityName);
                          setQuarter(cityName === 'Yaoundé' ? 'Bastos' : 'Akwa');
                        }}
                        style={{
                          minHeight: '38px',
                          padding: '0 10px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                          color: isSelected ? '#5B21B6' : '#0F172A',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        📍 {cityName}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsCustomCityActive(!isCustomCityActive)}
                    style={{
                      minHeight: '38px',
                      padding: '0 10px',
                      borderRadius: '10px',
                      border: isCustomCityActive ? '2px solid #5B21B6' : '1px dashed #5B21B6',
                      backgroundColor: isCustomCityActive ? '#F5F3FF' : '#FFFFFF',
                      color: '#5B21B6',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    + Autres villes
                  </button>
                </div>

                {isCustomCityActive && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={customCityInput}
                      onChange={(e) => setCustomCityInput(e.target.value)}
                      placeholder="Saisissez le nom de votre ville..."
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '0 14px',
                        borderRadius: '10px',
                        border: '1px solid #5B21B6',
                        fontSize: '13px',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 2. QUARTIER SELECTION */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  🏡 2. Quartier / Secteur professionnel <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {(effectiveCity === 'Yaoundé'
                    ? ['Bastos', 'Centre-ville', 'Melen', 'Ngoa-Ekélé', 'Omnisports', 'Mvan', 'Emana', 'Odza']
                    : ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'Makepe', 'Logbessou', 'Beedi', 'Bonamoussadi', 'Kotto', 'Ndokoti']
                  ).map((qtr) => {
                    const isSelected = !isCustomQuarterActive && quarter === qtr;
                    return (
                      <button
                        key={qtr}
                        type="button"
                        onClick={() => {
                          setIsCustomQuarterActive(false);
                          setQuarter(qtr);
                        }}
                        style={{
                          minHeight: '36px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                          color: isSelected ? '#5B21B6' : '#0F172A',
                          fontWeight: isSelected ? 800 : 600,
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
                    + Autres quartiers
                  </button>
                </div>

                {isCustomQuarterActive && (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={customQuarterInput}
                      onChange={(e) => setCustomQuarterInput(e.target.value)}
                      placeholder={`Saisissez le nom de votre quartier à ${effectiveCity}...`}
                      style={{
                        width: '100%',
                        minHeight: '42px',
                        padding: '0 14px',
                        borderRadius: '10px',
                        border: '1px solid #5B21B6',
                        fontSize: '13px',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 3. MAP COORD PREVIEW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Latitude (Optionnel)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    style={{ width: '100%', minHeight: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Longitude (Optionnel)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    style={{ width: '100%', minHeight: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5 (INSTITUT ONLY): CAMPUS WITH COHERENT LOCATION */}
          {isInstitut && activeTab === 'campuses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '14px', backgroundColor: '#ECFDF5', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#047857', margin: 0 }}>
                  📍 Gestion des Campus de l&apos;Institut
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Chaque campus s&apos;affiche avec l&apos;icône 📍 pour son nom, sa ville/quartier et son adresse géographique complète.
                </p>
              </div>

              {/* LIST OF CAMPUSES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {campuses.map((camp) => (
                  <div
                    key={camp.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        📍 {camp.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveCampus(camp.id)}
                        style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 800 }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                      {camp.address}
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, marginTop: '6px' }}>
                      📞 {camp.phone}
                    </div>
                  </div>
                ))}
              </div>

              {/* FORM TO ADD NEW CAMPUS WITH COHERENT LOCATION */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCampName.trim()) return;
                  const effectiveCampCity = newCampIsCustomCityActive ? newCampCustomCityInput.trim() || newCampCity : newCampCity;
                  const effectiveCampQuarter = newCampIsCustomQuarterActive ? newCampCustomQuarterInput.trim() || newCampQuarter : newCampQuarter;
                  const newCamp = {
                    id: `camp-${Date.now()}`,
                    name: newCampName.trim(),
                    address: `${effectiveCampCity} (${effectiveCampQuarter}) — ${newCampAddress.trim() || 'Campus Principal'}`,
                    phone: newCampPhone.trim() || 'Accueil: +237 699 00 11 22',
                    description: newCampDesc.trim() || 'Campus de formation.',
                  };
                  setCampuses((prev) => [...prev, newCamp]);
                  setNewCampName('');
                  setNewCampAddress('');
                  setNewCampPhone('');
                  setNewCampDesc('');
                }}
                style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  + Ajouter un nouveau campus avec sa localisation
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Nom du campus (ex: Campus Douala — Akwa)"
                    value={newCampName}
                    onChange={(e) => setNewCampName(e.target.value)}
                    style={{ minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                  />

                  {/* CAMPUS CITY SELECTION */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      VILLE DU CAMPUS
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Dschang'].map((cityName) => (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => {
                            setNewCampIsCustomCityActive(false);
                            setNewCampCity(cityName);
                            setNewCampQuarter(cityName === 'Yaoundé' ? 'Bastos' : 'Akwa');
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: !newCampIsCustomCityActive && newCampCity === cityName ? '2px solid #047857' : '1px solid #CBD5E1',
                            backgroundColor: !newCampIsCustomCityActive && newCampCity === cityName ? '#ECFDF5' : '#FFFFFF',
                            color: !newCampIsCustomCityActive && newCampCity === cityName ? '#047857' : '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {cityName}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewCampIsCustomCityActive(!newCampIsCustomCityActive)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: newCampIsCustomCityActive ? '2px solid #047857' : '1px dashed #047857',
                          backgroundColor: newCampIsCustomCityActive ? '#ECFDF5' : '#FFFFFF',
                          color: '#047857',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Autres villes
                      </button>
                    </div>
                    {newCampIsCustomCityActive && (
                      <input
                        type="text"
                        value={newCampCustomCityInput}
                        onChange={(e) => setNewCampCustomCityInput(e.target.value)}
                        placeholder="Nom de la ville du campus..."
                        style={{ width: '100%', minHeight: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #047857', fontSize: '12px', marginTop: '6px' }}
                      />
                    )}
                  </div>

                  {/* CAMPUS QUARTER SELECTION */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      QUARTIER DU CAMPUS
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {( (newCampIsCustomCityActive ? newCampCustomCityInput : newCampCity) === 'Yaoundé'
                        ? ['Bastos', 'Centre-ville', 'Melen', 'Ngoa-Ekélé', 'Omnisports']
                        : ['Akwa', 'Bonanjo', 'Bonapriso', 'Deido', 'Makepe', 'Logbessou']
                      ).map((qtr) => (
                        <button
                          key={qtr}
                          type="button"
                          onClick={() => {
                            setNewCampIsCustomQuarterActive(false);
                            setNewCampQuarter(qtr);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: !newCampIsCustomQuarterActive && newCampQuarter === qtr ? '2px solid #047857' : '1px solid #CBD5E1',
                            backgroundColor: !newCampIsCustomQuarterActive && newCampQuarter === qtr ? '#ECFDF5' : '#FFFFFF',
                            color: !newCampIsCustomQuarterActive && newCampQuarter === qtr ? '#047857' : '#334155',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {qtr}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewCampIsCustomQuarterActive(!newCampIsCustomQuarterActive)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: newCampIsCustomQuarterActive ? '2px solid #047857' : '1px dashed #047857',
                          backgroundColor: newCampIsCustomQuarterActive ? '#ECFDF5' : '#FFFFFF',
                          color: '#047857',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Autres quartiers
                      </button>
                    </div>
                    {newCampIsCustomQuarterActive && (
                      <input
                        type="text"
                        value={newCampCustomQuarterInput}
                        onChange={(e) => setNewCampCustomQuarterInput(e.target.value)}
                        placeholder="Nom du quartier du campus..."
                        style={{ width: '100%', minHeight: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #047857', fontSize: '12px', marginTop: '6px' }}
                      />
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Adresse géographique complète (Rue, immeuble...)"
                    value={newCampAddress}
                    onChange={(e) => setNewCampAddress(e.target.value)}
                    style={{ minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <input
                    type="text"
                    placeholder="Téléphone de contact (ex: Accueil Douala: +237 699 00 11 22)"
                    value={newCampPhone}
                    onChange={(e) => setNewCampPhone(e.target.value)}
                    style={{ minHeight: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    style={{ minHeight: '38px', padding: '0 16px', backgroundColor: '#047857', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', marginTop: '4px' }}
                  >
                    Ajouter le campus →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS (WITH VALIDATION CHECK FOR SUBMIT BUTTON) */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ minHeight: '42px', padding: '0 18px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            Annuler
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isFormValid && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626' }}>
                ⚠️ Remplissez les champs obligatoires (*)
              </span>
            )}
            <button
              type="button"
              disabled={!isFormValid}
              onClick={handleSubmitAll}
              style={{
                minHeight: '44px',
                padding: '0 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isFormValid ? '#5B21B6' : '#94A3B8',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                opacity: isFormValid ? 1 : 0.6,
                boxShadow: isFormValid ? '0 4px 14px rgba(91, 33, 182, 0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
              title={!isFormValid ? 'Veuillez remplir les champs obligatoires: Nom public, Bio et Téléphone.' : ''}
            >
              Enregistrer le profil →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
