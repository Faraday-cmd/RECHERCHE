import React from 'react';

export type NavTab = 'decouverte' | 'infos' | 'amis' | 'messages' | 'dashboard' | 'profil';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items: { id: NavTab; label: string; icon: string }[] = [
    { id: 'decouverte', label: 'Découv.', icon: '🏠' },
    { id: 'infos', label: 'Infos', icon: '📢' },
    { id: 'amis', label: 'Amis', icon: '👥' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profil', label: 'Profil', icon: '👤' },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navigation principale mobile"
      style={{
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 2px',
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
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              backgroundColor: isActive ? '#F5F3FF' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: '2px 0',
            }}
            aria-label={item.label}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? '#5B21B6' : '#64748B',
                lineHeight: 1,
                whiteSpace: 'nowrap',
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
