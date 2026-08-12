import React from 'react';

export type NavTab = 'decouverte' | 'prestataires' | 'messages' | 'pass' | 'profil';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items: { id: NavTab; label: string; icon: string }[] = [
    { id: 'decouverte', label: 'Découverte', icon: '🏠' },
    { id: 'prestataires', label: 'Prestataires', icon: '🎓' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'pass', label: 'Pass Pro', icon: '💳' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 4px',
        boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.04)',
      }}
    >
      {items.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              flex: 1,
              height: '52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              backgroundColor: isActive ? '#F5F3FF' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              padding: '4px 0',
            }}
            aria-label={item.label}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#5B21B6' : '#64748B',
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
