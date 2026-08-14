'use client';

import React, { useState, useMemo } from 'react';

export interface FriendUser {
  id: string;
  name: string;
  avatarUrl?: string;
  city: string;
  quarter?: string;
  bio?: string;
  mutualFriendsCount?: number;
  followedProviderIds?: string[];
  acceptedFriendIds?: string[];
  status?: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';
  timeAgo?: string;
}

export interface AmisSectionProps {
  currentUserCity?: string;
  currentUserFollowedProviderIds?: string[];
  allUsers: FriendUser[];
  acceptedFriendIds: string[];
  pendingReceivedRequests: FriendUser[];
  pendingSentIds: string[];
  unreadConversationsCount?: number;
  onAcceptRequest: (userId: string) => void;
  onRejectRequest: (userId: string) => void;
  onSendRequest: (userId: string) => void;
  onOpenMessage: (userId: string, userName: string) => void;
  onGoToMessagesTab?: () => void;
}

export const AmisSection: React.FC<AmisSectionProps> = ({
  currentUserCity = 'Douala',
  currentUserFollowedProviderIds = [],
  allUsers,
  acceptedFriendIds,
  pendingReceivedRequests,
  pendingSentIds,
  unreadConversationsCount = 0,
  onAcceptRequest,
  onRejectRequest,
  onSendRequest,
  onOpenMessage,
  onGoToMessagesTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'suggestions' | 'friends' | 'messages'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMutualUser, setSelectedMutualUser] = useState<FriendUser | null>(null);

  // UNIVERSAL GRAPH MUTUAL FRIENDS CALCULATION ENGINE
  // Mutual friends = Intersection of Current User's accepted friends AND Target User's accepted friends
  const getMutualFriends = (targetUser: FriendUser): FriendUser[] => {
    const targetFriendIds = targetUser.acceptedFriendIds || [];
    const mutualIds = acceptedFriendIds.filter(
      (fId) => targetFriendIds.includes(fId) && fId !== targetUser.id
    );
    return allUsers.filter((u) => mutualIds.includes(u.id));
  };

  // 1. Accepted Friends List: ALL users whose 2-way friendship is accepted
  const acceptedFriendsList = useMemo(() => {
    let list = allUsers.filter((u) => acceptedFriendIds.includes(u.id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
    }
    return list;
  }, [allUsers, acceptedFriendIds, searchQuery]);

  // 2. Smart Suggestions Engine (Location overlap + Shared Followed Providers)
  const suggestionsList = useMemo(() => {
    let nonFriends = allUsers.filter(
      (u) => !acceptedFriendIds.includes(u.id) && !pendingReceivedRequests.some((r) => r.id === u.id)
    );

    const scored = nonFriends.map((u) => {
      let score = 0;
      if (u.city && currentUserCity && u.city.toLowerCase() === currentUserCity.toLowerCase()) {
        score += 3;
      }
      if (u.followedProviderIds && currentUserFollowedProviderIds.length > 0) {
        const commonProviders = u.followedProviderIds.filter((pId) => currentUserFollowedProviderIds.includes(pId));
        score += commonProviders.length * 2;
      }
      return { user: u, score };
    });

    scored.sort((a, b) => b.score - a.score);

    let result = scored.map((s) => s.user);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q));
    }

    return result;
  }, [allUsers, acceptedFriendIds, pendingReceivedRequests, currentUserCity, currentUserFollowedProviderIds, searchQuery]);

  // 3. Pending Requests List
  const requestsList = useMemo(() => {
    let list = pendingReceivedRequests;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q));
    }
    return list;
  }, [pendingReceivedRequests, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* HEADER WITH TITLE & SEARCH BAR WITH UPDATED PLACEHOLDER */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
              👥 Amis & Communauté
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
              Échangez avec d&apos;autres candidats pour l&apos;Allemagne, vos amis et votre réseau.
            </p>
          </div>
        </div>

        {/* SEARCH BAR WITH EXACT PLACEHOLDER: "Recherche de nouveau amis" */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Recherche de nouveau amis"
            style={{
              width: '100%',
              minHeight: '46px',
              padding: '0 44px 0 18px',
              borderRadius: '14px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontSize: '14px',
              color: '#0F172A',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94A3B8' }}>
            🔍
          </span>
        </div>

        {/* SUB-SECTION PILLS */}
        <div style={{ marginTop: '18px', display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px', position: 'relative' }}>
          {/* TAB 1: DEMANDES WITH RED BADGE */}
          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            style={{
              minHeight: '40px',
              padding: '0 18px',
              borderRadius: '9999px',
              border: activeSubTab === 'requests' ? '1px solid #5B21B6' : '1px solid #E2E8F0',
              backgroundColor: activeSubTab === 'requests' ? '#5B21B6' : '#F8FAFC',
              color: activeSubTab === 'requests' ? '#FFFFFF' : '#475569',
              fontSize: '13.5px',
              fontWeight: activeSubTab === 'requests' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Demandes</span>
            {pendingReceivedRequests.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                  padding: '0 4px',
                }}
              >
                {pendingReceivedRequests.length}
              </span>
            )}
          </button>

          {/* TAB 2: SUGGESTIONS */}
          <button
            type="button"
            onClick={() => setActiveSubTab('suggestions')}
            style={{
              minHeight: '40px',
              padding: '0 18px',
              borderRadius: '9999px',
              border: activeSubTab === 'suggestions' ? '1px solid #5B21B6' : '1px solid #E2E8F0',
              backgroundColor: activeSubTab === 'suggestions' ? '#5B21B6' : '#F8FAFC',
              color: activeSubTab === 'suggestions' ? '#FFFFFF' : '#475569',
              fontSize: '13.5px',
              fontWeight: activeSubTab === 'suggestions' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            Suggestions
          </button>

          {/* TAB 3: MES AMIS */}
          <button
            type="button"
            onClick={() => setActiveSubTab('friends')}
            style={{
              minHeight: '40px',
              padding: '0 18px',
              borderRadius: '9999px',
              border: activeSubTab === 'friends' ? '1px solid #5B21B6' : '1px solid #E2E8F0',
              backgroundColor: activeSubTab === 'friends' ? '#5B21B6' : '#F8FAFC',
              color: activeSubTab === 'friends' ? '#FFFFFF' : '#475569',
              fontSize: '13.5px',
              fontWeight: activeSubTab === 'friends' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            Mes Amis
          </button>

          {/* TAB 4: MESSAGES */}
          <button
            type="button"
            onClick={() => {
              if (onGoToMessagesTab) {
                onGoToMessagesTab();
              } else {
                setActiveSubTab('messages');
              }
            }}
            style={{
              minHeight: '40px',
              padding: '0 18px',
              borderRadius: '9999px',
              border: activeSubTab === 'messages' ? '1px solid #5B21B6' : '1px solid #E2E8F0',
              backgroundColor: activeSubTab === 'messages' ? '#5B21B6' : '#F8FAFC',
              color: activeSubTab === 'messages' ? '#FFFFFF' : '#475569',
              fontSize: '13.5px',
              fontWeight: activeSubTab === 'messages' ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Messages</span>
            {unreadConversationsCount > 0 && (
              <span
                style={{
                  backgroundColor: activeSubTab === 'messages' ? '#FFFFFF' : '#5B21B6',
                  color: activeSubTab === 'messages' ? '#5B21B6' : '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '1px 7px',
                  borderRadius: '9999px',
                }}
              >
                {unreadConversationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}

      {/* SUB-SECTION 1: DEMANDES D'AMIS */}
      {activeSubTab === 'requests' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Demandes d&apos;amis ({requestsList.length})
            </h2>
          </div>

          {requestsList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📬</div>
              <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Aucune demande en attente
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Explorez les suggestions pour vous connecter avec d&apos;autres membres.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {requestsList.map((user) => {
                const mutuals = getMutualFriends(user);
                return (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '20px',
                      border: '1px solid #E2E8F0',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '220px' }}>
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          backgroundColor: '#EDE9FE',
                          color: '#5B21B6',
                          fontWeight: 800,
                          fontSize: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #DDD6FE',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {user.name}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>📍 {user.city}</span>
                          {mutuals.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedMutualUser(user)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#5B21B6',
                                fontWeight: 800,
                                fontSize: '12.5px',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline',
                              }}
                            >
                              • {mutuals.length} ami(s) en commun
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => onAcceptRequest(user.id)}
                        style={{
                          minHeight: '40px',
                          padding: '0 20px',
                          backgroundColor: '#5B21B6',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(91, 33, 182, 0.25)',
                        }}
                      >
                        Confirmer / Accepter
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectRequest(user.id)}
                        style={{
                          minHeight: '40px',
                          padding: '0 16px',
                          backgroundColor: '#FFFFFF',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          borderRadius: '12px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 2: SMART SUGGESTIONS */}
      {activeSubTab === 'suggestions' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Suggestions de personnes ({suggestionsList.length})
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
              Recommandations basées sur votre secteur ({currentUserCity}) et les prestataires que vous suivez.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {suggestionsList.map((user) => {
              const isPending = pendingSentIds.includes(user.id);
              const isSameCity = user.city.toLowerCase() === currentUserCity.toLowerCase();
              const mutuals = getMutualFriends(user);

              return (
                <div
                  key={user.id}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '20px',
                    padding: '18px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        backgroundColor: '#EDE9FE',
                        color: '#5B21B6',
                        fontWeight: 800,
                        fontSize: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #DDD6FE',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {user.name}
                      </h4>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        📍 {user.city} {user.quarter ? `(${user.quarter})` : ''}
                      </div>
                      {mutuals.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedMutualUser(user)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#5B21B6',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline',
                            marginTop: '2px',
                            display: 'block',
                          }}
                        >
                          👥 {mutuals.length} ami(s) en commun
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', backgroundColor: isSameCity ? '#F5F3FF' : '#F1F5F9', color: isSameCity ? '#5B21B6' : '#475569', padding: '5px 12px', borderRadius: '10px', fontWeight: 700 }}>
                    {isSameCity ? `💡 Même secteur (${user.city})` : '💡 Intérêts similaires'}
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onSendRequest(user.id)}
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      backgroundColor: isPending ? '#F5F3FF' : '#5B21B6',
                      color: isPending ? '#5B21B6' : '#FFFFFF',
                      border: isPending ? '1px solid #DDD6FE' : 'none',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 800,
                      cursor: isPending ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{isPending ? '✓ Demande envoyée' : '+ Ajouter en ami'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: AMIS LIST */}
      {activeSubTab === 'friends' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Vos Amis
              </h2>
              <p style={{ fontSize: '13px', color: '#5B21B6', fontWeight: 700, margin: '3px 0 0 0' }}>
                Vous avez {acceptedFriendsList.length} ami{acceptedFriendsList.length > 1 ? 's' : ''}.
              </p>
            </div>
          </div>

          {acceptedFriendsList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
              <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Aucun ami pour le moment
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Acceptez des demandes ou ajoutez des personnes suggérées pour faire grandir votre réseau.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {acceptedFriendsList.map((friend) => {
                const mutuals = getMutualFriends(friend);
                return (
                  <div
                    key={friend.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          backgroundColor: '#EDE9FE',
                          color: '#5B21B6',
                          fontWeight: 800,
                          fontSize: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #DDD6FE',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt={friend.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          friend.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {friend.name}
                        </h4>
                        <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>📍 {friend.city}</span>
                          {mutuals.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedMutualUser(friend)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#5B21B6',
                                fontWeight: 800,
                                fontSize: '12.5px',
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline',
                              }}
                            >
                              • {mutuals.length} ami(s) en commun
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenMessage(friend.id, friend.name)}
                        style={{
                          minHeight: '40px',
                          padding: '0 18px',
                          backgroundColor: '#F5F3FF',
                          color: '#5B21B6',
                          border: '1px solid #DDD6FE',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(91, 33, 182, 0.08)',
                        }}
                      >
                        <span>💬 Message</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* UNIVERSAL MUTUAL FRIENDS MODAL OVERLAY */}
      {selectedMutualUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
          }}
          onClick={() => setSelectedMutualUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Amis en commun ({getMutualFriends(selectedMutualUser).length})
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Personnes qui sont amis à la fois avec vous et {selectedMutualUser.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMutualUser(null)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  fontSize: '16px',
                  color: '#64748B',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
              {getMutualFriends(selectedMutualUser).map((mf) => (
                <div
                  key={mf.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#EDE9FE',
                        color: '#5B21B6',
                        fontWeight: 800,
                        fontSize: '17px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid #DDD6FE',
                      }}
                    >
                      {mf.avatarUrl ? (
                        <img src={mf.avatarUrl} alt={mf.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        mf.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>{mf.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>📍 {mf.city}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMutualUser(null);
                      onOpenMessage(mf.id, mf.name);
                    }}
                    style={{
                      minHeight: '36px',
                      padding: '0 14px',
                      backgroundColor: '#F5F3FF',
                      color: '#5B21B6',
                      border: '1px solid #DDD6FE',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    💬 Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
