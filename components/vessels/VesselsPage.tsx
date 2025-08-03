"use client";

import React, { useState } from 'react';
import VesselsHeader from './VesselsHeader';
import VesselsTabs from './VesselsTabs';
import VesselsActions from './VesselsActions';
import VesselsTable from './VesselsTable';
import { X } from 'lucide-react';

const filterKeyMap: Record<string, string> = {
  'Flag': 'flag',
  'My Fleets': 'fleets',
  'IMO': 'imo',
  'ENI': 'eni',
  'Vessel Name': 'name',
  'Ship Type': 'vesselType',
  
};

const VesselsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleAddFilter = (filterName: string) => {
    const key = filterKeyMap[filterName] || filterName.toLowerCase().replace(/\s/g, '');
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key] || '',
    }));
  };

  const handleUpdateFilterValue = (key: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRemoveFilter = (key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const renderFilterName = (key: string) => {
    const filterName = Object.keys(filterKeyMap).find(name => filterKeyMap[name] === key);
    return filterName || key;
  };

  return (
    <div className="flex-1 p-8 dark:bg-[#0f172a]">
      <VesselsHeader />
      <VesselsTabs />
      <VesselsActions onAddFilter={handleAddFilter} onSearch={setSearchQuery} />
      
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center space-x-4 mb-6 flex-wrap">
          {Object.entries(activeFilters).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{renderFilterName(key)}:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleUpdateFilterValue(key, e.target.value)}
                placeholder="Enter value"
                className="w-32 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              <button onClick={() => handleRemoveFilter(key)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <VesselsTable filters={activeFilters} searchQuery={searchQuery} />
    </div>
  );
};

export default VesselsPage;