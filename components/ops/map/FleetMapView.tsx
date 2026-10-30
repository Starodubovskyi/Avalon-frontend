"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Layers, List, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels } from "@/lib/vessels/hooks";
import { STAGE_META, compareVessels, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { STAGES } from "@/lib/vessels/types";
import { ErrorBlock } from "../ui/primitives";
import { MapVesselList } from "./MapVesselList";
import { MapVesselCard } from "./MapVesselCard";

const FleetMap = dynamic(() => import("./FleetMap").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-muted" />,
});

export function FleetMapView() {
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, mutate } = useVessels("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showDeparted, setShowDeparted] = useState(false);
  const [showSeamarks, setShowSeamarks] = useState(true);
  const [listOpen, setListOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((v) => showDeparted || v.stage !== "departed" || isUnpaidAfterDeparture(v))
      .filter((v) => !q || v.name.toLowerCase().includes(q) || (v.imo ?? "").includes(q))
      .sort(compareVessels);
  }, [data, query, showDeparted]);

  const selected = visible.find((v) => v.id === selectedId) ?? null;
  const inWork = (data ?? []).filter((v) => v.stage !== "departed").length;

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id) setListOpen(false);
  };

  return (
    <div className="relative flex min-h-0 flex-1">
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-20 w-[300px] max-w-[85vw] border-r bg-card/95 backdrop-blur transition-[transform,visibility] md:visible md:static md:translate-x-0",
          listOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Vessels in work</p>
            <p className="text-xs text-muted-foreground">{inWork} active · {visible.length} on map</p>
          </div>
          <Ship className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="h-[calc(100%-61px)]">
          <MapVesselList vessels={visible} selectedId={selectedId} onSelect={select} query={query} onQuery={setQuery} />
        </div>
      </aside>

      <div className="relative min-h-0 flex-1">
        <FleetMap vessels={visible} selectedId={selectedId} onSelect={select} showSeamarks={showSeamarks} />

        <button
          type="button"
          onClick={() => setListOpen((o) => !o)}
          className="absolute left-3 top-3 z-10 flex h-10 items-center gap-2 rounded-lg border bg-card/95 px-3 text-sm font-medium shadow md:hidden"
        >
          <List className="h-4 w-4" /> Vessels ({visible.length})
        </button>

        {error ? (
          <div className="absolute left-3 right-3 top-16 z-10 md:left-auto md:w-80">
            <ErrorBlock error={error} onRetry={() => void mutate()} />
          </div>
        ) : null}

        <div className="absolute bottom-8 left-3 z-10 w-[220px] rounded-xl border bg-card/95 p-3 text-xs shadow-lg backdrop-blur">
          <p className="mb-2 flex items-center gap-1.5 font-semibold"><Layers className="h-3.5 w-3.5" /> Legend</p>
          <ul className="space-y-1">
            {STAGES.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_META[s].dot)} /> {STAGE_META[s].label}
              </li>
            ))}
            {staff ? (
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-stage-unpaid" /> Sailed unpaid
              </li>
            ) : null}
          </ul>
          <p className="mt-2 text-muted-foreground">▲ under way · ● stopped · ◇ estimated</p>
          <div className="mt-2 space-y-1.5 border-t pt-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showDeparted} onChange={(e) => setShowDeparted(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              Show departed
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={showSeamarks} onChange={(e) => setShowSeamarks(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              Sea marks (OpenSeaMap)
            </label>
          </div>
        </div>

        {selected ? (
          <div className="absolute inset-x-0 bottom-0 z-20 max-h-[70%] overflow-y-auto rounded-t-2xl border bg-card shadow-2xl md:inset-x-auto md:bottom-auto md:right-3 md:top-14 md:max-h-[calc(100%-5rem)] md:w-[340px] md:rounded-xl">
            <MapVesselCard vessel={selected} editable={staff} onClose={() => setSelectedId(null)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
