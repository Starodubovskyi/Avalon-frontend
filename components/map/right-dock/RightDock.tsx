"use client";

import { useEffect, useState } from "react";
import type { MapboxAdapter } from "@/components/map/adapters/MapboxAdapter";
import type { KindVisibility, MapLayerKind } from "@/lib/domain/map-layer";

/* --- TYPES --- */
interface DockProps {
  adapter: MapboxAdapter;
  rightOffsetPx?: number;
  currentBasemap: string;
  onBasemapChange: (style: "light" | "dark" | "osm" | "sat") => void;
  // Новые пропсы для 2D/3D
  currentProjection: "globe" | "mercator";
  onProjectionChange: (proj: "globe" | "mercator") => void;
  kindVisibility: KindVisibility;
  onKindVisibilityChange: (kind: MapLayerKind, on: boolean) => void;
}

type MenuView = "main" | "layers" | "basemap";

export default function RightDock({
  adapter,
  rightOffsetPx = 0,
  currentBasemap,
  onBasemapChange,
  currentProjection,
  onProjectionChange,
  kindVisibility,
  onKindVisibilityChange,
}: DockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>("main");
  const [isLocating, setIsLocating] = useState(false);
  const [vesselCount, setVesselCount] = useState(0);

  // Сброс меню в начало при закрытии
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setView("main"), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Следим за судами
  useEffect(() => {
    const update = () => {
      try {
        setVesselCount(adapter.getVisibleCount ? adapter.getVisibleCount() : 0);
      } catch {
        setVesselCount(0);
      }
    };
    update();
    if (adapter.on) {
      adapter.on("visible:change", update);
      return () => adapter.off("visible:change", update);
    }
  }, [adapter]);

  /* --- ACTIONS --- */
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        adapter.showUserLocation(latitude, longitude);
        setIsOpen(false);
      },
      () => setIsLocating(false),
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
    setIsOpen(false);
  };

  const handleToggleProjection = () => {
    const next = currentProjection === "globe" ? "mercator" : "globe";
    onProjectionChange(next);
  };

  /* --- RENDER --- */
  return (
    <>
      <div
        className="fixed z-[1000] flex flex-col items-end gap-4"
        style={{
          top: `calc(env(safe-area-inset-top) + 16px)`,
          right: `calc(${rightOffsetPx}px + env(safe-area-inset-right) + 16px)`,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg
            transition-all duration-300 ease-in-out border border-zinc-200 dark:border-zinc-800
            ${
              isOpen
                ? "bg-zinc-900 text-white rotate-90 dark:bg-white dark:text-black"
                : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white hover:scale-105"
            }
          `}
          aria-label="Menu"
        >
          {isOpen ? <Icons.Close /> : <Icons.Menu />}

          {!isOpen && vesselCount > 0 && (
            <span
              className="
              absolute -top-1 -left-1 flex h-5 min-w-[20px] items-center justify-center rounded-full 
              bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm border border-white dark:border-zinc-900
            "
            >
              {formatCount(vesselCount)}
            </span>
          )}
        </button>

        <div
          className={`
            origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            w-64 overflow-hidden rounded-2xl shadow-2xl border
            bg-white/90 backdrop-blur-xl dark:bg-zinc-900/90
            border-zinc-200 dark:border-zinc-800
            ${
              isOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-90 -translate-y-4 pointer-events-none h-0"
            }
          `}
        >
          <div className="p-2">
            {view === "main" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-left-4 fade-in duration-200">
                <MenuItem
                  label="Map Style"
                  icon={<Icons.Map />}
                  onClick={() => setView("basemap")}
                  chevron
                />
                <MenuItem
                  label="Data Layers"
                  icon={<Icons.Layers />}
                  onClick={() => setView("layers")}
                  chevron
                />

                {/* --- НОВЫЙ ПУНКТ: 2D/3D Switch --- */}
                <MenuItem
                  label={
                    currentProjection === "globe"
                      ? "Switch to 2D"
                      : "Switch to 3D"
                  }
                  icon={<Icons.Globe />}
                  onClick={handleToggleProjection}
                />

                <div className="my-1 h-[1px] bg-zinc-100 dark:bg-zinc-800/50" />
                <MenuItem
                  label="Find Me"
                  icon={<Icons.Locate loading={isLocating} />}
                  onClick={handleLocate}
                />
                <MenuItem
                  label="Fullscreen"
                  icon={<Icons.Maximize />}
                  onClick={toggleFullscreen}
                />
              </div>
            )}

            {view === "basemap" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-200">
                <MenuHeader title="Map Style" onBack={() => setView("main")} />
                <BasemapList
                  current={currentBasemap}
                  onChange={onBasemapChange}
                />
              </div>
            )}

            {view === "layers" && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-right-4 fade-in duration-200">
                <MenuHeader title="Layers" onBack={() => setView("main")} />
                <LayersList
                  adapter={adapter}
                  kindVisibility={kindVisibility}
                  onKindVisibilityChange={onKindVisibilityChange}
                />
              </div>
            )}
          </div>

          <div className="bg-zinc-50/50 px-4 py-3 text-center dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              Ships in view
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
              {formatCount(vesselCount)}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[990] bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

/* ============ INTERNAL COMPONENTS ============ */

function MenuItem({
  label,
  icon,
  onClick,
  chevron,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="
        group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left
        transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.98]
      "
    >
      <span className="text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100 transition-colors">
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
        {label}
      </span>
      {chevron && (
        <span className="text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform">
          <Icons.ChevronRight />
        </span>
      )}
    </button>
  );
}

function MenuHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="mb-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
    >
      <Icons.ChevronLeft />
      <span className="text-xs font-bold uppercase tracking-wider">
        {title}
      </span>
    </button>
  );
}

function BasemapList({
  current,
  onChange,
}: {
  current: string;
  onChange: (style: any) => void;
}) {
  const list = [
    { id: "sat", label: "Satellite" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "osm", label: "Streets" },
  ];

  return (
    <div className="space-y-1">
      {list.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`
            flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all
            ${
              current === item.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }
          `}
        >
          {item.label}
          {current === item.id && <Icons.Check />}
        </button>
      ))}
    </div>
  );
}

function LayersList({
  adapter,
  kindVisibility,
  onKindVisibilityChange,
}: {
  adapter: MapboxAdapter;
  kindVisibility: KindVisibility;
  onKindVisibilityChange: (kind: MapLayerKind, on: boolean) => void;
}) {
  const ToggleItem = ({
    id,
    label,
  }: {
    id: "ports" | "anchorages" | "routes";
    label: string;
  }) => {
    const [enabled, setEnabled] = useState(false);

    const toggle = () => {
      const newState = !enabled;
      setEnabled(newState);
      adapter.toggleLayer(id, newState);
    };

    return (
      <SwitchRow label={label} enabled={enabled} onToggle={toggle} />
    );
  };

  const KindToggle = ({
    id,
    label,
  }: {
    id: MapLayerKind;
    label: string;
  }) => (
    <SwitchRow
      label={label}
      enabled={kindVisibility[id]}
      onToggle={() => onKindVisibilityChange(id, !kindVisibility[id])}
    />
  );

  return (
    <div className="space-y-1">
      <KindToggle id="person" label="My contacts" />
      <KindToggle id="company" label="Companies" />
      <KindToggle id="vessel" label="Vessels" />
      <KindToggle id="port" label="Directory ports" />
      <div className="my-1 h-px bg-zinc-100 dark:bg-zinc-800/50" />
      <ToggleItem id="ports" label="Major Ports" />
      <ToggleItem id="anchorages" label="Anchorages" />
      <ToggleItem id="routes" label="Shipping Lanes" />
    </div>
  );
}

function SwitchRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <div
        className={`
          relative h-5 w-9 rounded-full transition-colors duration-200 ease-in-out
          ${enabled ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"}
        `}
      >
        <div
          className={`
            absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out
            ${enabled ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </div>
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

/* ============ ICONS ============ */
const Icons = {
  Menu: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Map: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" x2="9" y1="3" y2="18" />
      <line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  ),
  // Добавлена иконка Глобуса
  Globe: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  Layers: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 9 4.9-9 4.9-9-4.9 9-4.9Z" />
      <path d="m2 13 10 5 10-5" />
      <path d="m2 16 10 5 10-5" />
    </svg>
  ),
  Locate: ({ loading }: { loading?: boolean }) =>
    loading ? (
      <svg
        className="animate-spin"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="2" x2="5" y1="12" y2="12" />
        <line x1="19" x2="22" y1="12" y2="12" />
        <line x1="12" x2="12" y1="2" y2="5" />
        <line x1="12" x2="12" y1="19" y2="22" />
        <circle cx="12" cy="12" r="7" />
      </svg>
    ),
  Maximize: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" x2="14" y1="3" y2="10" />
      <line x1="3" x2="10" y1="21" y2="14" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Check: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
};
