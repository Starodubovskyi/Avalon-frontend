"use client";

import { X, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiquidStore } from "./state";

type Chip = {
  key: string;
  label: string;
  color: "emerald" | "amber" | "rose" | "sky";
};

export function LiquidSearch({ chips }: { chips?: Chip[] }) {
  const { vessels, filters, setFilters, clearFilters } = useLiquidStore();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    window.addEventListener("focus-liquid-search" as any, focus);
    return () =>
      window.removeEventListener("focus-liquid-search" as any, focus);
  }, []);

  const suggestions = useMemo(() => {
    const q = (filters.q || "").trim().toLowerCase();
    if (!q) return [] as string[];
    const pool = new Set<string>();
    (vessels || []).forEach((v: any) => {
      [
        v.name,
        v.vesselType,
        v.destinationPort,
        v.reportedDestination,
        v.currentPort,
        v?.cargo?.grade,
        v.flag,
        v.imo,
      ]
        .filter(Boolean)
        .forEach((val: string) => pool.add(String(val)));
    });
    return Array.from(pool)
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 8);
  }, [vessels, filters.q]);

  const hasFilters = useMemo(
    () =>
      Boolean(filters.q?.trim()) ||
      (filters.subTypes?.length ?? 0) > 0 ||
      Boolean(filters.onlyWatchlist),
    [filters]
  );

  const toggleSub = (key: string) => {
    const cur = filters.subTypes || [];
    const next = cur.includes(key)
      ? cur.filter((k) => k !== key)
      : [...cur, key];
    setFilters({ subTypes: next });
  };

  const SUBS = chips ?? [
    { key: "lng", label: "LNG", color: "emerald" as const },
    { key: "lpg", label: "LPG", color: "amber" as const },
    { key: "products", label: "Products", color: "rose" as const },
    { key: "bitumen", label: "Bitumen", color: "sky" as const },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm ring-1 ring-transparent transition focus-within:ring-emerald-500/40 dark:border-neutral-800 dark:bg-neutral-900">
        <Search className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        <input
          ref={inputRef}
          value={filters.q}
          onChange={(e) => {
            setFilters({ q: e.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search vessels, ports, cargo grades…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        {filters.q ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setFilters({ q: "" })}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setFilters({ q: s });
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {SUBS.map((s) => (
          <FilterChip
            key={s.key}
            active={filters.subTypes?.includes(s.key)}
            onClick={() => toggleSub(s.key)}
            color={s.color}
          >
            {s.label}
          </FilterChip>
        ))}

        <button
          onClick={() => setFilters({ onlyWatchlist: !filters.onlyWatchlist })}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
            ${
              filters.onlyWatchlist
                ? "bg-yellow-500 text-white"
                : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            }`}
          title="Show only watchlisted"
        >
          <Star className="h-3.5 w-3.5" />
          Watchlist
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-neutral-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: "emerald" | "amber" | "rose" | "sky";
}) {
  const map = {
    emerald: active
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: active
      ? "bg-amber-600 text-white"
      : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    rose: active
      ? "bg-rose-600 text-white"
      : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    sky: active
      ? "bg-sky-600 text-white"
      : "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  } as const;

  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${map[color]}`}
    >
      {children}
    </button>
  );
}
