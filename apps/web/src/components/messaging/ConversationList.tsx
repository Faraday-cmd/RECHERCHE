'use client';

import React from 'react';

export interface ConversationItem {
  id: string;
  type: 'USER_PROVIDER' | 'FRIEND_PRIVATE' | 'GROUP';
  contextRoleId?: string;
  recipientName: string;
  recipientRole?: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount?: number;
}

export const ConversationList: React.FC<{
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  activeRoleContextName?: string;
}> = ({ conversations, selectedId, onSelect, activeRoleContextName }) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px -2px rgba(91, 33, 182, 0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Messagerie Directe
        </h2>
        {activeRoleContextName && (
          <p style={{ fontSize: '12px', color: '#5B21B6', fontWeight: 600, marginTop: '2px' }}>
            Boîte de réception: {activeRoleContextName}
          </p>
        )}
      </div>

      {/* Conversations List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Aucune conversation active</div>
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
              Recherchez un prestataire pour engager une discussion directe.
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSel = selectedId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  borderLeft: isSel ? '4px solid #5B21B6' : '4px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '9999px',
                    backgroundColor: '#EDE9FE',
                    color: '#5B21B6',
                    fontWeight: 700,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {conv.recipientName.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.recipientName}
                    </h4>
                    {conv.recipientRole && (
                      <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#F5F3FF', color: '#5B21B6', padding: '2px 6px', borderRadius: '4px' }}>
                        {conv.recipientRole}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage || 'Nouvelle conversation'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
