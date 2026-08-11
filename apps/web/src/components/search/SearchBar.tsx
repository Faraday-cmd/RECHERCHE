'use client';

import React, { useState } from 'react';

export interface SearchBarProps {
  onSearch: (query: string, roleCode?: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, selectedRole || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un professeur, cours B2, visa companion, institut..."
          className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Tous les prestataires</option>
        <option value="LEHRER">Lehrer (Enseignant)</option>
        <option value="BETREUER">Betreuer (Accompagnateur)</option>
        <option value="VISA_COMPANION">Visa Companion</option>
        <option value="DEUTSCH_INSTITUT">Deutsch Institut</option>
      </select>

      <button
        type="submit"
        className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-none"
      >
        Rechercher
      </button>
    </form>
  );
};
