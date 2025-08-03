import React from 'react';

const VesselsTabs: React.FC = () => (
  <div className="flex space-x-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
    {['Vessels', 'Position history', 'Voyage timeline', 'Events', 'Position history & Weather', 'My Notes', 'Areas of Interest'].map((tab) => (
      <button key={tab} className={`pb-2 text-sm font-medium whitespace-nowrap ${tab === 'Vessels' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {tab}
      </button>
    ))}
  </div>
);

export default VesselsTabs;
