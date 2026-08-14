'use client';

import React, { useState, useEffect } from 'react';

export interface FirstLaunchExperienceProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export function FirstLaunchExperience({ onComplete, forceShow = false }: FirstLaunchExperienceProps) {
  const [phase, setPhase] = useState<'splash' | 'step1' | 'step2' | 'exiting'>('splash');

  useEffect(() => {
    // Phase 1: Splash screen lasts 1.4 seconds before fading into Onboarding Step 1
    const timer = setTimeout(() => {
      setPhase('step1');
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  const handleNextStep = () => {
    setPhase('step2');
  };

  const handleFinish = () => {
    setPhase('exiting');
    setTimeout(() => {
      try {
        localStorage.setItem('recherche_onboarding_seen', 'true');
      } catch (e) {
        // Safe fallback for restricted storage environments
      }
      onComplete();
    }, 350); // Match exit fade duration
  };

  if (phase === 'exiting') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#FFFFFF',
          opacity: 0,
          transform: 'scale(1.02)',
          transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* BACKGROUND AMBIENT ACCENTS */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(245, 243, 255, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, rgba(255, 251, 235, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* PHASE 1: SHORT SPLASH / LOGO ANIMATION (FACEBOOK-LIKE ELEVATED OPENING) */}
      {phase === 'splash' && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            textAlign: 'center',
          }}
        >
          {/* BRAND LOGO BADGE */}
          <div
            style={{
              position: 'relative',
              width: '92px',
              height: '92px',
              borderRadius: '26px',
              backgroundColor: '#5B21B6',
              boxShadow: '0 16px 36px -6px rgba(91, 33, 182, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite ease-in-out',
            }}
          >
            <span style={{ fontSize: '46px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1px' }}>
              R
            </span>
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                fontSize: '18px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              }}
            >
              🇩🇪
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '1px',
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              RECHERCHE
            </h1>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748B',
                marginTop: '4px',
                margin: 0,
                letterSpacing: '0.2px',
              }}
            >
              Votre passeport pour l&apos;Allemagne 🇩🇪
            </p>
          </div>

          {/* ELEGANT BOTTOM LOADING INDICATOR */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#5B21B6',
                animation: 'ping 1s infinite alternate',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#8B5CF6',
                animation: 'ping 1s infinite alternate 0.2s',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#DDD6FE',
                animation: 'ping 1s infinite alternate 0.4s',
              }}
            />
          </div>
        </div>
      )}

      {/* ONBOARDING CARDS WRAPPER (MOBILE FIRST, MAX 420px) */}
      {(phase === 'step1' || phase === 'step2') && (
        <div
          className="animate-slide-up"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '82vh',
            maxHeight: '720px',
            backgroundColor: '#FFFFFF',
            borderRadius: '28px',
            padding: '24px 20px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* HEADER: LOGO BRANDING & PROGRESS DOTS */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                R
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.5px' }}>
                RECHERCHE
              </span>
            </div>

            {/* STEP PROGRESS PILLS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: phase === 'step1' ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: phase === 'step1' ? '#5B21B6' : '#CBD5E1',
                  transition: 'all 0.3s ease',
                }}
              />
              <div
                style={{
                  width: phase === 'step2' ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: phase === 'step2' ? '#5B21B6' : '#CBD5E1',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* SCREEN 1: FIND PROFESSIONALS */}
          {phase === 'step1' && (
            <div
              className="animate-fade-in"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
                justifyContent: 'center',
                padding: '12px 0',
              }}
            >
              {/* VISUAL ILLUSTRATION CARD */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '180px',
                  borderRadius: '24px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: '28px',
                  boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.12)',
                }}
              >
                {/* FLOATING ICON BADGES */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#5B21B6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🎓</span>
                  <span>Enseignants</span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🏠</span>
                  <span>Betreuer</span>
                </div>

                {/* CENTERED HERO EMOJI EMBLEM */}
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '22px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #C4B5FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '38px',
                    boxShadow: '0 8px 20px rgba(91, 33, 182, 0.18)',
                  }}
                >
                  🧭
                </div>
              </div>

              {/* MAIN MESSAGE FOR SCREEN 1 */}
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#0F172A',
                  lineHeight: 1.35,
                  margin: 0,
                  padding: '0 4px',
                }}
              >
                Recherche des professionnels pour t&apos;accompagner dans ton aventure allemande.
              </h2>

              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  marginTop: '12px',
                  lineHeight: 1.5,
                  maxWidth: '320px',
                  margin: '12px 0 0 0',
                }}
              >
                Accède aux profils vérifiés d&apos;enseignants de langue, de betreuer, d&apos;accompagnateurs visa et d&apos;instituts agréés.
              </p>
            </div>
          )}

          {/* SCREEN 2: CONNECT WITH PEOPLE */}
          {phase === 'step2' && (
            <div
              className="animate-fade-in"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flex: 1,
                justifyContent: 'center',
                padding: '12px 0',
              }}
            >
              {/* VISUAL ILLUSTRATION CARD */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '280px',
                  height: '180px',
                  borderRadius: '24px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: '28px',
                  boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.12)',
                }}
              >
                {/* FLOATING CHAT BUBBLES */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>💬</span>
                  <span>Entraide & conseils</span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '18px',
                    left: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#5B21B6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🤝</span>
                  <span>Communauté</span>
                </div>

                {/* CENTERED HERO EMOJI EMBLEM */}
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '22px',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #6EE7B7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '38px',
                    boxShadow: '0 8px 20px rgba(5, 150, 105, 0.18)',
                  }}
                >
                  👥
                </div>
              </div>

              {/* MAIN MESSAGE FOR SCREEN 2 */}
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#0F172A',
                  lineHeight: 1.35,
                  margin: 0,
                  padding: '0 4px',
                }}
              >
                Chat avec tes amis qui font la même chose que toi.
              </h2>

              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  marginTop: '12px',
                  lineHeight: 1.5,
                  maxWidth: '320px',
                  margin: '12px 0 0 0',
                }}
              >
                Discute avec tes amis et des professionels pour partager tes démarches, poser tes questions et avancer ensemble.
              </p>
            </div>
          )}

          {/* BOTTOM FOOTER CTA BUTTONS */}
          <div style={{ width: '100%', marginTop: 'auto', paddingTop: '16px' }}>
            {phase === 'step1' ? (
              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(91, 33, 182, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Suivant →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                style={{
                  width: '100%',
                  minHeight: '52px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(91, 33, 182, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Commencer →</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
