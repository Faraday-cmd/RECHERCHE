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
    <div className="w-full sm:w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-bold text-gray-900 dark:text-white text-base">Messages</h2>
        {activeRoleContextName && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
            Boîte de réception: {activeRoleContextName}
          </p>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/40">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">
            Aucune conversation pour le moment.
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`p-4 transition-colors cursor-pointer flex items-center gap-3 ${
                selectedId === conv.id
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                {conv.recipientName.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {conv.recipientName}
                  </h4>
                  {conv.recipientRole && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {conv.recipientRole}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {conv.lastMessage || 'Nouvelle conversation'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
