'use client';

import React from 'react';

export interface ConversationItem {
  id: string;
  type: 'USER_PROVIDER' | 'FRIEND_PRIVATE' | 'GROUP';
  contextRoleId?: string;
  recipientName: string;
  recipientRole?: string;
  recipientAvatar?: string;
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
        borderRadius: '0px',
        border: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 'calc(100vh - 140px)',
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
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '15px' }}>Aucune conversation active</div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px', maxWidth: '360px', margin: '6px auto 0 auto' }}>
              Les messages envoyés par vos amis ou les prestataires apparaîtront ici.
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSel = selectedId === conv.id;
            const unread = conv.unreadCount || 0;
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
                  backgroundColor: isSel ? '#F5F3FF' : unread > 0 ? '#FAF5FF' : '#FFFFFF',
                  borderLeft: isSel ? '4px solid #5B21B6' : unread > 0 ? '4px solid #7C3AED' : '4px solid transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#EDE9FE',
                    color: '#5B21B6',
                    fontWeight: 800,
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {conv.recipientAvatar ? (
                    <img src={conv.recipientAvatar} alt={conv.recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    conv.recipientName.charAt(0)
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.recipientName}
                    </h4>
                    <span style={{ fontSize: '11px', color: unread > 0 ? '#5B21B6' : '#94A3B8', fontWeight: unread > 0 ? 800 : 500 }}>
                      {conv.updatedAt}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: unread > 0 ? '#0F172A' : '#64748B', fontWeight: unread > 0 ? 700 : 400, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage || 'Nouvelle conversation'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {conv.recipientRole && (
                        <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#F5F3FF', color: '#5B21B6', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                          {conv.recipientRole}
                        </span>
                      )}
                      {unread > 0 && (
                        <span
                          style={{
                            backgroundColor: '#5B21B6',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            flexShrink: 0,
                          }}
                        >
                          {unread}
                        </span>
                      )}
                    </div>
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
