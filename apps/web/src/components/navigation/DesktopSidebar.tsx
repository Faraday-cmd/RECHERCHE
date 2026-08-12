import React from 'react';
import { NavTab } from './BottomNav';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenPassPro: () => void;
}

export function DesktopSidebar({
  activeTab,
  onTabChange,
  onOpenPassPro,
}: DesktopSidebarProps) {
  const items: { id: NavTab; label: string; icon: string }[] = [
    { id: 'decouverte', label: 'Découverte', icon: '🏠' },
    { id: 'prestataires', label: 'Prestataires', icon: '🎓' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'pass', label: 'Pass Pro', icon: '💳' },
    { id: 'profil', label: 'Mon Profil', icon: '👤' },
  ];

  return (
    <aside
      className="hidden md:flex"
      style={{
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: '24px 16px',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header & Brand */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#5B21B6', letterSpacing: '-0.5px' }}>
            RECHERCHE
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#F5F3FF', color: '#5B21B6', padding: '2px 6px', borderRadius: '9999px', border: '1px solid #DDD6FE' }}>
            V1
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  minHeight: '44px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                  color: isActive ? '#5B21B6' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background-color 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom CTA Widget */}
      <div
        style={{
          backgroundColor: '#F5F3FF',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #DDD6FE',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6' }}>PASS PRO ACTIF</div>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: '12px' }}>
          Formule mensuelle active sur l&apos;écosystème.
        </p>
        <button
          onClick={onOpenPassPro}
          style={{
            width: '100%',
            minHeight: '38px',
            backgroundColor: '#5B21B6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Gérer Mobile Money
        </button>
      </div>
    </aside>
  );
}
