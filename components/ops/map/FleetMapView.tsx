"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { List, MapPinPlus, Ship, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import {
  POINT_KINDS,
  POINT_KIND_LABEL,
  pointTitle,
  useTeamPointMutations,
  useTeamPoints,
  type PointKind,
  type TeamPoint,
} from "@/lib/points/team-points";
import { ErrorBlock, btn } from "../ui/primitives";
import { MapVesselList } from "./MapVesselList";
import { MapVesselCard } from "./MapVesselCard";
import { MapPointList } from "./MapPointList";
import { MapPointCard } from "./MapPointCard";
import { PointFormDialog } from "./PointFormDialog";
import { MapLegend, MapLayerChips } from "./MapControls";
import { POINT_KIND_ICON } from "./PointKindIcon";
import type { LayerVisibility } from "./FleetMap";

const FleetMap = dynamic(() => import("./FleetMap").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-muted" />,
});

type Tab = "vessels" | "contacts";

export function FleetMapView() {
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, mutate } = useVessels("all");
  const { data: pointsData } = useTeamPoints();
  const { remove: removePoint } = useTeamPointMutations();

  const [tab, setTab] = useState<Tab>("vessels");
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pointQuery, setPointQuery] = useState("");
  const [showDeparted, setShowDeparted] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({
    vessels: true,
    seamarks: true,
    kinds: { company: true, person: true, employee: true },
  });
  const [listOpen, setListOpen] = useState(false);
  const [addKind, setAddKind] = useState<PointKind | null>(null);
  const [kindMenu, setKindMenu] = useState(false);
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPoint, setEditPoint] = useState<TeamPoint | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((v) => showDeparted || v.stage !== "departed" || isUnpaidAfterDeparture(v))
      .filter((v) => !q || v.name.toLowerCase().includes(q) || (v.imo ?? "").includes(q))
      .sort(compareVessels);
  }, [data, query, showDeparted]);

  const points = useMemo(() => {
    const q = pointQuery.trim().toLowerCase();
    return (pointsData ?? []).filter(
      (p) => layers.kinds[p.kind] && (!q || `${pointTitle(p)} ${p.activity}`.toLowerCase().includes(q)),
    );
  }, [pointsData, pointQuery, layers.kinds]);

  const selectedVessel = visible.find((v) => v.id === selectedVesselId) ?? null;
  const selectedPoint = (pointsData ?? []).find((p) => p.id === selectedPointId) ?? null;
  const inWork = (data ?? []).filter((v) => v.stage !== "departed").length;

  const selectVessel = (id: string | null) => {
    setSelectedVesselId(id);
    if (id) setListOpen(false);
  };
  const selectPoint = (id: string | null) => {
    setSelectedPointId(id);
    if (id) setListOpen(false);
  };

  function startAdd(kind: PointKind) {
    setKindMenu(false);
    setAddKind(kind);
    setDraft(null);
    setSelectedVesselId(null);
    setSelectedPointId(null);
    setLayers((l) => ({ ...l, kinds: { ...l.kinds, [kind]: true } }));
  }

  function cancelAdd() {
    setAddKind(null);
    setDraft(null);
  }

  async function deletePoint(p: TeamPoint) {
    if (!window.confirm(`Remove “${pointTitle(p)}” from the map?`)) return;
    try {
      await removePoint(p);
      setSelectedPointId(null);
    } catch {
      /* toast shown */
    }
  }

  const AddIcon = addKind ? POINT_KIND_ICON[addKind] : MapPinPlus;

  return (
    <div className="relative flex min-h-0 flex-1">
      <aside
        className={cn(
          "glass absolute inset-y-3 left-3 z-20 flex w-[320px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border shadow-elevated transition-[transform,visibility] md:visible md:translate-x-0",
          listOpen ? "visible translate-x-0" : "invisible -translate-x-[110%]",
        )}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <p className="font-display text-[15px] font-bold">Fleet & contacts</p>
            <p className="text-xs text-muted-foreground">
              {inWork} vessels in work{staff ? ` · ${(pointsData ?? []).length} points` : ""}
            </p>
          </div>
          <button type="button" onClick={() => setListOpen(false)} className={cn(btn.icon, "md:hidden")} aria-label="Close list">
            <X className="h-4 w-4" />
          </button>
        </div>
        {staff ? (
          <div className="mx-3 grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold" role="tablist">
            {(["vessels", "contacts"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 transition",
                  tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "vessels" ? <Ship className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {t === "vessels" ? `Vessels (${visible.length})` : `Contacts (${points.length})`}
              </button>
            ))}
          </div>
        ) : null}
        <div className="min-h-0 flex-1">
          {tab === "vessels" || !staff ? (
            <MapVesselList vessels={visible} selectedId={selectedVesselId} onSelect={(id) => { selectVessel(id); setSelectedPointId(null); }} query={query} onQuery={setQuery} />
          ) : (
            <MapPointList points={points} selectedId={selectedPointId} onSelect={(id) => { selectPoint(id); setSelectedVesselId(null); }} query={pointQuery} onQuery={setPointQuery} />
          )}
        </div>
      </aside>

      <div className="relative min-h-0 flex-1">
        <FleetMap
          vessels={layers.vessels ? visible : []}
          points={staff ? points : []}
          selectedVesselId={selectedVesselId}
          selectedPointId={selectedPointId}
          onSelectVessel={selectVessel}
          onSelectPoint={selectPoint}
          layers={layers}
          picking={!!addKind && !formOpen}
          draft={draft}
          onPick={(at) => {
            setDraft(at);
            setEditPoint(null);
            setFormOpen(true);
          }}
        />

        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-center gap-2 md:left-[344px]">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            className="glass pointer-events-auto flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-card md:hidden"
          >
            <List className="h-4 w-4" /> List
          </button>
          <MapLayerChips layers={layers} onChange={setLayers} showKinds={staff} />
          {staff ? (
            <div className="pointer-events-auto relative">
              <button type="button" onClick={() => (addKind ? cancelAdd() : setKindMenu((m) => !m))} className={cn(btn.primary, "h-10")}>
                {addKind ? <X className="h-4 w-4" /> : <AddIcon className="h-4 w-4" />}
                {addKind ? "Cancel" : "Add point"}
              </button>
              {kindMenu ? (
                <div className="shadow-elevated absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-xl border bg-popover p-1">
                  {POINT_KINDS.map((k) => {
                    const Icon = POINT_KIND_ICON[k];
                    return (
                      <button key={k} type="button" onClick={() => startAdd(k)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {POINT_KIND_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {addKind && !formOpen ? (
          <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-sm font-medium text-white shadow-elevated backdrop-blur">
            Click on the map to place the {POINT_KIND_LABEL[addKind].toLowerCase()}
          </div>
        ) : null}

        {error ? (
          <div className="absolute bottom-24 left-3 right-3 z-10 md:left-[344px] md:w-80">
            <ErrorBlock error={error} onRetry={() => void mutate()} />
          </div>
        ) : null}

        <MapLegend staff={staff} showDeparted={showDeparted} onShowDeparted={setShowDeparted} />

        {selectedVessel || selectedPoint ? (
          <div className="glass absolute inset-x-0 bottom-0 z-20 max-h-[70%] overflow-y-auto rounded-t-3xl border shadow-elevated md:inset-x-auto md:bottom-auto md:right-14 md:top-3 md:max-h-[calc(100%-1.5rem)] md:w-[360px] md:rounded-2xl">
            {selectedVessel ? (
              <MapVesselCard vessel={selectedVessel} editable={staff} onClose={() => setSelectedVesselId(null)} />
            ) : selectedPoint ? (
              <MapPointCard
                point={selectedPoint}
                onClose={() => setSelectedPointId(null)}
                onEdit={() => {
                  setEditPoint(selectedPoint);
                  setFormOpen(true);
                }}
                onDelete={() => void deletePoint(selectedPoint)}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {staff ? (
        <PointFormDialog
          open={formOpen}
          onOpenChange={(o) => {
            setFormOpen(o);
            if (!o) {
              setDraft(null);
              if (!editPoint) setAddKind(null);
            }
          }}
          point={editPoint}
          at={draft}
          defaultKind={addKind ?? "company"}
          onSaved={(p) => {
            setSelectedPointId(p.id);
            setTab("contacts");
            setAddKind(null);
          }}
        />
      ) : null}
    </div>
  );
}
