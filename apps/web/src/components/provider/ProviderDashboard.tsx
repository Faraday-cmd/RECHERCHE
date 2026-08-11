'use client';

import React, { useState } from 'react';

export interface RoleDashboardItem {
  userRoleId: string;
  roleCode: 'LEHRER' | 'BETREUER' | 'VISA_COMPANION' | 'DEUTSCH_INSTITUT';
  roleName: string;
  status: string;
  isConfigured: boolean;
  publicationStatus: 'DRAFT' | 'CONFIGURED' | 'PUBLISHED' | 'UNPUBLISHED';
}

export interface ProviderDashboardProps {
  unlockedRoles: RoleDashboardItem[];
  activeRole: RoleDashboardItem;
  onSelectRole: (roleId: string) => void;
  onTogglePublish?: (publish: boolean) => void;
  onEditProfile?: () => void;
  stats?: {
    followers: number;
    infosPublished: number;
    coursesPublished: number;
    ratingsReceived: number;
  };
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  unlockedRoles,
  activeRole,
  onSelectRole,
  onTogglePublish,
  onEditProfile,
  stats = { followers: 0, infosPublished: 0, coursesPublished: 0, ratingsReceived: 0 },
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'infos' | 'courses' | 'settings'>('overview');

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Role Switcher Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Espace Prestataire Dédié
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            Tableau de Bord — {activeRole.roleName}
          </h1>
        </div>

        {/* Role Switcher Dropdown / Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {unlockedRoles.map((role) => (
            <button
              key={role.userRoleId}
              onClick={() => onSelectRole(role.userRoleId)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeRole.userRoleId === role.userRoleId
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${role.publicationStatus === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {role.roleName}
            </button>
          ))}
        </div>
      </div>

      {/* Unconfigured Profile Banner Warning */}
      {!activeRole.isConfigured && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Configuration de profil requise
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                Accès débloqué. Complétez la configuration de votre profil pour le rendre publiable.
              </p>
            </div>
          </div>
          <button
            onClick={onEditProfile}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all whitespace-nowrap"
          >
            Configurer le profil
          </button>
        </div>
      )}

      {/* Profile Publication State Toggle Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Statut de Publication:</span>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
              activeRole.publicationStatus === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {activeRole.publicationStatus === 'PUBLISHED' ? 'EN LIGNE (PUBLIÉ)' : 'HORS LIGNE (BROUILLON)'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Seuls les profils configurés et publiés apparaissent dans la recherche publique.
          </p>
        </div>

        {activeRole.isConfigured && (
          <button
            onClick={() => onTogglePublish?.(activeRole.publicationStatus !== 'PUBLISHED')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeRole.publicationStatus === 'PUBLISHED'
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none'
            }`}
          >
            {activeRole.publicationStatus === 'PUBLISHED' ? 'Masquer du public' : 'Publier mon profil'}
          </button>
        )}
      </div>

      {/* Role-Isolated Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Abonnés</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.followers}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Infos Publiées</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.infosPublished}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cours Actifs</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.coursesPublished}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avis Reçus</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.ratingsReceived}</div>
        </div>
      </div>
    </div>
  );
};
