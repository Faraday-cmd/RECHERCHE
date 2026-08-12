'use client';

import React, { useState } from 'react';

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
  followerCount?: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
}

export const IndividualProviderProfile: React.FC<IndividualProviderProfileProps> = ({
  roleName,
  displayName,
  shortBio,
  fullDescription,
  city = 'Douala',
  distanceKm = 2.4,
  rating = 4.9,
  reviewCount = 28,
  verified = true,
  profilePicUrl,
  coverPicUrl,
  phoneNumbers = [],
  followerCount = 142,
  isFollowing = false,
  onFollowToggle,
  onContactClick,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'reviews'>('about');

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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#5B21B6',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '9999px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {roleName}
        </div>
      </div>

      {/* Avatar & Header Section */}
      <div style={{ padding: '0 16px 20px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '12px' }}>
          {/* Avatar Thumbnail */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                border: '3px solid #FFFFFF',
                backgroundColor: '#EDE9FE',
                color: '#5B21B6',
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
            {verified && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                }}
                title="Vérifié"
              >
                ✓
              </span>
            )}
          </div>

          {/* Action Buttons */}
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
              {following ? 'Abonné' : "S'abonner"} ({count})
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
                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)',
              }}
            >
              Contacter 💬
            </button>
          </div>
        </div>

        {/* Name & Title */}
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          {displayName}
        </h1>

        {/* Metadata Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
          <span>📍 {city} ({distanceKm} km)</span>
          <span style={{ color: '#D97706', fontWeight: 600 }}>★ {rating} ({reviewCount} avis)</span>
        </div>

        <p style={{ fontSize: '14px', color: '#334155', marginTop: '10px', lineHeight: 1.5 }}>
          {shortBio}
        </p>

        {/* Contact Numbers */}
        {phoneNumbers.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {phoneNumbers.map((phone, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '12px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#5B21B6',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 500,
                }}
              >
                <strong>{phone.label}:</strong> {phone.number}
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation Controls (Progressive Disclosure) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginTop: '20px', gap: '16px' }}>
          {[
            { id: 'about', label: 'À propos' },
            { id: 'services', label: 'Services & Tarifs' },
            { id: 'reviews', label: `Avis (${reviewCount})` },
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

        {/* Tab Panel Content */}
        <div style={{ paddingTop: '16px' }}>
          {activeTab === 'about' && (
            <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, whitespace: 'pre-line' }}>
              {fullDescription}
            </div>
          )}

          {activeTab === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Cours Préparation DSH / TestDaF</h4>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Suivi individuel et entraînement aux épreuves écrites et orales.</p>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Accompagnement Betreuer & Logement</h4>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Assistance pour inscription universitaire et réservation chambre.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Marc A.</span>
                  <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>★ 5.0</span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Très bon accompagnement pour mon dossier de demande de visa. Je recommande !
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
