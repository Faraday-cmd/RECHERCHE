'use client';

import React, { useState, useMemo } from 'react';
import { PublishedContentItem } from '../provider/ProviderDashboard';

export interface UnifiedMediaItem {
  type: 'photo' | 'video';
  url: string;
}

interface PublicationCardProps {
  publication: PublishedContentItem & {
    providerName?: string;
    providerRole?: string;
    providerCity?: string;
    providerVerified?: boolean;
    providerPicUrl?: string;
    viewCount?: number;
  };
  showViewCountInDashboard?: boolean;
  onContactClick?: () => void;
  onProviderNameClick?: () => void;
  onOpenFullscreenImage?: (imageUrl: string) => void;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  showViewCountInDashboard = false,
  onContactClick,
  onProviderNameClick,
  onOpenFullscreenImage,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // UNIFIED MIXED MEDIA ARRAY (COMBINES PHOTOS + VIDEOS INTO ONE CAROUSEL)
  const unifiedMedia = useMemo<UnifiedMediaItem[]>(() => {
    const rawUrls = publication.mediaUrls && publication.mediaUrls.length > 0
      ? publication.mediaUrls
      : [];

    if (rawUrls.length === 0) return [];

    const items: UnifiedMediaItem[] = [];

    rawUrls.forEach((url) => {
      const isVideoUrl =
        url.startsWith('data:video') ||
        url.includes('.mp4') ||
        url.includes('.webm') ||
        url.includes('.mov') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be');

      if (isVideoUrl) {
        items.push({ type: 'video', url });
      } else if (publication.mediaType === 'video' && items.length === 0) {
        items.push({ type: 'video', url });
      } else {
        items.push({ type: 'photo', url });
      }
    });

    return items;
  }, [publication]);

  const hasMedia = unifiedMedia.length > 0;
  const activeMedia = hasMedia ? unifiedMedia[currentMediaIndex] || unifiedMedia[0] : null;

  const isCurrentVideo = activeMedia?.type === 'video';
  const isCurrentPhoto = activeMedia?.type === 'photo';

  const videoSrc = isCurrentVideo ? activeMedia?.url || '' : '';
  const isYouTube = videoSrc.includes('youtube.com') || videoSrc.includes('youtu.be');

  const roleLabels: Record<string, string> = {
    LEHRER: 'Enseignant',
    BETREUER: 'Betreuer',
    VISA_COMPANION: 'Accompagnateur Visa',
    DEUTSCH_INSTITUT: 'Institut de langue',
  };

  const roleBadgeColors: Record<string, { bg: string; text: string }> = {
    LEHRER: { bg: '#F5F3FF', text: '#5B21B6' },
    BETREUER: { bg: '#ECFDF5', text: '#047857' },
    VISA_COMPANION: { bg: '#FFFBEB', text: '#B45309' },
    DEUTSCH_INSTITUT: { bg: '#EFF6FF', text: '#1D4ED8' },
  };

  const roleCode = publication.providerRole || 'BETREUER';
  const badgeStyle = roleBadgeColors[roleCode] || { bg: '#F5F3FF', text: '#5B21B6' };

