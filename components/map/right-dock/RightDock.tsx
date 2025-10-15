"use client";

import { useEffect, useState } from "react";
import type { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";

type Panel = null | "basemap" | "layers" | "route";

export default function RightDock({
  adapter,
  rightOffsetPx = 0,
}: {
  adapter: LeafletAdapter;
  rightOffsetPx?: number;
}) {
  const [open, setOpen] = useState<Panel>(null);
  const [visible, setVisible] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [routeOn, setRouteOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth < 768);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const update = () => {
      try {
        setVisible(adapter.getVisibleCount());
      } catch {
        setVisible(0);
      }
    };
    update();
    const off = adapter.onMove?.(update);
    return () => {
      try {
        off?.();
      } catch {}
    };
  }, [adapter]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setFabOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleFullscreen = async () => {
    const el = adapter.getContainer();
    const doc: any = document;
    if (!document.fullscreenElement) {
      await (el.requestFullscreen?.() ||
        (el as any).webkitRequestFullscreen?.());
    } else {
      await (doc.exitFullscreen?.() || doc.webkitExitFullscreen?.());
    }
  };

  const handleAction = (p: Panel) => {
    if (p === "route") {
      if (!routeOn) {
        adapter.enableRouteTool?.(() => {});
        setRouteOn(true);
      } else {
        adapter.disableRouteTool?.();
        setRouteOn(false);
      }
      setOpen(null);
      setFabOpen(false);
      return;
    }
    setOpen((prev) => (prev === p ? null : p));
    if (isMobile) setFabOpen(false);
  };

  if (!isMobile) {
    return (
      <>
        <div
          className="
            pointer-events-auto
            absolute right-2 top-2 z-[1200]
            flex flex-col gap-1
            rounded-xl border border-white/15 bg-zinc-900/70 p-1
            shadow-xl backdrop-blur
          "
          style={{
            right: `calc(${rightOffsetPx}px + env(safe-area-inset-right))`,
          }}
        >
          <ToolButton
            title="Basemap"
            active={open === "basemap"}
            onClick={() => handleAction("basemap")}
            icon={Icons.map}
          />
          <ToolButton
            title="Layers"
            active={open === "layers"}
            onClick={() => handleAction("layers")}
            icon={Icons.stack}
          />
          <ToolButton
            title={routeOn ? "Route tool: ON" : "Route tool"}
            active={routeOn}
            onClick={() => handleAction("route")}
            icon={Icons.route}
          />
        </div>

        <div
          className="
            pointer-events-auto
            absolute right-2 bottom-2 z-[1200]
            flex flex-col items-stretch gap-1
            rounded-xl border border-white/15 bg-zinc-900/70 p-1
            shadow-xl backdrop-blur
          "
          style={{
            right: `calc(${rightOffsetPx}px + env(safe-area-inset-right))`,
          }}
        >
          <StatBox
            title="Visible"
            value={formatK(visible)}
            icon={Icons.count}
          />
          <ClickableStat
            title="Since update"
            value={`${seconds}s`}
            icon={Icons.clock}
            onClick={() => {
              adapter.refresh?.();
              setSeconds(0);
            }}
          />
          <ToolButton
            title="Fullscreen"
            onClick={toggleFullscreen}
            icon={Icons.fullscreen}
          />
        </div>

        {open && (
          <SidePanel
            title={
              open === "basemap"
                ? "Basemap"
                : open === "layers"
                ? "Layers"
                : "Route tool"
            }
            onClose={() => setOpen(null)}
            rightOffsetPx={rightOffsetPx}
          >
            {open === "basemap" && (
              <BasemapPanel
                onSelect={(s) => {
                  adapter.setBasemap?.(s);
                  setOpen(null);
                }}
              />
            )}
            {open === "layers" && <LayersPanel adapter={adapter} />}
          </SidePanel>
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="
          absolute z-[1200]
          rounded-full bg-black/65 text-white text-[11px] font-medium
          px-3 py-1 shadow-lg
        "
        style={{
          right: `calc(${rightOffsetPx}px + env(safe-area-inset-right) + 12px)`,
          top: `calc(env(safe-area-inset-top) + 68px)`,
        }}
      >
        {formatK(visible)} visible
      </div>

      <button
        onClick={() => setFabOpen((v) => !v)}
        className="
          absolute z-[1200]
          h-12 w-12 rounded-full
          grid place-items-center
          shadow-xl border border-white/20
          bg-zinc-900/80 text-white
          active:scale-95 transition
        "
        style={{
          right: `calc(${rightOffsetPx}px + env(safe-area-inset-right) + 12px)`,
          top: `calc(env(safe-area-inset-top) + 12px)`,
        }}
        aria-label="Map actions"
        title="Map actions"
      >
        {fabOpen ? Icons.close : Icons.plus}
      </button>

      {fabOpen && (
        <div
          className="absolute z-[1199] flex flex-col gap-2"
          style={{
            right: `calc(${rightOffsetPx}px + env(safe-area-inset-right) + 12px)`,
            top: `calc(env(safe-area-inset-top) + 12px + 56px)`,
          }}
        >
          <MiniAction
            label={routeOn ? "Route ON" : "Route"}
            onClick={() => handleAction("route")}
            icon={Icons.route}
            active={routeOn}
          />
          <MiniAction
            label="Layers"
            onClick={() => handleAction("layers")}
            icon={Icons.stack}
          />
          <MiniAction
            label="Basemap"
            onClick={() => handleAction("basemap")}
            icon={Icons.map}
          />
          <MiniAction
            label="Full"
            onClick={toggleFullscreen}
            icon={Icons.fullscreen}
          />
        </div>
      )}

      <BottomSheet
        open={open === "basemap" || open === "layers"}
        onClose={() => setOpen(null)}
      >
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {open === "basemap" ? "Basemap" : "Layers"}
            </div>
            <button
              onClick={() => setOpen(null)}
              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10"
              aria-label="Close"
              title="Close"
            >
              {Icons.close}
            </button>
          </div>
          {open === "basemap" && (
            <BasemapPanel
              onSelect={(s) => {
                adapter.setBasemap?.(s);
                setOpen(null);
              }}
            />
          )}
          {open === "layers" && <LayersPanel adapter={adapter} />}
        </div>
      </BottomSheet>
    </>
  );
}

function SidePanel({
  title,
  onClose,
  children,
  rightOffsetPx,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  rightOffsetPx?: number;
}) {
  return (
    <div
      className="
        absolute top-2 right-[64px] z-[1200]
        w-[min(340px,92vw)] max-h-[calc(100%-16px)]
        overflow-y-auto rounded-xl border
        bg-white p-0 shadow-2xl
        dark:border-white/10 dark:bg-zinc-900
      "
      role="dialog"
      aria-modal="true"
      style={{
        right: `calc(${
          (rightOffsetPx || 0) + 64
        }px + env(safe-area-inset-right))`,
      }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2 dark:border-white/10">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10"
          aria-label="Close"
          title="Close"
        >
          {Icons.close}
        </button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-[1198] bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="
          fixed inset-x-0 bottom-0 z-[1199]
          rounded-t-2xl border-t border-white/10
          bg-white dark:bg-zinc-900
          shadow-2xl
          max-h-[72vh] overflow-y-auto
        "
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto h-5 w-10 rounded-full bg-zinc-300/70 dark:bg-white/15 my-2" />
        {children}
      </div>
    </>
  );
}

function BasemapPanel({
  onSelect,
}: {
  onSelect: (s: "osm" | "light" | "dark" | "sat") => void;
}) {
  const [cur, setCur] = useState<"osm" | "light" | "dark" | "sat">(
    ((typeof window !== "undefined" &&
      localStorage.getItem("basemap_v1")) as any) || "dark"
  );

  const choose = (s: "osm" | "light" | "dark" | "sat") => {
    setCur(s);
    if (typeof window !== "undefined") localStorage.setItem("basemap_v1", s);
    onSelect(s);
  };

  const Item = ({
    id,
    label,
  }: {
    id: "osm" | "light" | "dark" | "sat";
    label: string;
  }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10">
      <span>{label}</span>
      <input
        type="radio"
        className="accent-blue-600"
        checked={cur === id}
        onChange={() => choose(id)}
      />
    </label>
  );

  return (
    <div className="grid gap-2">
      <Item id="light" label="Carto Light" />
      <Item id="dark" label="Carto Dark" />
      <Item id="osm" label="OpenStreetMap" />
      <Item id="sat" label="Satellite (Esri)" />
    </div>
  );
}

function LayersPanel({ adapter }: { adapter: LeafletAdapter }) {
  const [ports, setPorts] = useState<boolean>(
    () => localStorage.getItem("ly_ports") === "1"
  );
  const [anch, setAnch] = useState<boolean>(
    () => localStorage.getItem("ly_anchorages") === "1"
  );
  const [routes, setRoutes] = useState<boolean>(
    () => localStorage.getItem("ly_routes") === "1"
  );

  useEffect(() => {
    adapter.toggleLayer?.("ports", ports);
    localStorage.setItem("ly_ports", ports ? "1" : "0");
  }, [ports, adapter]);

  useEffect(() => {
    adapter.toggleLayer?.("anchorages", anch);
    localStorage.setItem("ly_anchorages", anch ? "1" : "0");
  }, [anch, adapter]);

  useEffect(() => {
    adapter.toggleLayer?.("routes", routes);
    localStorage.setItem("ly_routes", routes ? "1" : "0");
  }, [routes, adapter]);

  const Row = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10">
      <span>{label}</span>
      <input
        type="checkbox"
        className="accent-blue-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );

  return (
    <div className="grid gap-2">
      <Row label="Ports" checked={ports} onChange={setPorts} />
      <Row label="Anchorages" checked={anch} onChange={setAnch} />
      <Row label="Main routes" checked={routes} onChange={setRoutes} />
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Tip: toggle layers as needed. They are persisted.
      </div>
    </div>
  );
}

function ToolButton({
  title,
  onClick,
  icon,
  active,
}: {
  title?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      aria-pressed={!!active}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-md border transition
      ${
        active
          ? "bg-blue-600 text-white border-blue-500"
          : "bg-black/55 text-zinc-200 border-white/20 hover:bg-black/65"
      }`}
    >
      {icon}
    </button>
  );
}

function StatBox({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-1 rounded-md border bg-black/60 px-2 py-1 text-white dark:border-white/10">
      <div className="text-[10px] opacity-75">{title}</div>
      <div className="flex items-center gap-1 text-xs font-semibold">
        <span className="opacity-80">{icon}</span>
        {value}
      </div>
    </div>
  );
}

function ClickableStat({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="grid place-items-center gap-1 rounded-md border bg-black/60 px-2 py-1 text-white hover:bg-black/70 dark:border-white/10"
      title="Refresh now"
    >
      <div className="text-[10px] opacity-75">{title}</div>
      <div className="flex items-center gap-1 text-xs font-semibold">
        <span className="opacity-80">{icon}</span>
        {value}
      </div>
    </button>
  );
}

function MiniAction({
  label,
  icon,
  onClick,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-3 py-2 shadow-lg border
        ${
          active
            ? "bg-blue-600 text-white border-blue-500"
            : "bg-zinc-900/85 text-white border-white/20"
        }
      `}
    >
      <span className="grid h-5 w-5 place-items-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function formatK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.round(n / 1_000) + "K";
  return String(n);
}

const Icons = {
  map: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M9 3l6 2 6-2v18l-6 2-6-2-6 2V5l6-2z" strokeWidth="1.6" />
      <path d="M9 3v18M15 5v18" strokeWidth="1.2" />
    </svg>
  ),
  stack: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeWidth="1.6" />
      <path d="M21 12l-9 4.5L3 12" strokeWidth="1.2" />
    </svg>
  ),
  route: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M4 18c0-3 2-5 5-5h6a5 5 0 000-10" strokeWidth="1.6" />
      <circle cx="15" cy="3" r="2" fill="currentColor" />
      <circle cx="4" cy="18" r="2" fill="currentColor" />
    </svg>
  ),
  count: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 4.5-9 4.5L3 7.5z" />
    </svg>
  ),
  clock: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  ),
  fullscreen: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M8 3H3v5M21 8V3h-5M3 16v5h5M21 16v5h-5" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M12 5v14M5 12h14" strokeWidth="1.8" />
    </svg>
  ),
  close: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};
