'use client';

import React, { useState } from 'react';

export interface MessageBubble {
  id: string;
  sender: 'user' | 'provider';
  text: string;
  timestamp: string;
}

export interface ActiveChatViewProps {
  providerId: string;
  recipientName: string;
  recipientRole?: string;
  recipientAvatar?: string;
  verified?: boolean;
  messages: MessageBubble[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({
  recipientName,
  recipientRole = 'Prestataire',
  recipientAvatar,
  verified = true,
  messages,
  onSendMessage,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        minHeight: '480px',
      }}
    >
      {/* 1. CHAT HEADER BAR */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={onBack}
          aria-label="Retour à la liste des conversations"
          style={{
            minHeight: '38px',
            padding: '0 12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#334155',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <span>←</span>
          <span>Retour</span>
        </button>

        {/* Recipient Avatar */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#F5F3FF',
            color: '#5B21B6',
            fontWeight: 800,
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #DDD6FE',
            flexShrink: 0,
          }}
        >
          {recipientAvatar ? (
            <img src={recipientAvatar} alt={recipientName} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
          ) : (
            recipientName.charAt(0)
          )}
        </div>

        {/* Recipient Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {recipientName}
            </h3>
            {verified && (
              <span
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                }}
              >
                ✓ VÉRIFIÉ
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#5B21B6', fontWeight: 600, marginTop: '1px' }}>
            {recipientRole}
          </div>
        </div>
      </div>

      {/* 2. MESSAGES THREAD AREA */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto 0',
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Commencez une conversation avec {recipientName}
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: 1.5 }}>
              Posez vos questions sur les services d&apos;accompagnement, les tarifs, ou les disponibilités de cours.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    backgroundColor: isUser ? '#5B21B6' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#0F172A',
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 3. MESSAGE INPUT BAR */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Écrivez votre message ici..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Votre message"
          style={{
            flex: 1,
            minHeight: '44px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            fontSize: '14px',
            color: '#0F172A',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            minHeight: '44px',
            padding: '0 18px',
            backgroundColor: inputText.trim() ? '#5B21B6' : '#E2E8F0',
            color: inputText.trim() ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Envoyer</span>
          <span>📤</span>
        </button>
      </form>
    </div>
  );
};