  // UNIFIED CAROUSEL NAVIGATION (SLIDES SEAMLESSLY ACROSS PHOTOS AND VIDEOS)
  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlaying(false); // Reset video playback state on slide change
    if (currentMediaIndex < unifiedMedia.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    } else {
      setCurrentMediaIndex(0);
    }
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlaying(false); // Reset video playback state on slide change
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    } else {
      setCurrentMediaIndex(unifiedMedia.length - 1);
    }
  };

  const handleSelectDot = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlaying(false); // Reset video playback state on indicator click
    setCurrentMediaIndex(idx);
  };

  return (
    <article
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Header Info: Clickable Provider Name, Role Badge, City, Date */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={onProviderNameClick}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              fontSize: '18px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${badgeStyle.bg}`,
              flexShrink: 0,
              cursor: onProviderNameClick ? 'pointer' : 'default',
            }}
            title={`Voir le profil ${roleLabels[roleCode] || 'prestataire'}`}
          >
            {roleCode === 'LEHRER' ? '🎓' : roleCode === 'DEUTSCH_INSTITUT' ? '🏫' : roleCode === 'VISA_COMPANION' ? '🛂' : '🏠'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                onClick={onProviderNameClick}
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#0F172A',
                  cursor: onProviderNameClick ? 'pointer' : 'default',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (onProviderNameClick) e.currentTarget.style.color = '#5B21B6';
                }}
                onMouseLeave={(e) => {
                  if (onProviderNameClick) e.currentTarget.style.color = '#0F172A';
                }}
              >
                {publication.providerName || 'Dr. Thomas MBIDA'}
              </span>
              {publication.providerVerified !== false && (
                <span title="Vérifié" style={{ fontSize: '13px', color: '#059669' }}>
                  ✓
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: badgeStyle.bg, color: badgeStyle.text, padding: '2px 6px', borderRadius: '4px' }}>
                {roleLabels[roleCode] || roleCode}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                📍 {publication.providerCity || 'Douala'}
              </span>
            </div>
          </div>
        </div>

        <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
          {publication.createdAt}
        </span>
      </div>

      {/* UNIFIED MIXED MEDIA CAROUSEL AREA (IMAGES & VIDEOS COMBINED) */}
      {hasMedia && activeMedia && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            backgroundColor: '#0F172A',
            overflow: 'hidden',
          }}
        >
          {/* Top-Left Story Dot Indicators (Representing ALL mixed media items) */}
          {unifiedMedia.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 20,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: '9999px',
              }}
            >
              {unifiedMedia.map((item, idx) => {
                const isSel = idx === currentMediaIndex;
                return (
                  <span
                    key={idx}
                    onClick={(e) => handleSelectDot(idx, e)}
                    style={{
                      width: isSel ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '9999px',
                      backgroundColor: isSel ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    title={item.type === 'video' ? 'Vidéo' : 'Photo'}
                  />
                );
              })}
            </div>
          )}

          {/* Left/Right Navigation Arrows for Mixed Carousel */}
          {unifiedMedia.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                aria-label="Média précédent"
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                ‹
              </button>
              <button
                onClick={handleNextMedia}
                aria-label="Média suivant"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                ›
              </button>
            </>
          )}

          {/* PHOTO MEDIA ITEM DISPLAY */}
          {isCurrentPhoto && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={activeMedia.url}
                alt={publication.title}
                onClick={() => onOpenFullscreenImage?.(activeMedia.url)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            </div>
          )}

          {/* VIDEO MEDIA ITEM DISPLAY */}
          {isCurrentVideo && (
            <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000000' }}>
              {isVideoPlaying ? (
                isYouTube ? (
                  <iframe
                    src={videoSrc.includes('youtube.com/embed') ? videoSrc : `https://www.youtube.com/embed/${videoSrc.split('v=')[1] || ''}?autoplay=1`}
                    title={publication.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )
              ) : (
                <div
                  onClick={() => setIsVideoPlaying(true)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!isYouTube && videoSrc ? (
                    <video
                      src={videoSrc}
                      preload="metadata"
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${videoSrc || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.85,
                      }}
                    />
                  )}

                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.35)' }} />

                  {/* Centered Large Play Button (Exact Center) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                      width: '56px',
                      height: '56px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(91, 33, 182, 0.95)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
                      pointerEvents: 'none',
                    }}
                  >
                    ▶
                  </div>

                  {/* Single Video Indicator Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.65)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 10,
                    }}
                  >
                    <span>🎥</span>
                    <span>Vidéo</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTENT & THREE-DOT EXPANDABLE DESCRIPTION */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
            {publication.title}
          </h3>

          {/* Three-Dot Button (⋯) to toggle complete description */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Réduire la description' : 'Lire la description complète'}
            aria-label="Toggle full description"
            style={{
              background: 'none',
              border: 'none',
              color: '#5B21B6',
              fontWeight: 800,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ⋯
          </button>
        </div>

        <p
          style={{
            fontSize: '13px',
            color: '#475569',
            marginTop: '8px',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'none' : 2,
            WebkitBoxOrient: 'orient-vertical' as any,
            overflow: isExpanded ? 'visible' : 'hidden',
          }}
        >
          {publication.body}
        </p>

        {/* BOTTOM BAR WITH LOCATION & DASHBOARD VIEWS COUNTER OR CONTACT BUTTON */}
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            📍 {publication.providerCity || 'Douala'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* VIEWS COUNTER (UNIQUELY VISIBLE IN PROVIDER DASHBOARD) */}
            {showViewCountInDashboard && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#5B21B6',
                  backgroundColor: '#F5F3FF',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid #DDD6FE',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Nombre total de vues de cette publication"
              >
                <span>👁</span>
                <span>{publication.viewCount ?? 24} vues</span>
              </span>
            )}

            {onContactClick && (
              <button
                onClick={onContactClick}
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
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>Contacter 💬</span>
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: '8px', textAlign: 'right' }}>
            <button
              onClick={() => setIsExpanded(false)}
              style={{ background: 'none', border: 'none', color: '#5B21B6', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              Réduire ▲
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
