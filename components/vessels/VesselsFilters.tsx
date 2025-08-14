"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface VesselsFiltersProps {
  onAddFilter: (filter: string) => void;
  onClose: () => void;
}

const VesselsFilters: React.FC<VesselsFiltersProps> = ({
  onAddFilter,
  onClose,
}) => {
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

  const [maxHeight, setMaxHeight] = useState<Record<string, number>>({
    popular: 0,
    basic: 0,
    particulars: 0,
    voyageData: 0,
  });

  useEffect(() => {
    const setH = (k: keyof typeof openSections, el: HTMLUListElement | null) =>
      setMaxHeight((p) => ({
        ...p,
        [k]: openSections[k] && el ? el.scrollHeight : 0,
      }));
    setH("popular", popularRef.current);
    setH("basic", basicRef.current);
    setH("particulars", particularsRef.current);
    setH("voyageData", voyageDataRef.current);
  }, [openSections]);

  const toggleSection = (section: string) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const filters = {
    popular: {
      items: ["Flag", "My Fleets", "IMO", "ENI", "Vessel Name"],
      ref: popularRef,
    },
    basic: {
      items: ["Status", "Ship Type", "Build Year", "Length", "Beam"],
      ref: basicRef,
    },
    particulars: {
      items: ["Deadweight", "Gross Tonnage", "Net Tonnage", "Callsign"],
      ref: particularsRef,
    },
    voyageData: {
      items: ["Destination Port", "Current Port", "Last Port", "Reported ETA"],
      ref: voyageDataRef,
    },
  };

  return (
    <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:z-10">
      <div
        className="sm:hidden absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute left-0 right-0 sm:left-auto sm:right-auto sm:w-72 bottom-0 sm:bottom-auto sm:top-full sm:mt-2 bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[70vh] sm:max-h-[320px] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-900 dark:text-white font-bold">
            Add filter
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 sm:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {Object.entries(filters).map(([section, { items, ref }]) => (
            <div key={section}>
              <button
                onClick={() => toggleSection(section)}
                className="flex justify-between items-center w-full py-2 font-medium capitalize"
              >
                {section}
                {openSections[section] ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              <ul
                ref={ref as React.RefObject<HTMLUListElement>}
                style={{ maxHeight: maxHeight[section] || 0 }}
                className="pl-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out"
              >
                {items.map((item) => (
                  <li
                    key={item}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    onClick={() => {
                      onAddFilter(item);
                      onClose();
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VesselsFilters;
