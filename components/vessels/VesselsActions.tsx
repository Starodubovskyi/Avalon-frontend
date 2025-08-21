"use client";

import React, { useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VesselsActions({
  onAddFilter,
  onSearch,
  className,
}: {
  onAddFilter: (filterName: string) => void;
  onSearch: (q: string) => void;
  className?: string;
}) {
  const [q, setQ] = useState("");

  const baseFilters = [
    "Flag",
    "My Fleets",
    "IMO",
    "ENI",
    "Vessel Name",
    "Ship Type",
    "Status",
    "Build Year",
    "Length",
    "Beam",
    "Deadweight",
    "Gross Tonnage",
    "Net Tonnage",
    "Callsign",
    "Destination Port",
    "Current Port",
    "Last Port",
    "Reported ETA",
  ];

  const newFilters = [
    "Map Icon",
    "Latest Position Time",
    "Latitude",
    "Longitude",
    "My Notes",
  ];

  const allFilters = [...baseFilters, ...newFilters];

  const handleAdd = (name: string) => onAddFilter(name);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center ${
        className || ""
      }`}
    >
      <form onSubmit={submitSearch} className="flex-1">
        <div className="flex items-center gap-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2">
          <IconSearch
            size={18}
            className="text-gray-500 dark:text-gray-400 shrink-0"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search vessels..."
            className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </form>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 hover:bg-gray-50 dark:hover:bg-white/10 transition"
            aria-label="Add filter"
          >
            <IconPlus size={18} />
            <span className="text-sm">Add filter</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[60vh] overflow-auto w-64"
        >
          {allFilters.map((f) => (
            <DropdownMenuItem key={f} onClick={() => handleAdd(f)}>
              {f}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
