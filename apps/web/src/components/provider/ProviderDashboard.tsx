'use client';

import React, { useState } from 'react';
import { PassProPaymentModal } from '../subscription/PassProPaymentModal';

export interface RoleDashboardItem {
  userRoleId: string;
  roleCode: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT';
  roleName: string;
  status: string;
  isConfigured: boolean;
  publicationStatus: 'DRAFT' | 'CONFIGURED' | 'PUBLISHED' | 'UNPUBLISHED';
}

export interface ProviderDashboardProps {
  unlockedRoles: RoleDashboardItem[];
  activeRole: RoleDashboardItem;
  onSelectRole: (roleId: string) => void;
  onTogglePublish?: (publish: boolean) => void;
  onEditProfile?: () => void;
  stats?: {
    followers: number;
    infosPublished: number;
    coursesPublished: number;
    ratingsReceived: number;
  };
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  unlockedRoles,
  activeRole,
  onSelectRole,
  onTogglePublish,
  onEditProfile,
  stats = { followers: 142, infosPublished: 8, coursesPublished: 4, ratingsReceived: 28 },
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [entitlementActive, setEntitlementActive] = useState(true);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Role Switcher */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, uppercase: 'true', color: '#5B21B6', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
              ESPACE PRESTATAIRE DÉDIÉ
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px', margin: 0 }}>
              Tableau de Bord — {activeRole.roleName}
            </h1>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            style={{
              minHeight: '40px',
              padding: '0 14px',
              backgroundColor: '#5B21B6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💳</span>
            <span>Gérer Pass Pro</span>
          </button>
        </div>

        {/* Role Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {unlockedRoles.map((role) => {
            const isSel = activeRole.userRoleId === role.userRoleId;
            return (
              <button
                key={role.userRoleId}
                onClick={() => onSelectRole(role.userRoleId)}
                style={{
                  minHeight: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: isSel ? '2px solid #5B21B6' : '1px solid #E2E8F0',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  color: isSel ? '#5B21B6' : '#475569',
                  fontWeight: isSel ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: role.publicationStatus === 'PUBLISHED' ? '#059669' : '#D97706' }} />
                {role.roleName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publication Status Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Statut de Publication:</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: activeRole.publicationStatus === 'PUBLISHED' ? '#ECFDF5' : '#FFFBEB',
                color: activeRole.publicationStatus === 'PUBLISHED' ? '#059669' : '#D97706',
              }}
            >
              {activeRole.publicationStatus === 'PUBLISHED' ? 'EN LIGNE (PUBLIÉ)' : 'HORS LIGNE (BROUILLON)'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Seuls les profils configurés apparaissent dans les résultats de recherche.
          </p>
        </div>

        {activeRole.isConfigured && (
          <button
            onClick={() => onTogglePublish?.(activeRole.publicationStatus !== 'PUBLISHED')}
            style={{
              minHeight: '40px',
              padding: '0 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeRole.publicationStatus === 'PUBLISHED' ? '#FEF2F2' : '#059669',
              color: activeRole.publicationStatus === 'PUBLISHED' ? '#DC2626' : '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {activeRole.publicationStatus === 'PUBLISHED' ? 'Masquer du public' : 'Publier mon profil'}
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Abonnés', value: stats.followers, icon: '👥' },
          { label: 'Infos Publiées', value: stats.infosPublished, icon: '📢' },
          { label: 'Cours Actifs', value: stats.coursesPublished, icon: '📚' },
          { label: 'Avis Reçus', value: stats.ratingsReceived, icon: '⭐' },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>{item.label}</span>
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* USSD Mobile Money Pass Pro Payment Modal */}
      <PassProPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={(txId) => {
          setEntitlementActive(true);
        }}
      />
    </div>
  );
};
