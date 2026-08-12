import React from 'react';

export function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '12px 14px',
        boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '88px',
      }}
      aria-label="Chargement du prestataire en cours..."
      role="status"
    >
      {/* Avatar Skeleton */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '9999px',
          backgroundColor: '#EDE9FE',
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          flexShrink: 0,
        }}
      />

      {/* Lines Skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            height: '14px',
            width: '60%',
            backgroundColor: '#E2E8F0',
            borderRadius: '4px',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div
          style={{
            height: '12px',
            width: '40%',
            backgroundColor: '#F1F5F9',
            borderRadius: '4px',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div
          style={{
            height: '10px',
            width: '30%',
            backgroundColor: '#F1F5F9',
            borderRadius: '4px',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      {/* Button Skeleton */}
      <div
        style={{
          width: '54px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#EDE9FE',
          animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          flexShrink: 0,
        }}
      />
    </div>
  );
}
