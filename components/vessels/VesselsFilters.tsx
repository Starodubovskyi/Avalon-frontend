"use client";

import React from "react";
import { X } from "lucide-react";

type Filters = Record<string, string>;

const filterKeyMap: Record<string, string> = {
  Flag: "flag",
  "My Fleets": "fleets",
  IMO: "imo",
  ENI: "eni",
  "Vessel Name": "name",
  "Ship Type": "vesselType",
  Status: "status",
  "Build Year": "buildYear",
  Length: "length",
  Beam: "beam",
  Deadweight: "deadweight",
  "Gross Tonnage": "grossTonnage",
  "Net Tonnage": "netTonnage",
  Callsign: "callsign",
  "Destination Port": "destinationPort",
  "Current Port": "currentPort",
  "Last Port": "lastPort",
  "Reported ETA": "reportedETA",
  // новые
  "Map Icon": "mapIcon",
  "Latest Position Time": "latestPositionTime",
  Latitude: "latitude",
  Longitude: "longitude",
  "My Notes": "myNotes",
};

export default function VesselsFilters({
  filters,
  onChange,
  onRemove,
  className,
}: {
  filters: Filters;
  onChange: (key: string, value: string) => void;
  onRemove: (key: string) => void;
  className?: string;
}) {
  const renderFilterName = (key: string) =>
    Object.keys(filterKeyMap).find((name) => filterKeyMap[name] === key) || key;

  const entries = Object.entries(filters);

  if (!entries.length) return null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 ${
        className || ""
      }`}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
            {renderFilterName(key)}:
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder="Value"
            className="w-full bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={() => onRemove(key)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Remove filter"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
