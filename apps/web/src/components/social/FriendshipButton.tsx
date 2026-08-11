'use client';

import React from 'react';

export interface FriendshipButtonProps {
  status?: 'NONE' | 'PENDING' | 'ACCEPTED';
  onAction: () => void;
}

export const FriendshipButton: React.FC<FriendshipButtonProps> = ({ status = 'NONE', onAction }) => {
  if (status === 'ACCEPTED') {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-default"
      >
        ✓ Amis
      </button>
    );
  }

  if (status === 'PENDING') {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-default"
      >
        ⏳ Demande envoyée
      </button>
    );
  }

  return (
    <button
      onClick={onAction}
      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
    >
      + Ajouter en ami
    </button>
  );
};
