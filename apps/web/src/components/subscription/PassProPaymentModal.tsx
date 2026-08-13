'use client';

import React, { useState, useEffect } from 'react';

export interface PassProPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (txId: string) => void;
  roleCode?: string;
  roleName?: string;
  customPriceXAF?: number;
}

export type PaymentStep = 'SELECT_PLAN' | 'USSD_PENDING' | 'SUCCESS' | 'FAILURE';

export function PassProPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  roleCode,
  roleName,
  customPriceXAF,
}: PassProPaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('SELECT_PLAN');
  const [provider, setProvider] = useState<'ORANGE_MONEY' | 'MTN_MOMO'>('ORANGE_MONEY');
  const [phoneNumber, setPhoneNumber] = useState('699000000');
  const [plan, setPlan] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [countdown, setCountdown] = useState(60);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_PLAN');
      setCountdown(60);
    }
  }, [isOpen]);

  // USSD Countdown Effect
  useEffect(() => {
    let timer: any;
    if (step === 'USSD_PENDING' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && step === 'USSD_PENDING') {
      setStep('SUCCESS');
      if (onPaymentSuccess) onPaymentSuccess('TX-9988-OK');
    }
    return () => clearInterval(timer);
  }, [step, countdown, onPaymentSuccess]);

  // Keyboard Escape Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      alert('Veuillez entrer un numéro de téléphone valide');
      return;
    }
    setCountdown(10);
    setStep('USSD_PENDING');
  };

  const displayPriceText = customPriceXAF
    ? `${customPriceXAF.toLocaleString()} FCFA / mois`
    : plan === 'MONTHLY'
    ? '5.000 XAF / mois'
    : '50.000 XAF / an';

  const titleText = roleName ? `Abonnement ${roleName}` : 'Activer Pass Pro';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="passpro-modal-title"
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
        aria-hidden="true"
      />

      <div
        className="animate-slide-up"
        style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 40px -5px rgba(91, 33, 182, 0.25)',
          border: '1px solid #E2E8F0',
          zIndex: 2200,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre de paiement"
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

        {step === 'SELECT_PLAN' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>💳</span>
              <h2 id="passpro-modal-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {titleText}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              {roleName
                ? `Paiement d'abonnement dédié pour débloquer votre profil ${roleName}.`
                : "Débloquez la publication d'annonces et la visibilité prioritaire sur Recherche."}
            </p>

            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6' }}>TARIF ABONNEMENT RÔLE:</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {displayPriceText}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                MODE DE PAIEMENT MOBILE MONEY
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setProvider('ORANGE_MONEY')}
                  style={{
                    minHeight: '44px',
                    borderRadius: '10px',
                    border: provider === 'ORANGE_MONEY' ? '2px solid #D97706' : '1px solid #E2E8F0',
                    backgroundColor: provider === 'ORANGE_MONEY' ? '#FFFBEB' : '#FFFFFF',
                    color: '#B45309',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  🟠 Orange Money (#150#)
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('MTN_MOMO')}
                  style={{
                    minHeight: '44px',
                    borderRadius: '10px',
                    border: provider === 'MTN_MOMO' ? '2px solid #D97706' : '1px solid #E2E8F0',
                    backgroundColor: provider === 'MTN_MOMO' ? '#FFFBEB' : '#FFFFFF',
                    color: '#B45309',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  🟡 MTN MoMo (*126#)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="phone-input" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                NUMÉRO DE TÉLÉPHONE MOBILE MONEY
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: 699 00 00 00"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleStartPayment}
              style={{
                width: '100%',
                minHeight: '48px',
                backgroundColor: '#5B21B6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Payer {displayPriceText}
            </button>
          </div>
        )}

        {step === 'USSD_PENDING' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📲</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              Prompt USSD Envoyé
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
              Validez la demande de paiement sur votre téléphone ({phoneNumber}) via{' '}
              {provider === 'ORANGE_MONEY' ? 'Orange Money (#150#)' : 'MTN MoMo (*126#)'}.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                backgroundColor: '#F5F3FF',
                border: '3px solid #5B21B6',
                color: '#5B21B6',
                fontSize: '20px',
                fontWeight: 800,
                marginBottom: '16px',
              }}
            >
              {countdown}s
            </div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
              Paiement Confirmé !
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', marginBottom: '20px', lineHeight: 1.5 }}>
              {roleName
                ? `L'abonnement pour ${roleName} est désormais actif.`
                : 'Votre paiement Mobile Money a été confirmé.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                minHeight: '48px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Continuer vers mon Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
