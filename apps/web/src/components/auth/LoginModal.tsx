'use client';

import React, { useState } from 'react';
import { authService, UserProfile } from '../../services/authService';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onSwitchToRegister: () => void;
  pendingActionContext?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  pendingActionContext,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Forgotten password state
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'INPUT_EMAIL' | 'ENTER_NEW_PASS' | 'SUCCESS'>('INPUT_EMAIL');
  const [forgotNotice, setForgotNotice] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = authService.login(email, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      // REQUIREMENT 6: Show "Email ou mot de passe incorrect." without wiping email input
      setErrorMsg(res.error || 'Email ou mot de passe incorrect.');
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const res = authService.requestPasswordReset(forgotEmail);
    if (!res.success) {
      setForgotError(res.message);
      return;
    }

    setDemoToken(res.demoResetToken || '');
    setForgotStep('ENTER_NEW_PASS');
  };

  const handleFinalizeReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!newPassword || newPassword.length < 6) {
      setForgotError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Les mots de passe ne correspondent pas.');
      return;
    }

    const res = authService.resetPasswordWithToken(demoToken, forgotEmail, newPassword);
    setForgotNotice(res.message);
    setForgotStep('SUCCESS');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '26px',
          padding: '32px 28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          margin: 'auto',
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            backgroundColor: '#F1F5F9',
            border: 'none',
            borderRadius: '9999px',
            width: '34px',
            height: '34px',
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

        {/* FORGOTTEN PASSWORD MODAL FLOW */}
        {isForgotPassOpen ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassOpen(false);
                  setForgotStep('INPUT_EMAIL');
                  setForgotError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5B21B6',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Retour à la connexion
              </button>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Mot de passe oublié ?
            </h3>

            {forgotStep === 'INPUT_EMAIL' && (
              <form onSubmit={handleRequestReset} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Entre ton adresse email pour recevoir un lien de réinitialisation.
                </p>

                {forgotError && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 700 }}>
                    ⚠️ {forgotError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    ADRESSE E-MAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="exemple@domaine.cm"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '0 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    minHeight: '44px',
                    backgroundColor: '#5B21B6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(91, 33, 182, 0.3)',
                  }}
                >
                  Obtenir le lien de réinitialisation
                </button>
              </form>
            )}

            {forgotStep === 'ENTER_NEW_PASS' && (
              <form onSubmit={handleFinalizeReset} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* PROTOTYPE SECURITY NOTICE */}
                <div style={{ padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '12px', color: '#1E40AF', fontSize: '12px', lineHeight: 1.45 }}>
                  💡 <strong>Note de démonstration :</strong> Un token de réinitialisation unique a été simulé. En production, un lien sécurisé est envoyé par email.
                </div>

                {forgotError && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 700 }}>
                    ⚠️ {forgotError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    NOUVEAU MOT DE PASSE *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '0 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    CONFIRMER LE NOUVEAU MOT DE PASSE *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: '0 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    minHeight: '44px',
                    backgroundColor: '#5B21B6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(91, 33, 182, 0.3)',
                  }}
                >
                  Enregistrer le nouveau mot de passe
                </button>
              </form>
            )}

            {forgotStep === 'SUCCESS' && (
              <div style={{ marginTop: '16px', textOverflow: 'ellipsis' }}>
                <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', color: '#047857', fontSize: '13.5px', fontWeight: 700, lineHeight: 1.5 }}>
                  ✓ {forgotNotice}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassOpen(false);
                    setForgotStep('INPUT_EMAIL');
                  }}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    marginTop: '16px',
                    backgroundColor: '#5B21B6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Se connecter maintenant
                </button>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD LOGIN VIEW */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#F5F3FF',
                  color: '#5B21B6',
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  border: '1px solid #DDD6FE',
                }}
              >
                🔐
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Connexion à RECHERCHE
              </h2>
              {pendingActionContext && (
                <p style={{ fontSize: '12.5px', color: '#5B21B6', fontWeight: 700, margin: '6px 0 0 0' }}>
                  💡 Connectez-vous pour continuer votre action ({pendingActionContext})
                </p>
              )}
            </div>

            {/* ERROR BANNER FOR INCORRECT CREDENTIALS (REQUIREMENT 6) */}
            {errorMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '12px',
                  color: '#DC2626',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                « {errorMsg} »
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  ADRESSE E-MAIL *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.cm"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', margin: 0 }}>
                    MOT DE PASSE *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassOpen(true);
                      setForgotEmail(email);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#5B21B6',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  backgroundColor: '#5B21B6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(91, 33, 182, 0.3)',
                  marginTop: '4px',
                }}
              >
                Se connecter
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Vous n&apos;avez pas encore de compte ?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToRegister();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5B21B6',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Créer mon compte
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
