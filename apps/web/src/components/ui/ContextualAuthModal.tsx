'use client';

import React from 'react';

export interface ContextualAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onRegister: () => void;
  onLogin: () => void;
}

export function ContextualAuthModal({
  isOpen,
  onClose,
  title = 'Rejoins RECHERCHE 🇩🇪',
  message = 'Crée ton compte RECHERCHE pour suivre ce prestataire et retrouver ses publications.',
  onRegister,
  onLogin,
}: ContextualAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
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
            fontSize: '16px',
            fontWeight: 800,
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* HERO ICON BADGE */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#F5F3FF',
            color: '#5B21B6',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            border: '1px solid #DDD6FE',
            boxShadow: '0 8px 20px rgba(91, 33, 182, 0.15)',
          }}
        >
          ✨
        </div>

        {/* TITLE & CONTEXTUAL MESSAGE */}
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
          {title}
        </h3>

        <p style={{ fontSize: '14px', color: '#475569', marginTop: '10px', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={onRegister}
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(91, 33, 182, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>✨ Créer mon compte</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            style={{
              width: '100%',
              minHeight: '46px',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            J&apos;ai déjà un compte
          </button>
        </div>
      </div>
    </div>
  );
}
