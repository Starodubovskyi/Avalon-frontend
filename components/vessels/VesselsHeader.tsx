import React from 'react';

const VesselsHeader: React.FC = () => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vessels</h1>
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out">
      Export All Data
    </button>
  </div>
);

export default VesselsHeader;
