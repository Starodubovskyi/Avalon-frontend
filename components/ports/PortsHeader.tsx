"use client";

import React, { useMemo, useState } from "react";
import PortsTabs, { PortsTabKey } from "./PortsTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterKey =
  | "flag"
  | "portname"
  | "unlocode"
  | "photo"
  | "vessels_in_port"
  | "vessels_departures"
  | "vessels_arrivals"
  | "vessels_expected_arrivals"
  | "local_time"
  | "anchorage"
  | "geographical_area_one"
  | "geographical_area_two"
  | "coverage";

const FILTER_LABELS: Record<FilterKey, string> = {
  flag: "Flag",
  portname: "Port name",
  unlocode: "UNLOCODE",
  photo: "Photo",
  vessels_in_port: "Vessels in port",
  vessels_departures: "Departures",
  vessels_arrivals: "Arrivals",
  vessels_expected_arrivals: "Expected arrivals",
  local_time: "Local time",
  anchorage: "Anchorage",
  geographical_area_one: "Region 1",
  geographical_area_two: "Region 2",
  coverage: "Coverage",
};

export default function PortsHeader({
  tab,
  onTabChange,
  onAdd,
  onDeleteSelected,
  onSearch,
  total = 0,
  selected = 0,
  filters,
  onSetFilter,
  onClearFilters,
}: {
  tab: PortsTabKey;
  onTabChange: (t: PortsTabKey) => void;
  onAdd: () => void;
  onDeleteSelected: () => void;
  onSearch: (q: string) => void;
  total?: number;
  selected?: number;
  filters: Record<string, string>;
  onSetFilter: (key: FilterKey, value: string) => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [fKey, setFKey] = useState<FilterKey>("portname");
  const [fVal, setFVal] = useState("");
  const filtersCount = useMemo(
    () => Object.values(filters || {}).filter(Boolean).length,
    [filters]
  );

  const submitFilter = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fVal.trim()) return;
    onSetFilter(fKey, fVal.trim());
    setFVal("");
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Top row — title + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Ports
          </h1>
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-600/20 text-blue-800 dark:text-blue-300 ring-1 ring-inset ring-blue-400/30">
            Live list
          </span>
        </div>
        <button
          onClick={onAdd}
          className="px-3 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Port
        </button>
      </div>

      {/* Tabs row + badges */}
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <PortsTabs value={tab} onChange={onTabChange} />
        </div>
        <div className="hidden sm:flex items-center gap-2 pb-2">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 dark:bg-white/10 dark:text-white/80">
            Total: {total}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 dark:bg-white/10 dark:text-white/80">
            Filters: {filtersCount}
          </span>
        </div>
      </div>

      {/* Search + Filters + Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black/30 px-3 py-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="text-gray-400"
          >
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19L15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z"
            />
          </svg>
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search ports..."
            className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button className="px-3 py-2 rounded-2xl bg-gray-100 text-slate-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white transition flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                Add filter
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow bg-white dark:bg-[#151515]"
            >
              <form onSubmit={submitFilter} className="space-y-2">
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  Add filter
                </div>
                <div className="flex gap-2">
                  <select
                    value={fKey}
                    onChange={(e) => setFKey(e.target.value as FilterKey)}
                    className="w-28 p-2 rounded-xl text-sm border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-slate-900 dark:text-white"
                  >
                    {Object.entries(FILTER_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                  <input
                    value={fVal}
                    onChange={(e) => setFVal(e.target.value)}
                    placeholder="Value…"
                    className="flex-1 p-2 rounded-xl text-sm border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters();
                      setOpen(false);
                    }}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white"
                  >
                    Clear all
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

          {selected > 0 && (
            <button
              onClick={onDeleteSelected}
              className="px-3 py-2 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
