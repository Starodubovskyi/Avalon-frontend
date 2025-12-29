"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import ColumnsDropdown from "./columnsDropdown";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

import { getCurrentSubscription } from "@/components/types/billing/subscription";
import { getPlanById } from "@/components/types/billing/plan";

type ColumnKey =
  | "flag"
  | "port"
  | "unlocode"
  | "photoUrl"
  | "timezone"
  | "vessels"
  | "arrivals"
  | "departures"
  | "expectedArrivals"
  | "anchorage"
  | "geoArea1"
  | "geoArea2"
  | "coverage";

export interface PortsTableProps {
  rows: any[];
  search?: string;
  filters?: Record<string, string>;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onEdit: (row: any) => void;
  onDelete: (id: string) => void;
  className?: string;
  onExportCsv?: (csv: string) => void;
}

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "flag", label: "Flag" },
  { key: "port", label: "Port" },
  { key: "unlocode", label: "UNLOCODE" },
  { key: "photoUrl", label: "Photo" },
  { key: "timezone", label: "Local time" },
  { key: "vessels", label: "Vessels in port" },
  { key: "arrivals", label: "Arrivals (last 24hrs)" },
  { key: "departures", label: "Departures" },
  { key: "expectedArrivals", label: "Expected arrivals" },
  { key: "anchorage", label: "Related anchorage" },
  { key: "geoArea1", label: "Area global" },
  { key: "geoArea2", label: "Area local" },
  { key: "coverage", label: "Coverage" },
];

