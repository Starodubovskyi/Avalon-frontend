"use client";

import { X, Search } from "lucide-react";
import type { VesselCall } from "./mockPortCalls";
import { useState } from "react";

type Props = {
  q: string;
  setQ: (v: string) => void;
  status: Set<VesselCall["status"]>;
  toggleStatus: (s: VesselCall["status"]) => void;
  types: Set<VesselCall["vesselType"]>;
  toggleType: (t: VesselCall["vesselType"]) => void;
  clearFilters: () => void;
};

export default function DetailFilters({
  q,
  setQ,
  status,
  toggleStatus,
  types,
  toggleType,
  clearFilters,
}: Props) {
  const [open, setOpen] = useState(false);

  const S = (s: VesselCall["status"]) => (
    <Chip key={s} active={status.has(s)} onClick={() => toggleStatus(s)}>
      {s}
    </Chip>
  );
  const T = (t: VesselCall["vesselType"]) => (
    <Chip key={t} active={types.has(t)} onClick={() => toggleType(t)}>
      {t}
    </Chip>
  );

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm ring-1 ring-transparent transition focus-within:ring-emerald-500/40 dark:border-neutral-700 dark:bg-neutral-850">
        <Search className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          placeholder="Search vessels, IMO/MMSI, cargo, route…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => setQ("")}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {S("In Port")}
        {S("At Anchor")}
        {S("Inbound")}
        {S("Outbound")}
        <span className="mx-2 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
        {T("Tanker")}
        {T("Bulk")}
        {T("Container")}
        {T("General")}
        {T("LNG")}
        {T("LPG")}
        {q || status.size || types.size ? (
          <button
            onClick={clearFilters}
            className="ml-2 text-xs text-neutral-500 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
