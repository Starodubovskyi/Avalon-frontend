"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VesselsFiltersProps {
  onAddFilter: (filter: string) => void;
  onClose: () => void;
}

const VesselsFilters: React.FC<VesselsFiltersProps> = ({ onAddFilter, onClose }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    popular: true,
    basic: false,
    particulars: false,
    voyageData: false,
  });

  const popularRef = useRef<HTMLUListElement>(null);
  const basicRef = useRef<HTMLUListElement>(null);
  const particularsRef = useRef<HTMLUListElement>(null);
  const voyageDataRef = useRef<HTMLUListElement>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [maxHeight, setMaxHeight] = useState<Record<string, number>>({
    popular: 0,
    basic: 0,
    particulars: 0,
    voyageData: 0,
  });

  useEffect(() => {
    if (popularRef.current) {
      setMaxHeight(prev => ({ ...prev, popular: openSections.popular ? popularRef.current!.scrollHeight : 0 }));
    }
    if (basicRef.current) {
      setMaxHeight(prev => ({ ...prev, basic: openSections.basic ? basicRef.current!.scrollHeight : 0 }));
    }
    if (particularsRef.current) {
      setMaxHeight(prev => ({ ...prev, particulars: openSections.particulars ? particularsRef.current!.scrollHeight : 0 }));
    }
    if (voyageDataRef.current) {
      setMaxHeight(prev => ({ ...prev, voyageData: openSections.voyageData ? voyageDataRef.current!.scrollHeight : 0 }));
    }
  }, [openSections]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filters = {
    popular: { items: ['Flag', 'My Fleets', 'IMO', 'ENI', 'Vessel Name'], ref: popularRef },
    basic: { items: ['Status', 'Ship Type', 'Build Year', 'Length', 'Beam'], ref: basicRef },
    particulars: { items: ['Deadweight', 'Gross Tonnage', 'Net Tonnage', 'Callsign'], ref: particularsRef },
    voyageData: { items: ['Destination Port', 'Current Port', 'Last Port', 'Reported ETA'], ref: voyageDataRef },
  };

  return (
    <div 
      ref={wrapperRef}
      className="absolute z-10 mt-2 w-72 max-h-[300px] overflow-y-auto bg-white dark:bg-[#1a233b] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="text-gray-900 dark:text-white font-bold mb-2">Add filter</div>
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {Object.entries(filters).map(([section, { items, ref }]) => (
          <div key={section}>
            <button
              onClick={() => toggleSection(section)}
              className="flex justify-between items-center w-full py-2 font-medium capitalize"
            >
              {section}
              {openSections[section] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <ul
              ref={ref as React.RefObject<HTMLUListElement>}
              style={{ maxHeight: maxHeight[section] || 0 }}
              className="pl-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out"
            >
              {items.map((item) => (
                <li key={item} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded" onClick={() => { onAddFilter(item); onClose(); }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VesselsFilters;