const toAlpha2 = (val?: string) => {
  if (!val) return "";
  const s = val.trim();
  if (s.length === 2) return s.toLowerCase();
  const c = countries.getAlpha2Code(s, "en");
  return (c || "").toLowerCase();
};
const flagUrl = (a2: string) =>
  a2 ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${a2}.svg` : "";

function openPortCache(row: any) {
  try {
    localStorage.setItem(`port:${row.id}`, JSON.stringify(row));
    const prev = JSON.parse(localStorage.getItem("public:ports") || "[]");
    const map = new Map(prev.map((it: any) => [String(it.id), it]));
    map.set(String(row.id), row);
    localStorage.setItem(
      "public:ports",
      JSON.stringify(Array.from(map.values()))
    );
  } catch {}
}

export default function PortsTable({
  rows,
  search = "",
  filters = {},
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  className,
  onExportCsv,
}: PortsTableProps) {
  const { toast } = useToast();

  const [hasEnterprise, setHasEnterprise] = useState(false);
  useEffect(() => {
    const refreshPlan = () => {
      try {
        const sub = getCurrentSubscription?.();
        if (!sub) return setHasEnterprise(false);
        const plan = getPlanById?.(sub.planId);
        const name = plan?.name || "";
        const id = (plan as any)?.id || sub.planId;
        const slug = (plan as any)?.slug;
        const enterprise =
          name === "Maritime Enterprise" ||
          id === "enterprise" ||
          slug === "enterprise";
        setHasEnterprise(Boolean(enterprise));
      } catch {
        setHasEnterprise(false);
      }
    };
    refreshPlan();
    window.addEventListener("storage", refreshPlan);
    window.addEventListener("billing:change", refreshPlan as EventListener);
    return () => {
      window.removeEventListener("storage", refreshPlan);
      window.removeEventListener(
        "billing:change",
        refreshPlan as EventListener
      );
    };
  }, []);

  const filtered = useMemo(() => {
    let data = [...rows];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        Object.values(r).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }
    for (const [k, v] of Object.entries(filters)) {
      if (!v) continue;
      data = data.filter((r) =>
        String(r[k] ?? "")
          .toLowerCase()
          .includes(String(v).toLowerCase())
      );
    }
    return data;
  }, [rows, search, filters]);

  const toggleOne = (id: string) =>
    selectedIds.includes(id)
      ? setSelectedIds(selectedIds.filter((x) => x !== id))
      : setSelectedIds([...selectedIds, id]);

  const toggleAll = () =>
    selectedIds.length === filtered.length
      ? setSelectedIds([])
      : setSelectedIds(filtered.map((r: any) => r.id));

  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>({
    flag: true,
    port: true,
    unlocode: true,
    photoUrl: true,
    timezone: true,
    vessels: true,
    arrivals: true,
    departures: true,
    expectedArrivals: true,
    anchorage: true,
    geoArea1: true,
    geoArea2: true,
    coverage: true,
  });
  const cols = ALL_COLUMNS.filter((c) => visible[c.key]);

  const exportCSV = () => {
    const rowsCsv = filtered.map((r) => ({
      flagCode: toAlpha2(r.country)?.toUpperCase() || "",
      port: r.port || "",
      unlocode: r.unlocode || "",
      photoUrl: r.photoUrl || "",
      timezone: r.timezone || "",
      vessels: r.vessels ?? "",
      arrivals: r.arrivals ?? "",
      departures: r.departures ?? "",
      expectedArrivals: r.expectedArrivals ?? "",
      anchorage: r.anchorage ?? "",
      geoArea1: r.geoArea1 ?? "",
      geoArea2: r.geoArea2 ?? "",
      coverage: r.coverage ?? "",
    }));
    const headers = Object.keys(rowsCsv[0] || {});
    const csv = [
      headers.join(","),
      ...rowsCsv.map((rr: any) =>
        headers
          .map((h) => `"${String(rr[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    if (onExportCsv) onExportCsv(csv);
    else {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ports.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const Kebab = ({ row, enterprise }: { row: any; enterprise: boolean }) => {
    const fire = (msg: string) => toast({ title: msg });
    return (
      <div className="relative">
        <details className="group">
          <summary className="list-none cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 16a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-xl py-1 z-10">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              onClick={() => fire("Preview clicked")}
            >
              Preview
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              onClick={() => fire("Details clicked")}
            >
              Details
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              onClick={() => fire("Duplicate clicked")}
            >
              Duplicate
            </button>
            <button className="w-full text-left px-4 py-2 text-sm opacity-50 cursor-not-allowed text-gray-500">
              Archive 🔒
            </button>
            {enterprise && (
              <>
                <div className="h-px bg-gray-100 dark:bg-white/10 my-1" />
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400"
                  onClick={() => onDelete(row.id)}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </details>
      </div>
    );
  };

  const MobileList = () => (
    <div className="md:hidden grid gap-4">
      {filtered.map((r) => {
        const a2 = toAlpha2(r.country);
        const f = flagUrl(a2);
        return (
          <div
            key={r.id}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <img
                src={r.photoUrl}
                alt={r.port}
                className="w-16 h-16 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleOne(r.id)}
                      className="form-checkbox rounded text-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      {a2 ? (
                        <img
                          src={f}
                          alt={r.country}
                          className="w-5 h-4 rounded-sm ring-1 ring-black/10 shadow-sm"
                          onError={(e) =>
                            ((
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none")
                          }
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      <Link
                        href={`/ports/${r.id}`}
                        onClick={() => openPortCache(r)}
                        className="font-semibold truncate hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-900 dark:text-white transition-colors"
                        title="Open port profile"
                      >
                        {r.port}
                      </Link>
                    </div>
                  </div>
                  <Kebab row={r} enterprise={hasEnterprise} />
                </div>

                <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                  <div className="flex justify-between gap-2">
                    <span className="opacity-70">UNLOCODE</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {r.unlocode || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="opacity-70">Local time</span>
                    <span className="font-medium truncate text-gray-800 dark:text-gray-200">
                      {r.timezone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="opacity-70">Vessels</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {r.vessels ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="opacity-70">Arrivals (24h)</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {r.arrivals ?? "-"}
                    </span>
                  </div>
                  {/* ... other fields can be added similarly */}
                </div>

                {hasEnterprise && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex gap-2">
                    <button
                      onClick={() => onEdit(r)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm shadow-md shadow-red-500/20 active:scale-[0.98] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="px-1 pt-1 text-xs text-center text-gray-500 dark:text-gray-400">
        Shown: {filtered.length} / {rows.length}
      </div>
    </div>
  );

  const DesktopTable = () => (
    <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
        <ColumnsDropdown
          allColumns={ALL_COLUMNS}
          visible={visible}
          onToggle={(key: ColumnKey) =>
            setVisible((p) => ({ ...p, [key]: !p[key] }))
          }
        />
        <button
          onClick={exportCSV}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white text-sm shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm text-left">
          <thead className="uppercase bg-slate-50 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-400 text-xs font-semibold tracking-wide">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === filtered.length
                  }
                  onChange={toggleAll}
                  className="form-checkbox rounded text-indigo-500 focus:ring-indigo-500"
                />
              </th>
              {cols.map((c) => (
                <th key={c.key} className="px-4 py-3 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const a2 = toAlpha2(r.country);
              const f = flagUrl(a2);
              return (
                <tr
                  key={r.id}
                  className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleOne(r.id)}
                      className="form-checkbox rounded text-indigo-500 focus:ring-indigo-500"
                    />
                  </td>
                  {cols.map(({ key }) => {
                    if (key === "flag") {
                      return (
                        <td key={key} className="px-4 py-3">
                          {a2 ? (
                            <img
                              src={f}
                              alt={r.country}
                              className="w-6 h-5 rounded-sm ring-1 ring-black/10 shadow-sm"
                              loading="lazy"
                              onError={(e) =>
                                ((
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none")
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    }
                    if (key === "photoUrl") {
                      return (
                        <td key={key} className="px-4 py-3">
                          <img
                            src={r.photoUrl}
                            alt={r.port}
                            className="w-16 h-12 object-cover rounded-lg ring-1 ring-black/5 shadow-sm"
                            onError={(e) =>
                              ((
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none")
                            }
                          />
                        </td>
                      );
                    }
                    if (key === "port") {
                      return (
                        <th
                          key={key}
                          scope="row"
                          className="px-4 py-3 font-medium whitespace-nowrap"
                        >
                          <Link
                            href={`/ports/${r.id}`}
                            onClick={() => openPortCache(r)}
                            className="text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Open port profile"
                          >
                            {r.port}
                          </Link>
                        </th>
                      );
                    }
                    return (
                      <td
                        key={key}
                        className="px-4 py-3 text-slate-600 dark:text-slate-300"
                      >
                        {r[key] ?? "-"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {hasEnterprise && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => onEdit(r)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/20 active:scale-[0.98] transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <Kebab row={r} enterprise={hasEnterprise} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 flex justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-transparent border-t border-slate-200 dark:border-white/10">
        <span>Selected: {selectedIds.length}</span>
        <span>
          Shown: {filtered.length} / {rows.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <MobileList />
      <DesktopTable />
    </div>
  );
}
