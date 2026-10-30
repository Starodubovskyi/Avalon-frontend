"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META, isPositionStale, isUnpaidAfterDeparture, pendingCount } from "@/lib/vessels/status";
import { resolvePosition } from "@/lib/vessels/geo";
import { fmtRelative } from "@/lib/vessels/format";
import { DESTINATION_LABEL, type VesselView } from "@/lib/vessels/types";
import { TextInput } from "../ui/primitives";

export function MapVesselList({
  vessels,
  selectedId,
  onSelect,
  query,
  onQuery,
}: {
  vessels: VesselView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Find vessel or IMO" className="h-9 pl-9" aria-label="Find vessel" />
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {vessels.length === 0 ? <li className="px-3 py-8 text-center text-sm text-muted-foreground">No vessels to show</li> : null}
        {vessels.map((v) => {
          const pos = resolvePosition(v);
          const unpaid = isUnpaidAfterDeparture(v);
          const open = pendingCount(v);
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onSelect(v.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  selectedId === v.id ? "bg-primary/10 ring-1 ring-primary/40" : "hover:bg-accent",
                )}
              >
                <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", unpaid ? "bg-stage-unpaid" : STAGE_META[v.stage].dot)} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{v.name}</span>
                    {!v.restricted && open > 0 && v.stage !== "departed" ? (
                      <span className="shrink-0 rounded-full bg-bad/10 px-1.5 text-[10px] font-semibold text-bad" title={`${open} open checklist items`}>
                        {open} open
                      </span>
                    ) : null}
                    {unpaid ? <span className="shrink-0 rounded-full bg-stage-unpaid/15 px-1.5 text-[10px] font-semibold text-stage-unpaid">unpaid</span> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {STAGE_META[v.stage].label} → {DESTINATION_LABEL[v.destination]}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {pos.estimated ? "≈ estimated position" : `${v.positionSource === "ais" ? "AIS" : "manual"} · ${fmtRelative(v.positionAt)}${isPositionStale(v) ? " · stale" : ""}`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
