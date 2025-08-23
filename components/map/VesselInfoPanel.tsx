"use client";

import { useEffect, useRef } from "react";
import type { PanelSide } from "./positioning";

export type VesselInfo = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  course: number;
  type: string;
  flagEmoji: string;
  photoUrl: string;
  departurePort: string;
  atd: string;         
  reportedEta: string; 
  status: string;
  speed: number;
  loadCondition: string;
  receivedAgo: string;
};

export default function VesselInfoPanel({
  vessel,
  side,
  anchorPx,
  style,
  mode,
  inFleet,
  pastTrackActive,
  routeActive,
  distanceNm,
  voyageProgressPct,
  voyageProgressLabel,
  onClose,
  onToggleFleet,
  onPastTrackToggle,
  onRouteToggle,
  onDetails,
}: {
  vessel: VesselInfo;
  side: PanelSide;
  anchorPx?: { x: number; y: number } | null;
  style?: React.CSSProperties;
  mode: "floating" | "sheet";
  inFleet: boolean;
  pastTrackActive: boolean;
  routeActive: boolean;
  distanceNm?: number | null;
  voyageProgressPct: number;       
  voyageProgressLabel?: string;    
  onClose: () => void;
  onToggleFleet: (id: string) => void;
  onPastTrackToggle: (id: string) => void;
  onRouteToggle: (id: string) => void;
  onDetails: (id: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => panelRef.current?.focus(), []);

  const basePanel =
    "rounded-xl border bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900 text-sm overflow-hidden";
  const widthClass =
    mode === "sheet"
      ? "w-full max-w-none"
      : "w-[min(92vw,480px)] md:w-[380px] lg:w-[420px] xl:w-[460px]";

  return (
    <div className="pointer-events-none absolute inset-0 z-[1000]">
      <div
        role="dialog"
        aria-label={`${vessel.name} info`}
        tabIndex={-1}
        ref={panelRef}
        style={mode === "floating" ? style : undefined}
        className={`pointer-events-auto ${basePanel} ${widthClass} ${
          mode === "sheet"
            ? "fixed inset-x-0 bottom-0 max-h-[84vh]"
            : "absolute max-h-[calc(100vh-1.5rem)]"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <span className="text-lg leading-none">{vessel.flagEmoji}</span>
              <span className="truncate">{vessel.type}</span>
            </div>
            <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {vessel.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="w-full">
          <div className="aspect-[16/9] w-full bg-black/5 dark:bg-white/5">
            <img
              src={vessel.photoUrl}
              alt={vessel.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3">
            <button
              aria-pressed={inFleet}
              onClick={() => onToggleFleet(vessel.id)}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium dark:border-white/10 ${
                inFleet
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "hover:bg-zinc-50 dark:hover:bg-white/5"
              }`}
            >
              <span>☰</span>
              <span>{inFleet ? "In fleet" : "Add to fleet"}</span>
            </button>

            <button
              onClick={() => onDetails(vessel.id)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Vessel details
            </button>
          </div>

          <div className="px-4">
            <div className="flex items-baseline justify-between">
              <div className="truncate text-lg font-semibold tracking-tight">
                {vessel.departurePort}
              </div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                FOR ORDERS
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">ATD</div>
                <div className="font-medium">{vessel.atd}</div>
              </div>
              <div>
                <div className="text-zinc-500 dark:text-zinc-400">Reported ETA</div>
                <div className="font-medium">{vessel.reportedEta}</div>
              </div>
            </div>

            <div className="mt-4" aria-label="Voyage progress">
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-2 rounded-full bg-blue-600 dark:bg-blue-500"
                  style={{ width: `${Math.max(0, Math.min(100, voyageProgressPct))}%` }}
                />
              </div>
              <div className="mt-1 text-[12px] text-zinc-600 dark:text-zinc-300">
                {voyageProgressLabel}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onPastTrackToggle(vessel.id)}
                className={`rounded-md px-3 py-2 text-sm font-medium border dark:border-white/10 ${
                  pastTrackActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "hover:bg-zinc-50 dark:hover:bg-white/5"
                }`}
              >
                ◀ Past track
              </button>
              <button
                onClick={() => onRouteToggle(vessel.id)}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium dark:border-white/10 ${
                  routeActive
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "hover:bg-zinc-50 dark:hover:bg-white/5"
                }`}
              >
                <span>⛯</span>
                <span>{routeActive ? "Route tool: ON" : "Use route tool"}</span>
              </button>
              {typeof distanceNm === "number" && (
                <div className="ml-auto text-xs text-zinc-600 dark:text-zinc-300">
                  Route: {distanceNm.toFixed(1)} nm
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
              <div className="rounded-lg border p-3 leading-tight dark:border-white/10">
                <div className="text-zinc-500 dark:text-zinc-400">Navigational status</div>
                <div className="mt-1 font-medium">{vessel.status}</div>
              </div>
              <div className="rounded-lg border p-3 leading-tight dark:border-white/10">
                <div className="text-zinc-500 dark:text-zinc-400">Speed/Course</div>
                <div className="mt-1 font-medium">
                  {vessel.speed.toFixed(1)} kn / {Math.round(vessel.course)}°
                </div>
              </div>
              <div className="rounded-lg border p-3 leading-tight dark:border-white/10">
                <div className="text-zinc-500 dark:text-zinc-400">Load condition</div>
                <div className="mt-1 font-medium">{vessel.loadCondition}</div>
              </div>
            </div>

            <div className="my-4 text-[12px] text-zinc-500 dark:text-zinc-400">
              Received: {vessel.receivedAgo}
            </div>
          </div>
        </div>
      </div>

      {mode === "floating" && anchorPx && (
        <div
          className="pointer-events-none absolute"
          style={{
            left:
              side === "right"
                ? anchorPx.x + 2
                : side === "left"
                ? anchorPx.x - 2
                : anchorPx.x,
            top: anchorPx.y,
            transform:
              side === "right"
                ? "translateX(-100%)"
                : side === "left"
                ? "translateX(0)"
                : "translate(-50%, -100%)",
          }}
        >
          <div className="h-3 w-3 rotate-45 border bg-white dark:bg-zinc-900 dark:border-white/10" />
        </div>
      )}
    </div>
  );
}
