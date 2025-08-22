"use client";

import { useEffect, useMemo, useState } from "react";
import type { LeafletAdapter } from "@/components/map/adapters/LeafletAdapter";

export default function RightDock({ adapter }: { adapter: LeafletAdapter }) {
  const [open, setOpen] = useState<null | "basemap" | "layers" | "route">(null);
  const [visible, setVisible] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [routeOn, setRouteOn] = useState(false);

  useEffect(() => {
    const update = () => setVisible(adapter.getVisibleCount());
    update();
    const off = adapter.onMove(update);
  
  }, [adapter]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const toggleFullscreen = async () => {
    const el = adapter.getContainer();
    const doc: any = document;
    if (!document.fullscreenElement) {
      await (el.requestFullscreen?.() || (el as any).webkitRequestFullscreen?.());
    } else {
      await (doc.exitFullscreen?.() || doc.webkitExitFullscreen?.());
    }
  };

  return (
    <>
      <div className="absolute right-2 top-2 z-[1200] flex flex-col gap-2">
        <ToolButton
          title="Basemap"
          active={open === "basemap"}
          onClick={() => setOpen(open === "basemap" ? null : "basemap")}
          icon={Icons.map}
        />
        <ToolButton
          title="Layers"
          active={open === "layers"}
          onClick={() => setOpen(open === "layers" ? null : "layers")}
          icon={Icons.stack}
        />
        <ToolButton
          title={routeOn ? "Route tool: ON" : "Route tool"}
          active={routeOn || open === "route"}
          onClick={() => {
            if (!routeOn) {
              adapter.enableRouteTool(() => {});
              setRouteOn(true);
            } else {
              adapter.disableRouteTool();
              setRouteOn(false);
            }
            setOpen(null);
          }}
          icon={Icons.route}
        />

        <div className="mt-2 grid gap-2">
          <StatBox title="Visible" value={formatK(visible)} icon={Icons.count} />
          <ClickableStat
            title="Since update"
            value={`${seconds}s`}
            icon={Icons.clock}
            onClick={() => {
              adapter.refresh();
              setSeconds(0);
            }}
          />
          <ToolButton title="Fullscreen" onClick={toggleFullscreen} icon={Icons.fullscreen} />
        </div>
      </div>

      {open && (
        <div className="absolute right-12 top-2 z-[1200] w-[min(320px,90vw)] max-h-[calc(100%-16px)] overflow-y-auto rounded-xl border bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
          {open === "basemap" && <BasemapPanel onSelect={(s) => { adapter.setBasemap(s); setOpen(null); }} />}
          {open === "layers" && <LayersPanel adapter={adapter} />}
        </div>
      )}
    </>
  );
}


function BasemapPanel({ onSelect }: { onSelect: (s: "osm" | "light" | "dark" | "sat") => void }) {
  const [cur, setCur] = useState<"osm" | "light" | "dark" | "sat">(
    (localStorage.getItem("basemap_v1") as any) || "dark"
  );
  const choose = (s: "osm" | "light" | "dark" | "sat") => {
    setCur(s);
    localStorage.setItem("basemap_v1", s);
    onSelect(s);
  };
  const Item = ({ id, label }: { id: any; label: string }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10">
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
    <div>
      <div className="mb-2 text-sm font-semibold">Basemap</div>
      <div className="grid gap-2">
        <Item id="light" label="Carto Light" />
        <Item id="dark" label="Carto Dark" />
        <Item id="osm" label="OpenStreetMap" />
        <Item id="sat" label="Satellite (Esri)" />
      </div>
    </div>
  );
}

function LayersPanel({ adapter }: { adapter: LeafletAdapter }) {
  const [ports, setPorts] = useState<boolean>(() => localStorage.getItem("ly_ports") === "1");
  const [anch, setAnch] = useState<boolean>(() => localStorage.getItem("ly_anchorages") === "1");
  const [routes, setRoutes] = useState<boolean>(() => localStorage.getItem("ly_routes") === "1");

  useEffect(() => {
    adapter.toggleLayer("ports", ports);
    localStorage.setItem("ly_ports", ports ? "1" : "0");
  }, [ports, adapter]);
  useEffect(() => {
    adapter.toggleLayer("anchorages", anch);
    localStorage.setItem("ly_anchorages", anch ? "1" : "0");
  }, [anch, adapter]);
  useEffect(() => {
    adapter.toggleLayer("routes", routes);
    localStorage.setItem("ly_routes", routes ? "1" : "0");
  }, [routes, adapter]);

  const Row = ({ label, checked, onChange }: any) => (
    <label className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/10">
      <span>{label}</span>
      <input type="checkbox" className="accent-blue-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );

  return (
    <div>
      <div className="mb-2 text-sm font-semibold">Layers</div>
      <div className="grid gap-2">
        <Row label="Ports" checked={ports} onChange={setPorts} />
        <Row label="Anchorages" checked={anch} onChange={setAnch} />
        <Row label="Main routes" checked={routes} onChange={setRoutes} />
      </div>
      <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Tip: toggle layers as needed. They are persisted.</div>
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
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-md border backdrop-blur transition
      ${active ? "bg-blue-600 text-white border-blue-500" : "bg-black/55 text-zinc-200 border-white/20 hover:bg-black/65"}`}
    >
      {icon}
    </button>
  );
}

function StatBox({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
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

function formatK(n: number) {
  if (n >= 1000000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return Math.round(n / 1000) + "K";
  return String(n);
}

const Icons = {
  map: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M9 3l6 2 6-2v18l-6 2-6-2-6 2V5l6-2z" strokeWidth="1.6"/>
      <path d="M9 3v18M15 5v18" strokeWidth="1.2"/>
    </svg>
  ),
  stack: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeWidth="1.6"/>
      <path d="M21 12l-9 4.5L3 12" strokeWidth="1.2"/>
    </svg>
  ),
  route: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 18c0-3 2-5 5-5h6a5 5 0 000-10" strokeWidth="1.6"/>
      <circle cx="15" cy="3" r="2" fill="currentColor"/>
      <circle cx="4" cy="18" r="2" fill="currentColor"/>
    </svg>
  ),
  count: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 4.5-9 4.5L3 7.5z"/></svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
  ),
  fullscreen: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 3H3v5M21 8V3h-5M3 16v5h5M21 16v5h-5"/></svg>
  ),
};
