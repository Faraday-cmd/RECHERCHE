'use client';

import React, { useState } from 'react';
import { authService, UserProfile, ValidationErrors } from '../../services/authService';

export interface RegisterLandingPageProps {
  isOpen: boolean;
  pendingActionContext?: string;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export function RegisterLandingPage({
  isOpen,
  pendingActionContext,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}: RegisterLandingPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Douala');
  const [customCity, setCustomCity] = useState('');
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Per-field validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const finalCity = showCustomCity && customCity.trim() ? customCity.trim() : city;

    const result = authService.register({
      fullName,
      email,
      phone,
      city: finalCity,
      password,
      confirmPassword,
    });

    if (!result.success || !result.user) {
      setErrors(result.errors || { general: 'Erreur lors de la création du compte. Vérifiez les informations.' });
      return;
    }

    // Account created & auto-authenticated
    onRegisterSuccess(result.user);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      {/* DESKTOP & MOBILE WRAPPER CONTAINER */}
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          minHeight: '620px',
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
          border: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          overflow: 'hidden',
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
            width: '36px',
            height: '36px',
            fontSize: '18px',
            fontWeight: 800,
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
            transition: 'all 0.15s ease',
          }}
        >
          ✕
        </button>

        {/* LEFT SECTION: BRANDING & INSPIRATIONAL CAROUSEL */}
        <div
          style={{
            backgroundColor: '#5B21B6',
            backgroundImage: 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)',
            padding: '40px 32px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800, marginBottom: '24px' }}>
              <span>🇩🇪 RECHERCHE CAMEROUN</span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1.25, margin: 0, letterSpacing: '-0.5px' }}>
              Rejoins la plus grande communauté de candidats pour l&apos;Allemagne.
            </h1>

            <p style={{ fontSize: '14.5px', color: '#DDD6FE', marginTop: '12px', lineHeight: 1.5 }}>
              Trouvez des enseignants certifiés, betreuer, accompagnateurs visa et amis pour réussir votre projet d&apos;études et de mobilité.
            </p>

            {pendingActionContext && (
              <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.18)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.25)', fontSize: '13px', fontWeight: 700 }}>
                ✨ {pendingActionContext} — Votre compte enregistrera automatiquement cette action dès la création !
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ fontSize: '24px' }}>👥</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>+12 000 Membres Actifs</div>
                <div style={{ fontSize: '12px', color: '#C4B5FD' }}>Douala, Yaoundé, Bafoussam, Bamenda</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: DEDICATED REGISTRATION FORM */}
        <div style={{ padding: '36px 32px', overflowY: 'auto', maxHeight: '85vh' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Créer mon compte
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
              Remplissez le formulaire ci-dessous pour rejoindre RECHERCHE.
            </p>
          </div>

          {errors.general && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', color: '#DC2626', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* FIELD 1: NOM & PRÉNOM */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Nom & Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Marc ALAIN"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  border: errors.fullName ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                  padding: '0 14px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#F8FAFC',
                }}
              />
              {errors.fullName && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.fullName}</div>}
            </div>

            {/* FIELD 2 & 3: EMAIL & PHONE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Adresse E-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.cm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    border: errors.email ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 14px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
                {errors.email && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.email}</div>}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Téléphone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+237 6..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    border: errors.phone ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 14px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
                {errors.phone && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.phone}</div>}
              </div>
            </div>

            {/* FIELD 4: VILLE */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Ville de résidence *
              </label>
              {!showCustomCity ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={city}
                    onChange={(e) => {
                      if (e.target.value === 'OTHER') {
                        setShowCustomCity(true);
                      } else {
                        setCity(e.target.value);
                      }
                    }}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '10px',
                      border: errors.city ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      fontWeight: 700,
                    }}
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Bamenda">Bamenda</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Buea">Buea</option>
                    <option value="Dschang">Dschang</option>
                    <option value="OTHER">+ Autre ville...</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Saisissez votre ville..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '10px',
                      border: '1px solid #5B21B6',
                      padding: '0 12px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomCity(false)}
                    style={{
                      padding: '0 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F1F5F9',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Retour
                  </button>
                </div>
              )}
              {errors.city && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.city}</div>}
            </div>

            {/* FIELD 5 & 6: PASSWORD & CONFIRM PASSWORD */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    border: errors.password ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 14px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
                {errors.password && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.password}</div>}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    border: errors.confirmPassword ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 14px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
                {errors.confirmPassword && <div style={{ color: '#DC2626', fontSize: '11.5px', marginTop: '3px', fontWeight: 700 }}>⚠️ {errors.confirmPassword}</div>}
              </div>
            </div>

            <button
              type="submit"
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
                boxShadow: '0 6px 18px rgba(91, 33, 182, 0.3)',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>✨ Créer mon compte RECHERCHE</span>
            </button>
          </form>

          <div style={{ marginTop: '20px', textOverflow: 'ellipsis', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              Vous avez déjà un compte ?{' '}
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
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
              J&apos;ai déjà un compte (Se connecter)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
