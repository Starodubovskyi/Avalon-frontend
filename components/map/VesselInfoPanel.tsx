"use client";

import { useEffect, useRef, useState } from "react";
import type { PanelSide } from "./positioning";
import {
  IconShip,
  IconAnchor,
  IconNavigation,
  IconClock,
  IconRuler,
  IconMapPin,
  IconArrowRight,
} from "@tabler/icons-react";

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
  isClosing, // Новый проп для анимации выхода
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
  isClosing: boolean;
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => panelRef.current?.focus(), []);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const computedMode: "floating" | "sheet" = isMobile ? "sheet" : mode;

  // --- Анимации ---
  // Mobile Sheet: выезд снизу (translate-y)
  const mobileAnim = isClosing
    ? "translate-y-full opacity-0"
    : "translate-y-0 opacity-100";

  // Desktop Floating: зум + фейд
  const desktopAnim = isClosing
    ? "opacity-0 scale-95"
    : "opacity-100 scale-100";

  const baseClasses =
    "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col justify-end md:block">
      {/* Карточка / Шторка */}
      <div
        role="dialog"
        aria-label={`${vessel.name} info`}
        tabIndex={-1}
        ref={panelRef}
        style={computedMode === "floating" ? style : undefined}
        className={`
          pointer-events-auto bg-white dark:bg-zinc-900 text-sm overflow-hidden flex flex-col
          ${baseClasses}
          ${
            computedMode === "sheet"
              ? `w-full rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] ${mobileAnim}` // Мобильные стили
              : `absolute w-[380px] lg:w-[420px] rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 ${desktopAnim}` // Десктоп стили
          }
        `}
      >
        {/* Mobile Handle (Drag indicator) */}
        {computedMode === "sheet" && (
          <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
            <div className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
        )}

        {/* --- Header Image & Info --- */}
        <div className="relative">
          {/* Кнопка закрытия (на десктопе крестик, на мобильном можно скрыть, так как есть свайп/фон) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition"
          >
            ✕
          </button>

          {/* Картинка судна */}
          <div className="h-40 w-full bg-zinc-100 dark:bg-zinc-800 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <img
              src={vessel.photoUrl}
              alt={vessel.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-4 text-white">
              <div className="flex items-center gap-2 text-white/90 text-xs font-medium uppercase tracking-wider mb-1">
                <span>{vessel.flagEmoji}</span>
                <span>{vessel.type}</span>
              </div>
              <h2 className="text-xl font-bold leading-tight">{vessel.name}</h2>
            </div>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Voyage Info */}
          <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-3 border border-zinc-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
                  <IconMapPin size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">
                    Destination
                  </div>
                  <div className="font-semibold text-zinc-900 dark:text-white leading-tight">
                    {vessel.departurePort}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-zinc-500 font-bold">
                  ETA
                </div>
                <div className="font-mono font-medium text-zinc-900 dark:text-white">
                  {vessel.reportedEta
                    ? new Date(vessel.reportedEta).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )
                    : "—"}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{
                  width: `${Math.max(0, Math.min(100, voyageProgressPct))}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] font-medium text-zinc-500">
              <span>{vessel.atd ? "Departed" : "—"}</span>
              <span>{voyageProgressLabel || "En Route"}</span>
            </div>
          </div>

          {/* Stats Grid (Bento style) */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              icon={<IconNavigation size={16} />}
              label="Speed / Course"
              value={`${vessel.speed.toFixed(1)} kn / ${Math.round(
                vessel.course
              )}°`}
            />
            <StatBox
              icon={<IconAnchor size={16} />}
              label="Status"
              value={vessel.status}
            />
            <StatBox
              icon={<IconShip size={16} />}
              label="Draft"
              value={vessel.loadCondition}
            />
            <StatBox
              icon={<IconClock size={16} />}
              label="Updated"
              value={vessel.receivedAgo}
            />
          </div>

          {/* Action Buttons (Pills) */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                active={inFleet}
                onClick={() => onToggleFleet(vessel.id)}
                icon={inFleet ? "✓" : "+"}
                label={inFleet ? "In Fleet" : "Add to Fleet"}
                variant="secondary"
              />
              <ActionButton
                active={false}
                onClick={() => onDetails(vessel.id)}
                icon={<IconArrowRight size={16} />}
                label="Details"
                variant="primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                active={pastTrackActive}
                onClick={() => onPastTrackToggle(vessel.id)}
                label="Past Track"
                variant="outline"
              />
              <ActionButton
                active={routeActive}
                onClick={() => onRouteToggle(vessel.id)}
                label={routeActive ? "Route: ON" : "Route Tool"}
                variant="outline"
              />
            </div>
          </div>

          {/* Distance Calc Result */}
          {typeof distanceNm === "number" && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
              <IconRuler size={18} />
              <span>Measured Distance: {distanceNm.toFixed(1)} nm</span>
            </div>
          )}

          {/* Spacer for mobile safe area */}
          {computedMode === "sheet" && <div className="h-6" />}
        </div>
      </div>

      {/* Floating Arrow (Desktop only) */}
      {computedMode === "floating" && anchorPx && (
        <div
          className={`
            pointer-events-none absolute w-4 h-4 bg-white dark:bg-zinc-900 border-l border-t border-zinc-200 dark:border-white/10 rotate-45 z-[1001]
            ${
              isClosing
                ? "opacity-0"
                : "opacity-100 transition-opacity duration-300"
            }
          `}
          style={{
            left:
              side === "right"
                ? anchorPx.x + 1
                : side === "left"
                ? anchorPx.x - 1
                : anchorPx.x,
            top: anchorPx.y,
            transform:
              side === "right"
                ? "translateX(-50%) translateY(-50%) rotate(45deg)"
                : side === "left"
                ? "translateX(-50%) translateY(-50%) rotate(-135deg)"
                : "translate(-50%, -50%) rotate(45deg)", // Simplified positioning for the arrow logic
            // Note: Exact arrow positioning depends on 'positioning.ts' logic which puts the panel offset.
            // Usually simpler to just hide the arrow if it complicates the transition.
            display: "none", // Hiding arrow for cleaner modern look
          }}
        />
      )}
    </div>
  );
}

// --- Subcomponents for cleaner code ---

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col p-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate"
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  active,
  variant = "outline",
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  variant?: "primary" | "secondary" | "outline";
}) {
  const base =
    "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: active
      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
    outline: active
      ? "bg-zinc-900 text-white dark:bg-white dark:text-black border border-transparent"
      : "border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
