import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 120,
        backgroundColor: type === 'success' ? '#059669' : '#5B21B6',
        color: '#FFFFFF',
        padding: '12px 20px',
        borderRadius: '9999px',
        fontSize: '13px',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
      role="status"
    >
      <span>{type === 'success' ? '✓' : 'ℹ'}</span>
      <span>{message}</span>
    </div>
  );
}
