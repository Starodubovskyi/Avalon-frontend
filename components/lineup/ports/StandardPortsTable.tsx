"use client";

import type { PortLite } from "./mockPorts";
import { useMemo, useEffect, useRef, useState } from "react";
import { usePortsStore } from "./state";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Globe,
  Hash,
  Ship,
  Circle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

function isoFromUnlocode(unlocode?: string) {
  if (!unlocode || unlocode.length < 2) return null;
  const iso = unlocode.slice(0, 2).toLowerCase();
  return /^[a-z]{2}$/.test(iso) ? iso : null;
}
const flagImgUrl = (alpha2: string) =>
  alpha2
    ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${alpha2}.svg`
    : "";

/** флаг без next/image — конфиг не нужен */
function FlagImage({ iso, name }: { iso: string; name: string }) {
  const src = flagImgUrl(iso);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`${name} flag`}
      width={20}
      height={15}
      className="inline-block h-[15px] w-[20px] rounded-[2px] ring-1 ring-black/10"
      loading="lazy"
      onError={(e) =>
        ((e.currentTarget as HTMLImageElement).style.display = "none")
      }
    />
  );
}

export default function StandardPortsTable({ rows }: { rows: PortLite[] }) {
  const router = useRouter();
  const { selectedId, setSelectedId, sortKey, sortDir, setSort } =
    usePortsStore();

  const [copied, setCopied] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<PortLite>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <HeaderLabel icon={<MapPin className="h-4 w-4" />} label="Port" />
        ),
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md p-1.5 ring-1 ring-inset ${
                row.original.id === selectedId
                  ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800"
                  : "bg-neutral-50 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 opacity-70" />
            </span>
            <span className="font-semibold tracking-tight">
              {getValue<string>()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: () => (
          <HeaderLabel icon={<Globe className="h-4 w-4" />} label="Country" />
        ),
        cell: ({ row, getValue }) => {
          const unlocode = row.original.unlocode ?? "";
          const iso = isoFromUnlocode(unlocode);
          const name = getValue<string>() || (iso ? iso.toUpperCase() : "-");
          return (
            <div className="flex items-center gap-2">
              {iso ? <FlagImage iso={iso} name={name} /> : null}
              <span>{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "unlocode",
        header: () => (
          <HeaderLabel icon={<Hash className="h-4 w-4" />} label="UN/LOCODE" />
        ),
        cell: (info) => {
          const code = info.getValue<string>();
          const isCopied = copied === code;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(code);
                setCopied(code);
                window.setTimeout(() => setCopied(null), 1200);
              }}
              title="Copy UN/LOCODE"
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs transition
                ${
                  isCopied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                }`}
            >
              {isCopied ? "Copied" : code}
            </button>
          );
        },
      },
      {
        accessorKey: "arrivals",
        header: () => (
          <HeaderLabel icon={<Ship className="h-4 w-4" />} label="Arrivals" />
        ),
        cell: (info) => (info.getValue<number>() ?? 0).toLocaleString(),
      },
      {
        accessorKey: "status",
        header: () => (
          <HeaderLabel
            icon={<Circle className="h-3.5 w-3.5" />}
            label="Status"
          />
        ),
        cell: (info) => <StatusBadge value={info.getValue<any>()} />,
      },
    ],
    [copied, selectedId]
  );

  const sort: SortingState = useMemo(
    () => [{ id: sortKey, desc: sortDir === "desc" }],
    [sortKey, sortDir]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting: sort },
    onSortingChange: (updater) => {
      const next = (
        typeof updater === "function" ? updater(sort) : updater
      ) as SortingState;
      if (next[0]) setSort(next[0].id as any);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const trRefs = useRef<HTMLTableRowElement[]>([]);
  const { tableFocusIndex } = usePortsStore();

  useEffect(() => {
    if (tableFocusIndex >= 0 && table.getRowModel().rows[tableFocusIndex]) {
      const tr = trRefs.current[tableFocusIndex];
      tr?.scrollIntoView({ block: "nearest" });
      const row = table.getRowModel().rows[tableFocusIndex].original;
      setSelectedId(row.id);
    }
  }, [tableFocusIndex, table, setSelectedId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white text-neutral-700 shadow-sm dark:bg-neutral-900 dark:text-neutral-300">
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold [&>th]:select-none"
              >
                {hg.headers.map((h, i) => {
                  const sorted = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className={`cursor-pointer ${
                        i === 0
                          ? "sticky left-0 z-20 bg-white dark:bg-neutral-900"
                          : ""
                      }`}
                    >
                      <div className="inline-flex items-center gap-2">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <span className="text-neutral-400 dark:text-neutral-500">
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                          )}
                        </span>
                      </div>
                    </th>
                  );
                })}
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
                  No ports found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((r, idx) => {
                const active = r.original.id === selectedId;
                return (
                  <tr
                    key={r.id}
                    ref={(el) => {
                      if (el) trRefs.current[idx] = el;
                    }}
                    title="Double-click to open port"
                    onClick={() => setSelectedId(r.original.id)}
                    onDoubleClick={() =>
                      router.push(`/lineup/ports/${r.original.id}`)
                    }
                    className={`cursor-pointer transition
                      odd:bg-neutral-50/40 even:bg-white hover:bg-neutral-50
                      dark:odd:bg-neutral-800/30 dark:even:bg-neutral-900 dark:hover:bg-neutral-800
                      ${active ? "bg-neutral-100 dark:bg-neutral-800/70" : ""}
                    `}
                  >
                    {r.getVisibleCells().map((c, i) => (
                      <td
                        key={c.id}
                        className={`px-4 py-3 align-middle ${
                          i === 0
                            ? `sticky left-0 z-10 bg-inherit ${
                                active ? "border-l-4 border-emerald-500" : ""
                              }`
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
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Prev
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-neutral-200 bg-white px-2 py-1 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ——— маленькие подкомпоненты ——— */

function HeaderLabel({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </span>
  );
}

function StatusBadge({ value }: { value: PortLite["status"] }) {
  const map = {
    Open: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/10 dark:text-emerald-300 dark:bg-emerald-900/30 dark:ring-emerald-400/10",
    Congested:
      "text-amber-700 bg-amber-50 ring-1 ring-amber-600/10 dark:text-amber-300 dark:bg-amber-900/30 dark:ring-amber-400/10",
    Closed:
      "text-rose-700 bg-rose-50 ring-1 ring-rose-600/10 dark:text-rose-300 dark:bg-rose-900/30 dark:ring-rose-400/10",
  } as const;

  const dot = {
    Open: "bg-emerald-500",
    Congested: "bg-amber-500",
    Closed: "bg-rose-500",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${map[value]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[value]}`} />
      {value}
    </span>
  );
}
