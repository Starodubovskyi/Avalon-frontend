"use client";

import { Star } from "lucide-react";
import { useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useLiquidStore } from "./state";
import { alpha2FromVessel, flagImgUrl } from "./utils";

function etaText(v: any) {
  if (!v?.reportedETA) return "—";
  try {
    const d = new Date(v.reportedETA);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return v.reportedETA;
  }
}
function cargoText(v: any) {
  const t = v?.cargo?.type;
  const g = v?.cargo?.grade;
  const q = v?.cargo?.qty;
  const u = v?.cargo?.unit;
  const qty =
    typeof q === "number" ? ` • ${q.toLocaleString()}${u ? " " + u : ""}` : "";
  return [t, g].filter(Boolean).join(" • ") + qty;
}
function routeText(v: any) {
  return `${v.currentPort ?? "—"} → ${
    v.destinationPort ?? v.reportedDestination ?? "—"
  }`;
}

export function LiquidTable() {
  const router = useRouter();
  const {
    filtered,
    selectedId,
    setSelectedId,
    openPreview,
    watchlist,
    toggleWatch,
  } = useLiquidStore();

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "wl",
        header: "",
        cell: ({ row }) => {
          const id = String(row.original.id);
          const inWl = watchlist.has(id);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatch(id);
              }}
              title={inWl ? "Remove from Watchlist" : "Add to Watchlist"}
              className={`rounded-md p-1 transition ${
                inWl
                  ? "text-yellow-500"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              }`}
            >
              <Star
                className="h-4 w-4"
                fill={inWl ? "currentColor" : "none"}
                strokeWidth={inWl ? 1 : 2}
              />
            </button>
          );
        },
        size: 24,
      },
      {
        accessorKey: "flag",
        header: "",
        cell: ({ row }) => {
          const a2 = alpha2FromVessel(row.original);
          const src = flagImgUrl(a2);
          return src ? (
            <img
              src={src}
              alt={row.original.flag || a2?.toUpperCase() || "flag"}
              className="h-[15px] w-[20px] rounded-[2px] ring-1 ring-black/10"
              loading="lazy"
            />
          ) : (
            <span className="text-neutral-400">—</span>
          );
        },
        size: 28,
      },
      {
        accessorKey: "name",
        header: "Vessel",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <img
              src={row.original.photoUrl}
              alt={row.original.name}
              className="h-8 w-11 rounded-md object-cover ring-1 ring-black/5"
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).style.display = "none")
              }
            />
            <span className="font-semibold">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "vesselType", header: "Type" },
      {
        id: "cargo",
        header: "Cargo",
        cell: ({ row }) => (
          <span className="truncate">{cargoText(row.original)}</span>
        ),
      },
      {
        id: "route",
        header: "Route",
        cell: ({ row }) => (
          <span className="truncate">{routeText(row.original)}</span>
        ),
      },
      {
        id: "eta",
        header: "ETA",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {etaText(row.original)}
            {typeof row.original.etaConfH === "number" ? (
              <span className="text-xs text-neutral-500">
                {" "}
                ±{row.original.etaConfH}h
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: "zone",
        header: "Zone / Operation",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge value={row.original.zone} />
            <span className="text-xs text-neutral-500">
              {row.original.operation ?? "—"}
            </span>
          </div>
        ),
      },
      {
        id: "spd",
        header: "Speed / Draft",
        cell: ({ row }) => {
          const v = row.original;
          const sp =
            typeof v.speed === "number" ? `${v.speed.toFixed(1)} kn` : "—";
          const dr =
            v.draft?.current && v.draft?.max
              ? `${v.draft.current.toFixed(1)}/${v.draft.max.toFixed(1)} m`
              : "—";
          return (
            <span className="whitespace-nowrap text-neutral-700 dark:text-neutral-300">
              {sp} • {dr}
            </span>
          );
        },
      },
    ],
    [toggleWatch, watchlist]
  );

  const sort: SortingState = useMemo(() => [{ id: "eta", desc: false }], []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting: sort },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const trRefs = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    if (!selectedId) return;
    const el = document.querySelector<HTMLDivElement>(
      `[data-row-id="${selectedId}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 text-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-semibold [&>th]:select-none"
              >
                {hg.headers.map((h) => (
                  <th key={h.id}>
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === "asc"
                        ? "▲"
                        : h.column.getIsSorted() === "desc"
                        ? "▼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400"
                >
                  No liquid vessels found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((r, idx) => {
                const v = r.original;
                const active = v.id === selectedId;
                return (
                  <tr
                    key={r.id}
                    data-row-id={v.id}
                    ref={(el) => {
                      if (el) trRefs.current[idx] = el;
                    }}
                    onClick={() => {
                      setSelectedId(v.id);
                      openPreview(v.id);
                    }}
                    onDoubleClick={() => {
                      try {
                        localStorage.setItem(
                          `vessel:${v.id}`,
                          JSON.stringify(v)
                        );
                      } catch {}
                      router.push(`/vessels/${v.id}`);
                    }}
                    className={`cursor-pointer transition
                      odd:bg-neutral-50/40 hover:bg-neutral-50
                      dark:odd:bg-neutral-900/60 dark:hover:bg-neutral-800
                      ${active ? "bg-neutral-100 dark:bg-neutral-800/70" : ""}
                    `}
                    title="Double-click to open vessel"
                  >
                    {r.getVisibleCells().map((c, i) => (
                      <td
                        key={c.id}
                        className={`px-3 py-3 ${
                          i === 0 && active
                            ? "border-l-4 border-emerald-500"
                            : ""
                        }`}
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
        <div>Rows: {table.getRowModel().rows.length}</div>
        <div className="space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const val = String(value ?? "").toLowerCase();
  const map: Record<string, string> = {
    port: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/10 dark:text-emerald-300 dark:bg-emerald-900/30 dark:ring-emerald-700/20",
    anchorage:
      "text-amber-700 bg-amber-50 ring-1 ring-amber-600/10 dark:text-amber-300 dark:bg-amber-900/30 dark:ring-amber-700/20",
    approach:
      "text-neutral-700 bg-neutral-100 ring-1 ring-neutral-600/10 dark:text-neutral-300 dark:bg-neutral-800/50 dark:ring-neutral-700/20",
  };
  const cls =
    map[val] ||
    "text-neutral-700 bg-neutral-100 ring-1 ring-neutral-600/10 dark:text-neutral-300 dark:bg-neutral-800/50";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}
    >
      {value ?? "—"}
    </span>
  );
}
