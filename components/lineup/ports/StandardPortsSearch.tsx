"use client";

import { X, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePortsStore } from "./state";
import { PORTS } from "./mockPorts";

export default function StandardPortsSearch() {
  const { q, setQ, status, toggleStatus, clearStatus } = usePortsStore();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    window.addEventListener("focus-ports-search" as any, focus);
    return () => window.removeEventListener("focus-ports-search" as any, focus);
  }, []);

  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [] as string[];
    const pool = new Set<string>();
    PORTS.forEach((p) => {
      [p.name, p.country, p.unlocode].forEach((v) => pool.add(v));
    });
    return Array.from(pool)
      .filter((v) => v.toLowerCase().includes(query))
      .slice(0, 8);
  }, [q]);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm ring-1 ring-transparent transition
                      focus-within:ring-emerald-500/40
                      dark:border-neutral-700 dark:bg-neutral-900"
      >
        <Search className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search ports, countries, UN/LOCODE…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setQ("")}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700
                       dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-lg
                        dark:border-neutral-700 dark:bg-neutral-900"
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ(s);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <FilterChip
          active={status?.has("Open")}
          onClick={() => toggleStatus("Open")}
          color="emerald"
        >
          Open
        </FilterChip>
        <FilterChip
          active={status?.has("Congested")}
          onClick={() => toggleStatus("Congested")}
          color="amber"
        >
          Congested
        </FilterChip>
        <FilterChip
          active={status?.has("Closed")}
          onClick={() => toggleStatus("Closed")}
          color="rose"
        >
          Closed
        </FilterChip>
        {status && status.size > 0 && (
          <button
            onClick={clearStatus}
            className="text-xs text-neutral-500 hover:underline dark:text-neutral-400"
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
  color: "emerald" | "amber" | "rose";
}) {
  const map = {
    emerald: active
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 dark:bg-neutral-800 dark:text-emerald-300",
    amber: active
      ? "bg-amber-600 text-white"
      : "bg-amber-50 text-amber-700 dark:bg-neutral-800 dark:text-amber-300",
    rose: active
      ? "bg-rose-600 text-white"
      : "bg-rose-50 text-rose-700 dark:bg-neutral-800 dark:text-rose-300",
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
