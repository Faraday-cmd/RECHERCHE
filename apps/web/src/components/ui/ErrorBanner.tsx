import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '16px',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>⚠️</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
          {message}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            minHeight: '36px',
            padding: '0 12px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
