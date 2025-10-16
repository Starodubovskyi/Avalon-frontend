"use client";

import { usePortsStore } from "./state";

export default function MapControls() {
  const {
    status,
    toggleStatus,
    clearStatus,
    radius,
    setRadius,
    density,
    toggleDensity,
  } = usePortsStore();
  const hasStatus = !!(status && status.size);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-850">
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          active={status?.has("Open")}
          onClick={() => toggleStatus("Open")}
          color="emerald"
        >
          Open
        </Chip>
        <Chip
          active={status?.has("Congested")}
          onClick={() => toggleStatus("Congested")}
          color="amber"
        >
          Congested
        </Chip>
        <Chip
          active={status?.has("Closed")}
          onClick={() => toggleStatus("Closed")}
          color="rose"
        >
          Closed
        </Chip>
        {hasStatus && (
          <button
            onClick={clearStatus}
            className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Radius</span>
          <input
            type="range"
            min={0}
            max={2000}
            step={10}
            value={radius?.km ?? 0}
            onChange={(e) =>
              setRadius({
                center: radius?.center ?? null,
                km: Number(e.target.value),
              })
            }
          />
          <span className="w-12 text-right tabular-nums">
            {radius?.km ?? 0}km
          </span>
          <button
            onClick={() => setRadius(null)}
            className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Clear
          </button>
        </div>
        <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
        <button
          onClick={toggleDensity}
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          {density === "cozy" ? "Cozy" : "Dense"}
        </button>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: "emerald" | "amber" | "rose";
}) {
  const map = {
    emerald: active
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    amber: active
      ? "bg-amber-600 text-white"
      : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    rose: active
      ? "bg-rose-600 text-white"
      : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  } as const;
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${map[color]}`}
    >
      {children}
    </button>
  );
}
