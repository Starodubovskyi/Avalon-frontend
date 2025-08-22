"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VesselInfoPanel, { type VesselInfo } from "./VesselInfoPanel";
import { getAnchorPosition, type PanelSide } from "./positioning";
import type { MapAdapter } from "@/components/map/adapters/LeafletAdapter";

export default function VesselOverlay({
  adapter,
  detailsHref,
}: {
  adapter: MapAdapter;
  detailsHref?: (id: string) => string;
}) {
  const [active, setActive] = useState<VesselInfo | null>(null);
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  const [panelSide, setPanelSide] = useState<PanelSide>("right");
  const [mode, setMode] = useState<"floating" | "sheet">("floating");

  const [pastTrackOn, setPastTrackOn] = useState(false);
  const [routeOn, setRouteOn] = useState(false);
  const [distanceNm, setDistanceNm] = useState<number | null>(null);

  const [fleetIds, setFleetIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("fleetIds");
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  const saveFleet = useCallback((next: Set<string>) => {
    setFleetIds(new Set(next));
    localStorage.setItem("fleetIds", JSON.stringify(Array.from(next)));
  }, []);

  const isMobile = () => (typeof window !== "undefined" ? window.innerWidth <= 640 : false);

  const containerSize = () => {
    const el = adapter.getContainer();
    return { width: el.clientWidth, height: el.clientHeight };
  };

  const measurePanel = () => {
    const w = Math.min(window.innerWidth * 0.92, window.innerWidth <= 640 ? window.innerWidth : 480);
    const widths =
      window.innerWidth <= 640
        ? w
        : window.innerWidth >= 1440
        ? 460
        : window.innerWidth >= 1024
        ? 420
        : 380;
    const heights = Math.min(window.innerHeight - 24, 520);
    return { width: widths, height: heights };
  };

  const recalcPosition = useCallback(
    (v: VesselInfo) => {
      if (isMobile()) {
        setMode("sheet");
        return;
      }
      setMode("floating");
      const a = adapter.project(v.lat, v.lon);
      const panelSize = measurePanel();
      const cont = containerSize();
      const { left, top, side } = getAnchorPosition(a, panelSize, cont, "right", 12);
      setPanelPos({ left, top });
      setPanelSide(side);
    },
    [adapter]
  );

  useEffect(() => {
    const unsubMove = adapter.onMove(() => {
      if (active) recalcPosition(active);
    });
    adapter.onMarkerSelect((v) => {
      setActive(v);
      adapter.highlightMarker(v.id, true);
      recalcPosition(v);
    });
    const onResize = () => active && recalcPosition(active);
    window.addEventListener("resize", onResize);
    return () => {
      unsubMove?.();
      window.removeEventListener("resize", onResize);
    };
  }, [active, adapter, recalcPosition]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [active]);

  const { progressPct, progressLabel } = useMemo(() => {
    if (!active) return { progressPct: 0, progressLabel: "" };
    const start = new Date(active.atd).getTime();
    const end = new Date(active.reportedEta).getTime();
    const now = Date.now();
    const pctRaw = ((now - start) / Math.max(1, end - start)) * 100;
    const pct = Math.max(0, Math.min(100, pctRaw));

    const remainingMs = Math.max(0, end - now);
    const fmt = (ms: number) => {
      const m = Math.round(ms / 60000);
      const d = Math.floor(m / (60 * 24));
      const h = Math.floor((m - d * 1440) / 60);
      const mm = m - d * 1440 - h * 60;
      if (d > 0) return `${d}d ${h}h left`;
      if (h > 0) return `${h}h ${mm}m left`;
      return `${mm}m left`;
    };
    const label =
      now >= end ? "Arrived" : `${Math.round(pct)}% • ${fmt(remainingMs)}`;
    return { progressPct: pct, progressLabel: label };
  }, [active, tick]);

  const inFleet = useMemo(() => (active ? fleetIds.has(active.id) : false), [active, fleetIds]);

  const close = useCallback(() => {
    if (active) {
      adapter.highlightMarker(active.id, false);
      if (pastTrackOn) adapter.clearPastTrack(active.id);
    }
    setActive(null);
    setPastTrackOn(false);
    if (routeOn) {
      adapter.disableRouteTool();
      setRouteOn(false);
      setDistanceNm(null);
    }
  }, [active, adapter, pastTrackOn, routeOn]);

  return active ? (
    <>
      <div className="absolute inset-0 z-[900]" onClick={close} />
      <div className="absolute inset-0 z-[950] pointer-events-none">
        <VesselInfoPanel
          vessel={active}
          side={panelSide}
          anchorPx={adapter.project(active.lat, active.lon)}
          style={mode === "floating" ? { left: panelPos?.left, top: panelPos?.top } : undefined}
          mode={mode}
          inFleet={inFleet}
          pastTrackActive={pastTrackOn}
          routeActive={routeOn}
          distanceNm={distanceNm}
          voyageProgressPct={progressPct}
          voyageProgressLabel={progressLabel}
          onClose={close}
          onToggleFleet={(id) => {
            const next = new Set(fleetIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            saveFleet(next);
          }}
          onPastTrackToggle={(id) => {
            if (!pastTrackOn) adapter.drawPastTrack(id, 100);
            else adapter.clearPastTrack(id);
            setPastTrackOn((x) => !x);
          }}
          onRouteToggle={() => {
            setRouteOn((x) => {
              const next = !x;
              if (next) adapter.enableRouteTool(setDistanceNm);
              else {
                adapter.disableRouteTool();
                setDistanceNm(null);
              }
              return next;
            });
          }}
          onDetails={(id) => {
            const url = detailsHref ? detailsHref(id) : `/vessels/${id}`;
            window.location.href = url;
          }}
        />
      </div>
    </>
  ) : null;
}
