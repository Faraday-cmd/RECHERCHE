'use client';

import React, { useState } from 'react';

export interface IndividualProviderProfileProps {
  id: string;
  roleCode: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION';
  roleName: string;
  displayName: string;
  shortBio: string;
  fullDescription: string;
  profilePicUrl?: string;
  coverPicUrl?: string;
  phoneNumbers?: { label: string; number: string }[];
  fixedLocationGeom?: string;
  followerCount?: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
}

export const IndividualProviderProfile: React.FC<IndividualProviderProfileProps> = ({
  roleName,
  displayName,
  shortBio,
  fullDescription,
  profilePicUrl,
  coverPicUrl,
  phoneNumbers = [],
  followerCount = 0,
  isFollowing = false,
  onFollowToggle,
  onContactClick,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);

  const handleFollow = () => {
    setFollowing(!following);
    setCount(following ? count - 1 : count + 1);
    if (onFollowToggle) onFollowToggle();
  };

  return (
    <div className="relative max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
      {/* Cover Image Banner */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 relative">
        {coverPicUrl && (
          <img src={coverPicUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-medium">
          {roleName}
        </div>
      </div>

      {/* Profile Header Avatar & Controls */}
      <div className="px-6 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl ring-4 ring-white dark:ring-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                {displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleFollow}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                following
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
              }`}
            >
              {following ? 'Abonné(e)' : 'S\'abonner'} ({count})
            </button>
            <button
              onClick={onContactClick}
              className="px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contacter
            </button>
          </div>
        </div>

        {/* Identity & Short Tagline */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {displayName}
        </h1>
        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-0.5">
          Prestataire — {roleName}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed">
          {shortBio}
        </p>

        {/* Contact Phones */}
        {phoneNumbers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4">
            {phoneNumbers.map((phone, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg">
                <span className="text-gray-400">{phone.label}:</span>
                <span className="text-gray-900 dark:text-gray-200">{phone.number}</span>
              </div>
            ))}
          </div>
        )}

        {/* Full Bio Section */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
            À propos du prestataire
          </h2>
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {fullDescription}
          </div>
        </div>
      </div>

      {/* Floating Quick Contact Button */}
      <button
        onClick={onContactClick}
        aria-label="Contacter le prestataire"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-sm font-semibold pr-1">Contacter</span>
      </button>
    </div>
  );
};
