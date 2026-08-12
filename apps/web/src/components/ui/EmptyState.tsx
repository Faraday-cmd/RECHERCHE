import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '🔎',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '32px 20px',
        textAlign: 'center',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.04)',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '10px' }} aria-hidden="true">
        {icon}
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '340px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            minHeight: '44px',
            padding: '0 18px',
            backgroundColor: '#F5F3FF',
            color: '#5B21B6',
            border: '1px solid #DDD6FE',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
