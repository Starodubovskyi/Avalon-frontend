"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  // Состояние для анимации закрытия
  const [isClosing, setIsClosing] = useState(false);
  // Храним данные судна даже во время анимации закрытия
  const [renderData, setRenderData] = useState<VesselInfo | null>(null);

  const [panelPos, setPanelPos] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [panelSide, setPanelSide] = useState<PanelSide>("right");
  const [mode, setMode] = useState<"floating" | "sheet">("floating");

  const [pastTrackOn, setPastTrackOn] = useState(false);
  const [routeOn, setRouteOn] = useState(false);
  const [distanceNm, setDistanceNm] = useState<number | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

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

  const containerSize = () => {
    const el = adapter.getContainer();
    return { width: el.clientWidth, height: el.clientHeight };
  };

  const measurePanel = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const baseW = Math.min(vw * 0.92, vw < 768 ? vw : 480);
    const width = vw >= 1440 ? 460 : vw >= 1024 ? 420 : vw >= 768 ? 380 : baseW;
    const height = Math.min(vh - 24, 520);
    return { width, height };
  };

  const recalcPosition = useCallback(
    (v: VesselInfo) => {
      if (!v) return;
      if (isMobile) {
        setMode("sheet");
        setPanelPos(null);
        setPanelSide("right");
        return;
      }
      setMode("floating");
      const a = adapter.project(v.lat, v.lon);
      const panelSize = measurePanel();
      const cont = containerSize();
      const { left, top, side } = getAnchorPosition(
        a,
        panelSize,
        cont,
        "right",
        12
      );
      setPanelPos({ left, top });
      setPanelSide(side);
    },
    [adapter, isMobile]
  );

  // Обработка выбора маркера
  useEffect(() => {
    const offMove = adapter.onMove?.(() => {
      if (!active) return;
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => recalcPosition(active), 50);
    });

    const offSelect = adapter.onMarkerSelect?.((v: VesselInfo) => {
      setIsClosing(false);
      setActive(v);
      setRenderData(v); // Сразу обновляем данные для рендера
      adapter.highlightMarker?.(v.id, true);
      recalcPosition(v);
    });

    const onResize = () => active && recalcPosition(active);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      if (typeof offMove === "function")
        try {
          offMove();
        } catch {}
      if (typeof offSelect === "function")
        try {
          offSelect();
        } catch {}
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (moveTimer.current) clearTimeout(moveTimer.current);
    };
  }, [adapter, active, recalcPosition]);

  // Таймер обновления данных (ETA и т.д.)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, [active]);

  const { progressPct, progressLabel } = useMemo(() => {
    if (!renderData) return { progressPct: 0, progressLabel: "" };
    const startMs = Date.parse(renderData.atd);
    const endMs = Date.parse(renderData.reportedEta);
    if (!isFinite(startMs) || !isFinite(endMs) || endMs <= startMs) {
      return { progressPct: 0, progressLabel: "" };
    }
    const now = Date.now();
    const pctRaw = ((now - startMs) / Math.max(1, endMs - startMs)) * 100;
    const pct = Math.max(0, Math.min(100, pctRaw));
    const remainingMs = Math.max(0, endMs - now);
    const m = Math.round(remainingMs / 60000);
    const d = Math.floor(m / 1440);
    const h = Math.floor((m - d * 1440) / 60);
    const mm = m - d * 1440 - h * 60;
    const fmt =
      d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${mm}m left` : `${mm}m left`;
    const label = now >= endMs ? "Arrived" : `${Math.round(pct)}% • ${fmt}`;
    return { progressPct: pct, progressLabel: label };
  }, [renderData, tick]);

  const inFleet = useMemo(
    () => (renderData ? fleetIds.has(renderData.id) : false),
    [renderData, fleetIds]
  );

  const close = useCallback(() => {
    if (active) {
      adapter.highlightMarker?.(active.id, false);
      if (pastTrackOn) adapter.clearPastTrack?.(active.id);
    }

    // Запускаем анимацию закрытия
    setIsClosing(true);

    // Ждем окончания анимации (300мс соответствует duration-300 в CSS)
    setTimeout(() => {
      setActive(null);
      setRenderData(null);
      setIsClosing(false);
      setPastTrackOn(false);
      if (routeOn) {
        adapter.disableRouteTool?.();
        setRouteOn(false);
        setDistanceNm(null);
      }
    }, 300);
  }, [active, adapter, pastTrackOn, routeOn]);

  useEffect(() => {
    if (active && mode === "sheet") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [active, mode]);

  // Рендерим, если есть активное судно ИЛИ идет анимация закрытия
  const shouldRender = active || (isClosing && renderData);

  return shouldRender && renderData ? (
    <>
      {/* Backdrop (только для мобильной версии или если нужно блокировать карту) */}
      {mode === "sheet" && (
        <div
          className={`
            fixed inset-0 z-[900] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300
            ${isClosing ? "opacity-0" : "opacity-100"}
          `}
          onClick={close}
        />
      )}

      {mode === "floating" && (
        <div className="absolute inset-0 z-[900]" onClick={close} />
      )}

      <div className="absolute inset-0 z-[950] pointer-events-none">
        <VesselInfoPanel
          vessel={renderData}
          side={panelSide}
          anchorPx={adapter.project(renderData.lat, renderData.lon)}
          style={
            mode === "floating"
              ? { left: panelPos?.left, top: panelPos?.top }
              : undefined
          }
          mode={mode}
          isClosing={isClosing} // Передаем состояние закрытия
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
            if (!pastTrackOn) adapter.drawPastTrack?.(id, 100);
            else adapter.clearPastTrack?.(id);
            setPastTrackOn((x) => !x);
          }}
          onRouteToggle={() => {
            setRouteOn((x) => {
              const next = !x;
              if (next) adapter.enableRouteTool?.(setDistanceNm);
              else {
                adapter.disableRouteTool?.();
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
