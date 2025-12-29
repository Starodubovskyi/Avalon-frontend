"use client";

import React, { useMemo, useState } from "react";
import PortsTabs, { PortsTabKey } from "./PortsTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconSearch, IconPlus } from "@tabler/icons-react"; // Optional: assuming you have icons or use standard svgs

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ports
          </h1>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse" />
            Live list
          </span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white font-medium shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
        >
          <span>Add Port</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0 flex-1 overflow-hidden">
          <PortsTabs value={tab} onChange={onTabChange} />
        </div>
        <div className="hidden sm:flex items-center gap-2 pb-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 shadow-sm">
            Total: {total}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 shadow-sm">
            Filters: {filtersCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="w-full sm:flex-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
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
            className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 hover:bg-gray-50 dark:hover:bg-white/10 transition text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                <span className="text-lg leading-none font-light">+</span>
                Add filter
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl bg-white dark:bg-[#151515]"
            >
              <form onSubmit={submitFilter} className="space-y-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Add new filter
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={fKey}
                    onChange={(e) => setFKey(e.target.value as FilterKey)}
                    className="w-full p-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                    placeholder="Value..."
                    className="w-full p-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/15 bg-white dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters();
                      setOpen(false);
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition"
                  >
                    Clear all
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium shadow-sm transition"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

          {selected > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
            >
              Delete selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
