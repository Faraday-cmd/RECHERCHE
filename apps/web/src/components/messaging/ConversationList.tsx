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

export interface AvailableMessageRole {
  code: string; // 'USER' | 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT'
  label: string;
  icon?: string;
  unreadCount?: number;
}

export const ConversationList: React.FC<{
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  availableRoles?: AvailableMessageRole[];
  activeMessageRoleCode?: string;
  onSelectMessageRole?: (roleCode: string) => void;
}> = ({
  conversations,
  selectedId,
  onSelect,
  availableRoles = [],
  activeMessageRoleCode = 'USER',
  onSelectMessageRole,
}) => {
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
      }}
    >
      {/* Header Bar */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Messages
        </h2>

        {/* ROLE SELECTOR BAR WITH PER-ROLE UNREAD MESSAGES BADGES */}
        {availableRoles.length > 1 && (
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {availableRoles.map((role) => {
              const isSel = activeMessageRoleCode === role.code;
              const unread = role.unreadCount || 0;
              return (
                <button
                  key={role.code}
                  onClick={() => onSelectMessageRole?.(role.code)}
                  style={{
                    minHeight: '36px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    border: isSel ? '1px solid #5B21B6' : '1px solid #E2E8F0',
                    backgroundColor: isSel ? '#5B21B6' : '#F8FAFC',
                    color: isSel ? '#FFFFFF' : '#475569',
                    fontSize: '12px',
                    fontWeight: isSel ? 800 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                  }}
                >
                  <span>
                    {role.icon ? `${role.icon} ` : ''}
                    {role.label}
                  </span>
                  {/* Dynamic Unread Badge per Role */}
                  {unread > 0 && (
                    <span
                      style={{
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        lineHeight: 1.2,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>Aucune conversation active pour cette identité</div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px', maxWidth: '360px', margin: '6px auto 0 auto' }}>
              Les messages envoyés par les candidats ou prestataires associés à ce rôle apparaîtront ici.
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
                  padding: '14px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  borderLeft: isSel ? '4px solid #5B21B6' : '4px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#EDE9FE',
                    color: '#5B21B6',
                    fontWeight: 800,
                    fontSize: '18px',
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
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.recipientName}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{conv.updatedAt}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                    <p style={{ fontSize: '13px', color: conv.unreadCount ? '#0F172A' : '#64748B', fontWeight: conv.unreadCount ? 700 : 400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage || 'Nouvelle conversation'}
                    </p>
                    {conv.recipientRole && (
                      <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#F5F3FF', color: '#5B21B6', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, marginLeft: '8px' }}>
                        {conv.recipientRole}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
