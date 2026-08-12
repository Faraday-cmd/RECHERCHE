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
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 12px -2px rgba(91, 33, 182, 0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Cover Banner */}
      <div
        style={{
          height: '140px',
          width: '100%',
          backgroundColor: '#5B21B6',
          backgroundImage: 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
          position: 'relative',
        }}
      >
        {coverPicUrl && (
          <img src={coverPicUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        )}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#047857',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
          }}
        >
          DEUTSCH INSTITUT
        </div>
      </div>

      {/* Header Profile Identity */}
      <div style={{ padding: '0 16px 20px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '12px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              border: '3px solid #FFFFFF',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              fontSize: '28px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(15, 23, 42, 0.1)',
              overflow: 'hidden',
            }}
          >
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              displayName.charAt(0)
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleFollow}
              style={{
                minHeight: '44px',
                padding: '0 14px',
                borderRadius: '10px',
                border: following ? '1px solid #E2E8F0' : '1px solid #5B21B6',
                backgroundColor: following ? '#F8FAFC' : '#5B21B6',
                color: following ? '#475569' : '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {following ? 'Abonné' : 'Suivre'} ({count})
            </button>
            <button
              onClick={onContactClick}
              style={{
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Contacter 💬
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          {displayName}
        </h1>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#047857', marginTop: '2px' }}>
          Centre Spécialisé d&apos;Allemand {yearFounded ? `• Fondé en ${yearFounded}` : ''}
        </p>
        <p style={{ fontSize: '14px', color: '#334155', marginTop: '8px', lineHeight: 1.5 }}>
          {shortBio}
        </p>

        {/* Tab Controls */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginTop: '20px', gap: '16px' }}>
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
                  borderBottom: isTabActive ? '3px solid #5B21B6' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: isTabActive ? '#5B21B6' : '#64748B',
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

        {/* Tab Panels */}
        <div style={{ paddingTop: '16px' }}>
          {activeTab === 'info' && (
            <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, whitespace: 'pre-line' }}>
              {fullDescription}
            </div>
          )}

          {activeTab === 'courses' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {coursesPrices.map((course, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '80px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#F5F3FF',
                        color: '#5B21B6',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '4px',
                      }}
                    >
                      {course.levelCode}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{course.name}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#5B21B6', marginTop: '8px' }}>
                    {course.priceXAF.toLocaleString()} XAF
                  </div>
                </div>
              ))}
            </div>
          )}

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
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                        color: isSelected ? '#5B21B6' : '#334155',
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
                    Contacts du Campus:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedCampus.contactPhones?.map((phone, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '12px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '4px 8px',
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
        </div>
      </div>
    </article>
  );
};
