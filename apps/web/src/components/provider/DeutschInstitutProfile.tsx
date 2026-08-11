'use client';

import React, { useState } from 'react';

export interface CampusItem {
  id: string;
  name: string;
  address: string;
  locationGeom: string;
  contactPhones: { label: string; number: string }[];
  openingHours: Record<string, string>;
  coursesAvailable: { levelCode: string; priceXAF?: number }[];
}

export interface CoursePriceItem {
  levelCode: string;
  name: string;
  priceXAF: number;
}

export interface DeutschInstitutProfileProps {
  id: string;
  displayName: string;
  shortBio: string;
  fullDescription: string;
  profilePicUrl?: string;
  coverPicUrl?: string;
  yearFounded?: number;
  campuses?: CampusItem[];
  coursesPrices?: CoursePriceItem[];
  followerCount?: number;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  onContactClick?: () => void;
}

export const DeutschInstitutProfile: React.FC<DeutschInstitutProfileProps> = ({
  displayName,
  shortBio,
  fullDescription,
  profilePicUrl,
  coverPicUrl,
  yearFounded,
  campuses = [],
  coursesPrices = [
    { levelCode: 'A1', name: 'Allemand Éléments A1', priceXAF: 50000 },
    { levelCode: 'A2', name: 'Allemand Intermédiaire A2', priceXAF: 60000 },
    { levelCode: 'B1', name: 'Allemand Avancé B1', priceXAF: 75000 },
    { levelCode: 'B2', name: 'Allemand Autonome B2', priceXAF: 90000 },
  ],
  followerCount = 0,
  isFollowing = false,
  onFollowToggle,
  onContactClick,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'campuses'>('info');
  const [following, setFollowing] = useState(isFollowing);
  const [count, setCount] = useState(followerCount);
  const [selectedCampus, setSelectedCampus] = useState<CampusItem | null>(campuses[0] || null);

  const handleFollow = () => {
    setFollowing(!following);
    setCount(following ? count - 1 : count + 1);
    if (onFollowToggle) onFollowToggle();
  };

  return (
    <div className="relative max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      {/* Institution Cover Banner */}
      <div className="h-56 md:h-72 w-full bg-gradient-to-r from-red-700 via-yellow-600 to-amber-700 relative">
        {coverPicUrl && (
          <img src={coverPicUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-white tracking-wide">
          DEUTSCH INSTITUT
        </div>
      </div>

      {/* Profile Header Logo & Identity */}
      <div className="px-6 md:px-8 pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-20 sm:-mt-24 mb-6 gap-4">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full ring-4 ring-white dark:ring-gray-900 overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-red-600 text-white text-4xl font-extrabold">
                {displayName.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFollow}
              className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-sm ${
                following
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200 dark:shadow-none'
              }`}
            >
              {following ? 'Abonné' : 'Suivre la structure'} ({count})
            </button>
            <button
              onClick={onContactClick}
              className="px-6 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contacter l'Institut
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {displayName}
        </h1>
        <p className="text-amber-600 dark:text-amber-400 font-medium text-sm mt-1">
          Centre Spécialisé d'Allemand {yearFounded ? `• Fondé en ${yearFounded}` : ''}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed max-w-3xl">
          {shortBio}
        </p>

        {/* Section Navigation Tabs */}
        <div className="mt-8 border-b border-gray-100 dark:border-gray-800 flex gap-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'info'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Informations Publiques
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'courses'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Cours & Tarifs
          </button>
          <button
            onClick={() => setActiveTab('campuses')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'campuses'
                ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Nos Campus ({campuses.length})
          </button>
        </div>

        {/* Tab Content 1: Public Information */}
        {activeTab === 'info' && (
          <div className="py-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Présentation de l'établissement</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {fullDescription}
            </p>
          </div>
        )}

        {/* Tab Content 2: Courses & Prices */}
        {activeTab === 'courses' && (
          <div className="py-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Programme des cours et tarifs (XAF)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coursesPrices.map((course, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold mr-2">
                      {course.levelCode}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.name}</span>
                  </div>
                  <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                    {course.priceXAF.toLocaleString()} XAF
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Horizontal Campuses List */}
        {activeTab === 'campuses' && (
          <div className="py-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Nos implantations et campus</h3>

            {campuses.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-2xl text-gray-500 text-sm">
                Aucun campus spécifique configuré pour le moment.
              </div>
            ) : (
              <div>
                {/* Horizontal Campus Selector */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-4">
                  {campuses.map((campus) => (
                    <button
                      key={campus.id}
                      onClick={() => setSelectedCampus(campus)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                        selectedCampus?.id === campus.id
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      📍 {campus.name}
                    </button>
                  ))}
                </div>

                {/* Active Campus Details */}
                {selectedCampus && (
                  <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-gray-800/80 border border-amber-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">{selectedCampus.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{selectedCampus.address}</p>

                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">Contacts Téléphoniques Campus:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampus.contactPhones?.map((phone, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white dark:bg-gray-900 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {phone.label}: {phone.number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Quick Contact Button */}
      <button
        onClick={onContactClick}
        aria-label="Contacter l'institut"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-sm font-semibold pr-1">Contacter l'Institut</span>
      </button>
    </div>
  );
};
