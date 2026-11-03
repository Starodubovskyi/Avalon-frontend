"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { List } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { DEFAULT_FORM_KIND, POINT_KINDS, pointTitle, type PointKind, type TeamPoint } from "@/lib/points/team-points";
import { usePointQuota, useTeamPointMutations, useTeamPoints } from "@/lib/points/hooks";
import { usePointLabels } from "@/lib/points/labels";
import { ErrorBlock } from "../ui/primitives";
import { MapVesselList } from "./MapVesselList";
import { MapVesselCard } from "./MapVesselCard";
import { MapPointList } from "./MapPointList";
import { MapPointCard } from "./MapPointCard";
import { PointFormDialog } from "./PointFormDialog";
import { MapLegend, MapLayerChips } from "./MapControls";
import { AddPointControl } from "./AddPointControl";
import { MapSidebar, type MapTab } from "./MapSidebar";
import { useMapDeepLinks } from "./useMapDeepLinks";
import type { LayerVisibility } from "./FleetMap";

const FleetMap = dynamic(() => import("./FleetMap").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-muted" />,
});

export function FleetMapView() {
  const t = useTranslations("map");
  const labels = usePointLabels();
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, mutate } = useVessels("all");
  const { data: pointsData } = useTeamPoints();
  const { remove: removePoint } = useTeamPointMutations();
  const quota = usePointQuota(pointsData);

  const [tab, setTab] = useState<MapTab>("vessels");
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pointQuery, setPointQuery] = useState("");
  const [showDeparted, setShowDeparted] = useState(false);
  const [layers, setLayers] = useState<LayerVisibility>({
    vessels: true,
    seamarks: true,
    kinds: Object.fromEntries(POINT_KINDS.map((k) => [k, true])) as Record<PointKind, boolean>,
    favoritesOnly: false,
  });
  const [listOpen, setListOpen] = useState(false);
  const [addKind, setAddKind] = useState<PointKind | null>(null);
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
      (p) =>
        layers.kinds[p.kind] &&
        (!layers.favoritesOnly || p.isFavorite) &&
        (!q || `${pointTitle(p)} ${labels.activityList(p)} ${p.address ?? ""}`.toLowerCase().includes(q)),
    );
  }, [pointsData, pointQuery, layers.kinds, layers.favoritesOnly, labels]);
  const favoriteCount = useMemo(() => (pointsData ?? []).filter((p) => p.isFavorite).length, [pointsData]);

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
    if (!window.confirm(t("confirmDelete", { title: pointTitle(p) }))) return;
    try {
      await removePoint(p);
      setSelectedPointId(null);
    } catch {
      /* toast shown */
    }
  }

  useMapDeepLinks({
    points: pointsData,
    canAdd: !(quota.limited && quota.remaining === 0),
    onAdd: startAdd,
    onFocus: (linked) => {
      // a shared link must show the point even if filters would hide it
      setLayers((l) => ({ ...l, favoritesOnly: l.favoritesOnly && linked.isFavorite, kinds: { ...l.kinds, [linked.kind]: true } }));
      setTab("contacts");
      setSelectedVesselId(null);
      setSelectedPointId(linked.id);
    },
  });

  return (
    <div className="relative flex min-h-0 flex-1">
      <MapSidebar
        open={listOpen}
        onClose={() => setListOpen(false)}
        tab={tab}
        onTab={setTab}
        inWork={inWork}
        vesselCount={visible.length}
        pointCount={points.length}
        vessels={
          <MapVesselList
            vessels={visible}
            selectedId={selectedVesselId}
            onSelect={(id) => {
              selectVessel(id);
              setSelectedPointId(null);
            }}
            query={query}
            onQuery={setQuery}
          />
        }
        points={
          <MapPointList
            points={points}
            selectedId={selectedPointId}
            onSelect={(id) => {
              selectPoint(id);
              setSelectedVesselId(null);
            }}
            query={pointQuery}
            onQuery={setPointQuery}
            favoritesOnly={layers.favoritesOnly}
            onFavoritesOnly={(on) => setLayers((l) => ({ ...l, favoritesOnly: on }))}
            favoriteCount={favoriteCount}
          />
        }
      />

      <div className="relative min-h-0 flex-1">
        <FleetMap
          vessels={layers.vessels ? visible : []}
          points={points}
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

        <div className="pointer-events-none absolute left-3 right-14 top-3 z-10 flex items-start gap-2 md:left-[344px] md:right-3 md:flex-wrap md:justify-center">
          <button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            className="glass pointer-events-auto flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-card md:hidden"
          >
            <List className="h-4 w-4" /> {t("listButton")}
          </button>
          <MapLayerChips layers={layers} onChange={setLayers} />
          <AddPointControl variant="toolbar" addKind={addKind} onStart={startAdd} onCancel={cancelAdd} quota={quota} />
        </div>

        {addKind && !formOpen ? (
          <div className="absolute left-1/2 top-20 z-10 w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-center text-sm font-medium text-white shadow-elevated backdrop-blur">
            {t("placeHint", { kind: labels.kind(addKind).toLowerCase() })}
          </div>
        ) : null}

        {error ? (
          <div className="absolute bottom-24 left-3 right-3 z-10 md:left-[344px] md:w-80">
            <ErrorBlock error={error} onRetry={() => void mutate()} />
          </div>
        ) : null}

        <MapLegend staff={staff} showDeparted={showDeparted} onShowDeparted={setShowDeparted} />
        {!selectedVessel && !selectedPoint ? <AddPointControl variant="fab" addKind={addKind} onStart={startAdd} onCancel={cancelAdd} quota={quota} /> : null}

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
        defaultKind={addKind ?? DEFAULT_FORM_KIND}
        onSaved={(p) => {
          setSelectedPointId(p.id);
          setTab("contacts");
          setAddKind(null);
        }}
      />
    </div>
  );
}
