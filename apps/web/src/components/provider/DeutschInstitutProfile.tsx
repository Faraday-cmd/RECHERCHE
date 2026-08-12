'use client';

import React, { useState } from 'react';

export interface CampusItem {
  id: string;
  name: string;
  address: string;
  locationGeom?: string;
  contactPhones?: { label: string; number: string }[];
  openingHours?: Record<string, string>;
  coursesAvailable?: { levelCode: string; priceXAF?: number }[];
}

export interface CoursePriceItem {
  levelCode: string;
  name: string;
  priceXAF: number;
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
  coursesPrices?: CoursePriceItem[];
  followerCount?: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
}

export const DeutschInstitutProfile: React.FC<DeutschInstitutProfileProps> = ({
  displayName,
  shortBio,
  fullDescription,
  profilePicUrl,
  coverPicUrl,
  yearFounded = 2018,
  campuses = [
    {
      id: 'camp-1',
      name: 'Campus Akwa',
      address: 'Boulevard de la Liberté, Akwa, Douala',
      contactPhones: [
        { label: 'Accueil', number: '+237 699 00 11 22' },
        { label: 'Inscriptions', number: '+237 677 33 44 55' },
      ],
    },
    {
      id: 'camp-2',
      name: 'Campus Bonamoussadi',
      address: 'Face Carrefour Carrosserie, Douala',
      contactPhones: [{ label: 'Secrétariat', number: '+237 699 88 77 66' }],
    },
  ],
  coursesPrices = [
    { levelCode: 'A1', name: 'Allemand Éléments A1', priceXAF: 50000 },
    { levelCode: 'A2', name: 'Allemand Intermédiaire A2', priceXAF: 60000 },
    { levelCode: 'B1', name: 'Allemand Avancé B1', priceXAF: 75000 },
    { levelCode: 'B2', name: 'Allemand Autonome B2', priceXAF: 90000 },
  ],
  followerCount = 380,
  isFollowing = false,
  onFollowToggle,
  onContactClick,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'campuses'>('info');
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);
  const [selectedCampus, setSelectedCampus] = useState<CampusItem | null>(campuses[0] || null);

  const handleFollow = () => {
    setFollowing(!following);
    setCount(following ? count - 1 : count + 1);
    if (onFollowToggle) onFollowToggle();
  };

  return (
    <article
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px -2px rgba(91, 33, 182, 0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 1. INSTITUTIONAL VISUAL HERO */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          backgroundColor: '#047857',
          backgroundImage: coverPicUrl || profilePicUrl
            ? `url(${coverPicUrl || profilePicUrl})`
            : 'linear-gradient(135deg, #047857 0%, #064E3B 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%)',
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
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#047857',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '9999px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            INSTITUT D&apos;ALLEMAND
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#047857',
              padding: '4px 10px',
              borderRadius: '9999px',
            }}
          >
            Fondé en {yearFounded}
          </span>
        </div>

        {/* Overlay Identity */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            zIndex: 10,
            color: '#FFFFFF',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {displayName}
          </h1>
          <div style={{ fontSize: '13px', color: '#A7F3D0', fontWeight: 600, marginTop: '2px' }}>
            {shortBio}
          </div>
        </div>
      </div>

      {/* 2. FLOATING INSTITUTION CARD */}
      <div style={{ padding: '0 16px', marginTop: '-12px', position: 'relative', zIndex: 20 }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #A7F3D0',
              }}
            >
              {displayName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                Institut Agréé & Certifié
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {campuses.length} Campus Disponibles • Préparation Goethe / TestDaF
              </div>
            </div>
          </div>

          <button
            onClick={handleFollow}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: following ? '1px solid #E2E8F0' : '1px solid #047857',
              backgroundColor: following ? '#F8FAFC' : '#047857',
              color: following ? '#475569' : '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {following ? 'Abonné' : 'Suivre'} ({count})
          </button>
        </div>
      </div>

      {/* 3. TABBED PROGRESSIVE DISCLOSURE */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '16px', marginBottom: '16px' }}>
          {[
            { id: 'info', label: 'Présentation' },
            { id: 'courses', label: 'Cours & Tarifs' },
            { id: 'campuses', label: `Campus (${campuses.length})` },
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
                  fontWeight: isTabActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Presentation */}
        {activeTab === 'info' && (
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, whitespace: 'pre-line' }}>
            {fullDescription}
          </div>
        )}

        {/* Tab Content 2: Courses & Pricing Grid */}
        {activeTab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {coursesPrices.map((course, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '90px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#ECFDF5',
                      color: '#047857',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginBottom: '4px',
                    }}
                  >
                    NIVEAU {course.levelCode}
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{course.name}</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#047857', marginTop: '8px' }}>
                  {course.priceXAF.toLocaleString()} XAF
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Multi-Campus Selector */}
        {activeTab === 'campuses' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
              {campuses.map((campus) => {
                const isSelected = selectedCampus?.id === campus.id;
                return (
                  <button
                    key={campus.id}
                    onClick={() => setSelectedCampus(campus)}
                    style={{
                      minHeight: '40px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #047857' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      color: isSelected ? '#047857' : '#334155',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📍 {campus.name}
                  </button>
                );
              })}
            </div>

            {selectedCampus && (
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {selectedCampus.name}
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: '12px' }}>
                  {selectedCampus.address}
                </p>

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Contacts Téléphoniques Campus:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedCampus.contactPhones?.map((phone, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        color: '#0F172A',
                        fontWeight: 500,
                      }}
                    >
                      {phone.label}: {phone.number}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PRIMARY ACTION BUTTON */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onContactClick}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: '#047857',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>Contacter l&apos;Institut {displayName}</span>
            <span>💬</span>
          </button>
        </div>
      </div>
    </article>
  );
};
