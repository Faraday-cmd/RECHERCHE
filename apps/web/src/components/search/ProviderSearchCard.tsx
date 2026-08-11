'use client';

import React from 'react';

export interface ProviderSearchResult {
  id: string;
  roleCode: string;
  roleName: string;
  displayName: string;
  shortBio: string;
  profilePicUrl?: string;
  distanceKm?: number;
  nearestCampusName?: string;
  followerCount: number;
  ratingCount: number;
}

export const ProviderSearchCard: React.FC<{ provider: ProviderSearchResult; onClick?: () => void }> = ({
  provider,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
          {provider.profilePicUrl ? (
            <img src={provider.profilePicUrl} alt={provider.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xl">
              {provider.displayName.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{provider.displayName}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              {provider.roleName}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{provider.shortBio}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {provider.distanceKm !== undefined && (
              <span>📍 {provider.distanceKm} km {provider.nearestCampusName ? `(${provider.nearestCampusName})` : ''}</span>
            )}
            <span>👥 {provider.followerCount} abonnés</span>
          </div>
        </div>
      </div>

      <button className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors">
        Voir Profil
      </button>
    </div>
  );
};
