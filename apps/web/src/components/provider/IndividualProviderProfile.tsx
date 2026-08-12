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
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px -2px rgba(91, 33, 182, 0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 1. VISUAL HERO PHOTOGRAPHY / PORTRAIT COVER (INSPIRED BY REFERENCE) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '240px',
          backgroundColor: '#5B21B6',
          backgroundImage: coverPicUrl || profilePicUrl
            ? `url(${coverPicUrl || profilePicUrl})`
            : 'linear-gradient(135deg, #5B21B6 0%, #3B0764 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%)',
          }}
        />

        {/* Top Floating Badge Bar */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#5B21B6',
              padding: '4px 10px',
              borderRadius: '9999px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {roleName}
          </span>
          {verified && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#059669',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <span>✓</span>
              <span>VERIFIED PRO</span>
            </span>
          )}
        </div>

        {/* Overlay Identity Details (Name, Role, Location, Rating) */}
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
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              margin: 0,
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {displayName}
          </h1>
          <div style={{ fontSize: '13px', color: '#DDD6FE', fontWeight: 600, marginTop: '2px' }}>
            {shortBio}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '6px',
              fontSize: '12px',
              color: '#F1F5F9',
              flexWrap: 'wrap',
            }}
          >
            <span>📍 {city} ({distanceKm} km)</span>
            <span style={{ color: '#FBBF24', fontWeight: 700 }}>★ {rating} ({reviewCount} avis)</span>
          </div>
        </div>
      </div>

      {/* 2. FLOATING AFFILIATION / VERIFICATION BADGE (BRIDGING HERO & BODY) */}
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
                backgroundColor: '#F5F3FF',
                color: '#5B21B6',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #DDD6FE',
              }}
            >
              {displayName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                Écosystème Germano-Africain
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Statut: Prestataire Certifié Recherche V1
              </div>
            </div>
          </div>

          <button
            onClick={handleFollow}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              border: following ? '1px solid #E2E8F0' : '1px solid #5B21B6',
              backgroundColor: following ? '#F8FAFC' : '#5B21B6',
              color: following ? '#475569' : '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {following ? 'Abonné' : "S'abonner"} ({count})
          </button>
        </div>
      </div>

      {/* 3. TABBED PROGRESSIVE DISCLOSURE */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '16px', marginBottom: '16px' }}>
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

        {/* Tab Panels */}
        {activeTab === 'about' && (
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, whitespace: 'pre-line' }}>
            {fullDescription}

            {phoneNumbers.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Contacts Directs:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Cours Préparation DSH / TestDaF
                </h4>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B21B6' }}>45.000 XAF</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Entraînement individuel aux épreuves écrites, compréhensions orales et simulations d&apos;examen.
              </p>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Accompagnement Betreuer & Logement
                </h4>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#5B21B6' }}>60.000 XAF</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Assistance pour recherche de logement étudiant, enregistrement ville (Bürgeramt) et compte bloqué.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Marc A.</span>
                <span style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>★ 5.0</span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                Accompagnement exceptionnel pour mon dossier visa et ma recherche de chambre d&apos;étudiant.
              </p>
            </div>
          </div>
        )}

        {/* 4. PRIMARY ACTION BUTTON */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onContactClick}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(91, 33, 182, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>Envoyer un message à {displayName}</span>
            <span>💬</span>
          </button>
        </div>
      </div>
    </article>
  );
};
