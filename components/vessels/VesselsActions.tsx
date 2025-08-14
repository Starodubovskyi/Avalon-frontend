"use client";

import React, { useState } from "react";
import VesselsFilters from "./VesselsFilters";
import { SlidersHorizontal, RefreshCw, Search } from "lucide-react";

interface VesselsActionsProps {
  onAddFilter: (filter: string) => void;
  onSearch: (query: string) => void;
  className?: string;
}

const VesselsActions: React.FC<VesselsActionsProps> = ({
  onAddFilter,
  onSearch,
  className,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");

  return (
    <div className={className}>
      <div className="flex gap-2 sm:gap-4 items-stretch sm:items-center">
        <button
          onClick={() => setShowFilters(true)}
          className="px-3 py-2 sm:px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm inline-flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden xs:inline">Add filter</span>
        </button>

        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search: Name, MMSI, IMO, Callsign"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <button
          onClick={() => onSearch(q)}
          className="px-3 py-2 sm:px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {showFilters && (
        <VesselsFilters
          onAddFilter={onAddFilter}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default VesselsActions;
