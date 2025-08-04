"use client";

import React, { useState } from 'react';
import VesselsFilters from './VesselsFilters';

interface VesselsActionsProps {
  onAddFilter: (filter: string) => void;
  onSearch: (query: string) => void;
}

const VesselsActions: React.FC<VesselsActionsProps> = ({ onAddFilter, onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="flex items-center space-x-4 mb-6 relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600"
      >
        Add Filter
      </button>
      {showFilters && <VesselsFilters onAddFilter={onAddFilter} onClose={() => setShowFilters(false)} />}
      <input
        type="text"
        placeholder="Quick Search (e.g. Name, MMSI, IMO, Callsign)"
        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default VesselsActions;