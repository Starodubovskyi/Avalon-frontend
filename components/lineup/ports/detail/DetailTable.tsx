"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Crosshair, ChevronDown, ChevronRight } from "lucide-react";
import type { VesselCall } from "./mockPortCalls";

const VESSEL_PAGE_BASE = "/vessels";

type Props = {
  rows: VesselCall[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  sortKey: "name" | "status" | "vesselType" | "eta" | "cargoQty" | "waitingH";
  sortDir: "asc" | "desc";
  onSort: (k: Props["sortKey"]) => void;
};

export default function DetailTable({
  rows,
  selectedId,
  onSelect,
  sortKey,
  sortDir,
  onSort,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            <tr className="[&>th]:px-3 [&>th]:py-3 [&>th]:font-semibold">
              <th className="w-8"></th>
              <Th
                label="Vessel"
                k="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <Th
                label="Type"
                k="vesselType"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <Th
                label="Status"
                k="status"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th>Zone / Berth</th>
              <th>Cargo</th>
              <th>Operation</th>
              <Th
                label="ETA"
                k="eta"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <Th
                label="Waiting (h)"
                k="waitingH"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={onSort}
              />
              <th>Draft (m)</th>
              <th>Speed/Course</th>
              <th>DWT</th>
              <th className="w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400"
                >
                  No vessels match your filters
                </td>
              </tr>
            ) : (
              rows.map((v) => {
                const active = v.id === selectedId;
                const expanded = v.id === expandedId;
                return (
                  <>
                    <tr
                      key={v.id}
                      onClick={() => onSelect?.(v.id)}
                      onDoubleClick={() =>
                        router.push(`${VESSEL_PAGE_BASE}/${v.id}`)
                      }
                      className={`cursor-pointer transition hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                        active ? "bg-neutral-100 dark:bg-neutral-800/60" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <button
                          aria-label="Expand row"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expanded ? null : v.id);
                          }}
                          className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-medium">
                        <div className="flex flex-col">
                          <span>
                            {v.name}{" "}
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              ({v.flag})
                            </span>
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            IMO {v.imo}
                            {v.mmsi ? ` • MMSI ${v.mmsi}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">{v.vesselType}</td>
                      <td className="px-3 py-3">
                        <StatusBadge value={v.status} />
                      </td>
                      <td className="px-3 py-3">
                        {v.berth ? (
                          <span className="font-medium">{v.berth}</span>
                        ) : (
                          v.zone ?? "—"
                        )}
                        {typeof v.queue === "number" && (
                          <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            Queue #{v.queue}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {v.cargo.type}
                        {v.cargo.grade ? ` • ${v.cargo.grade}` : ""}
                        {v.cargo.qty
                          ? ` • ${v.cargo.qty}${v.cargo.unit ?? ""}`
                          : ""}
                      </td>
                      <td className="px-3 py-3">{v.operation ?? "—"}</td>
                      <td className="px-3 py-3">
                        {v.eta ? new Date(v.eta).toLocaleString() : "—"}
                        {typeof v.etaConfH === "number" && (
                          <span className="ml-1 text-xs text-neutral-500">
                            ±{v.etaConfH}h
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {typeof v.waitingH === "number"
                          ? v.waitingH.toFixed(1)
                          : "—"}
                      </td>
                      <td className="px-3 py-3">
                        {v.draft?.current ?? "—"}
                        {v.draft?.max ? ` / ${v.draft.max}` : ""}
                      </td>
                      <td className="px-3 py-3">
                        {typeof v.speed === "number"
                          ? `${v.speed.toFixed(1)} kn`
                          : "—"}
                        {typeof v.course === "number"
                          ? ` / ${Math.round(v.course)}°`
                          : ""}
                      </td>
                      <td className="px-3 py-3">
                        {v.dwt ? v.dwt.toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect?.(v.id);
                            }}
                            title="Center on map"
                            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <Crosshair className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(String(v.imo));
                            }}
                            title="Copy IMO"
                            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <tr className="bg-neutral-50/50 dark:bg-neutral-800/40">
                        <td colSpan={13} className="px-6 py-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Info
                              title="Route"
                              value={`${v.route.origin} → ${v.route.dest}`}
                            />
                            <Info
                              title="Time in port"
                              value={v.timeInPortH ? `${v.timeInPortH} h` : "—"}
                            />
                            <Info
                              title="ETD"
                              value={
                                v.etd ? new Date(v.etd).toLocaleString() : "—"
                              }
                            />

                            <Info
                              title="LOA × Beam"
                              value={`${v.loa ?? "—"} m × ${v.beam ?? "—"} m`}
                            />
                            <Info
                              title="DWT"
                              value={
                                v.dwt ? `${v.dwt.toLocaleString()} t` : "—"
                              }
                            />
                            <Info
                              title="Draft (cur/max)"
                              value={`${v.draft?.current ?? "—"} / ${
                                v.draft?.max ?? "—"
                              } m`}
                            />

                            <Info
                              title="Zone / Berth"
                              value={`${v.zone ?? "—"}${
                                v.berth ? ` / ${v.berth}` : ""
                              }`}
                            />
                            <Info
                              title="Queue position"
                              value={
                                typeof v.queue === "number"
                                  ? `#${v.queue}`
                                  : "—"
                              }
                            />
                            <Info
                              title="Data source"
                              value={`${v.source ?? "—"} • ${new Date(
                                v.updatedAt
                              ).toLocaleString()}`}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400">
        Tip: single-click selects;{" "}
        <strong>double-click opens vessel page</strong>; use the crosshair to
        center the map.
      </div>
    </div>
  );
}

function Th({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  k: Props["sortKey"];
  sortKey: Props["sortKey"];
  sortDir: Props["sortDir"];
  onSort: (key: Props["sortKey"]) => void;
}) {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onSort(k)}
      className="select-none cursor-pointer"
      title={`Sort by ${label}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "asc" ? (
            "▲"
          ) : (
            "▼"
          )
        ) : (
          <span className="inline-block h-4 w-4" />
        )}
      </span>
    </th>
  );
}

function StatusBadge({ value }: { value: VesselCall["status"] }) {
  const map = {
    "In Port":
      "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-300",
    "At Anchor":
      "bg-amber-100 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-900/30 dark:text-amber-300",
    Inbound:
      "bg-sky-100 text-sky-700 ring-1 ring-sky-600/10 dark:bg-sky-900/30 dark:text-sky-300",
    Outbound:
      "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-600/10 dark:bg-neutral-800/40 dark:text-neutral-300",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[value]}`}
    >
      {value}
    </span>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {title}
      </div>
      <div className="mt-1 font-medium text-neutral-800 dark:text-neutral-200">
        {value}
      </div>
    </div>
  );
}
