"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useRouter } from "next/navigation";

import { getCurrentSubscription } from "@/components/types/billing/subscription";
import { getPlanById } from "@/components/types/billing/plan";

countries.registerLocale(enLocale);

interface VesselsTableProps {
  filters: Record<string, string>;
  searchQuery: string;
  vessels: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onEdit: (vessel: any) => void;
  onDelete: (id: string) => void;
}

type ColumnKey =
  | "flag"
  | "name"
  | "photoUrl"
  | "destinationPort"
  | "reportedETA"
  | "reportedDestination"
  | "currentPort"
  | "imo"
  | "vesselType"
  | "mapIcon"
  | "latestPositionTime"
  | "latitude"
  | "longitude"
  | "myNotes";

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "flag", label: "Flag" },
  { key: "name", label: "Vessel Name" },
  { key: "photoUrl", label: "Photos" },
  { key: "destinationPort", label: "Destination Port" },
  { key: "reportedETA", label: "Reported ETA" },
  { key: "reportedDestination", label: "Reported Destination" },
  { key: "currentPort", label: "Current Port" },
  { key: "imo", label: "IMO" },
  { key: "vesselType", label: "Vessel Type" },
  { key: "mapIcon", label: "Map Icon" },
  { key: "latestPositionTime", label: "Latest Position Time" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "myNotes", label: "My Notes" },
];

const OVERRIDES_KEY = "admin:vessels:overrides";
const RI_BASE = 0x1f1e6;

/* -------------------- Flag helpers (как в таблице портов) -------------------- */

function toCodePoints(str: string): number[] {
  const cps: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const hi = str.charCodeAt(i);
    if (hi >= 0xd800 && hi <= 0xdbff && i + 1 < str.length) {
      const lo = str.charCodeAt(++i);
      cps.push(((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000);
    } else {
      cps.push(hi);
    }
  }
  return cps;
}
function isFlagEmoji(str: string) {
  if (!str) return false;
  const cps = toCodePoints(str);
  if (cps.length !== 2) return false;
  const inRange = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff;
  return inRange(cps[0]) && inRange(cps[1]);
}
function emojiToAlpha2(emoji?: string): string | undefined {
  if (!emoji) return;
  const cps = toCodePoints(emoji).filter(
    (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff
  );
  if (cps.length < 2) return;
  const a = String.fromCharCode(cps[0] - RI_BASE + 0x41);
  const b = String.fromCharCode(cps[1] - RI_BASE + 0x41);
  const code = `${a}${b}`.toLowerCase();
  return /^[a-z]{2}$/.test(code) ? code : undefined;
}
function nameToAlpha2(country?: string): string {
  if (!country) return "";
  const c = country.trim();
  if (isFlagEmoji(c)) return emojiToAlpha2(c) || "";
  if (/^[A-Za-z]{2}$/.test(c)) return c.toLowerCase();
  const code = countries.getAlpha2Code(c, "en");
  return (code || "").toLowerCase();
}
const flagImgUrl = (alpha2: string) =>
  alpha2
    ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${alpha2}.svg`
    : "";

/** <-- ГЛАВНОЕ: откуда брать код страны для судна */
function alpha2FromVessel(v: any): string {
  return (
    emojiToAlpha2(v.flagEmoji) ||
    nameToAlpha2(v.country) ||
    nameToAlpha2(v.flag) || // поддержка поля `flag` из моков
    ""
  );
}

/* -------------------- storage helpers -------------------- */

function readOverrides(): any[] {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeOverrides(arr: any[]) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(arr));
  window.dispatchEvent(new Event("vessels:changed"));
}
function mergeVessels(base: any[], overrides: any[]) {
  const map = new Map<string, any>();
  base.forEach((v) => map.set(v.id, v));
  overrides.forEach((ov) => {
    const prev = map.get(ov.id) || { id: ov.id };
    map.set(ov.id, { ...prev, ...ov });
  });
  return Array.from(map.values());
}
function syncPublicCaches(id: string, patch: any) {
  try {
    const listRaw = localStorage.getItem("public:vessels");
    if (listRaw) {
      const list = JSON.parse(listRaw);
      const idx = list.findIndex((x: any) => x.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch };
        localStorage.setItem("public:vessels", JSON.stringify(list));
      }
    }
    const oneRaw = localStorage.getItem(`vessel:${id}`);
    if (oneRaw) {
      const one = JSON.parse(oneRaw);
      localStorage.setItem(
        `vessel:${id}`,
        JSON.stringify({ ...one, ...patch })
      );
    }
  } catch {}
}
function savePatch(id: string, patch: any) {
  const data = readOverrides();
  const idx = data.findIndex((x) => x.id === id);
  if (idx >= 0) data[idx] = { ...data[idx], ...patch, id };
  else data.push({ id, ...patch });
  writeOverrides(data);
  syncPublicCaches(id, patch);
}

/* -------------------- Component -------------------- */

const VesselsTable: React.FC<VesselsTableProps> = ({
  filters,
  searchQuery,
  vessels,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
}) => {
  const { toast } = useToast();
  const router = useRouter();

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

  const [ovVersion, setOvVersion] = useState(0);
  useEffect(() => {
    const onChanged = () => setOvVersion((v) => v + 1);
    window.addEventListener("vessels:changed", onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener("vessels:changed", onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  const merged = useMemo(
    () => mergeVessels(vessels, readOverrides()),
    [vessels, ovVersion]
  );

  const filteredData = useMemo(() => {
    return merged.filter((vessel: any) => {
      const matchesSearch = Object.values(vessel).some((value: any) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "fleets" && Array.isArray(vessel.fleets)) {
          return vessel.fleets.some((fleet: string) =>
            fleet.toLowerCase().includes(value.toLowerCase())
          );
        }
        return String(vessel[key] ?? "")
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      return matchesSearch && matchesFilters;
    });
  }, [merged, searchQuery, filters]);

  const toggleSelectAll = () =>
    selectedIds.length === filteredData.length
      ? setSelectedIds([])
      : setSelectedIds(filteredData.map((v: any) => v.id));
  const toggleSelectOne = (id: string) =>
    selectedIds.includes(id)
      ? setSelectedIds(selectedIds.filter((v) => v !== id))
      : setSelectedIds([...selectedIds, id]);

  const [visibleCols, setVisibleCols] = useState<Record<ColumnKey, boolean>>({
    flag: true,
    name: true,
    photoUrl: true,
    destinationPort: true,
    reportedETA: true,
    reportedDestination: true,
    currentPort: true,
    imo: true,
    vesselType: true,
    mapIcon: true,
    latestPositionTime: true,
    latitude: true,
    longitude: true,
    myNotes: true,
  });
  const cols = ALL_COLUMNS.filter((c) => visibleCols[c.key]);

  const exportCSV = () => {
    const rows = filteredData.map((v: any) => {
      const alpha2 = alpha2FromVessel(v);
      return {
        flagCode: (alpha2 || "").toUpperCase(),
        country: v.country || v.flag || "",
        name: v.name,
        destinationPort: v.destinationPort,
        reportedETA: v.reportedETA,
        reportedDestination: v.reportedDestination,
        currentPort: v.currentPort,
        imo: v.imo,
        vesselType: v.vesselType,
        photoUrl: v.photoUrl,
        mapIcon: v.mapIcon,
        latestPositionTime: v.latestPositionTime,
        latitude: v.latitude,
        longitude: v.longitude,
        myNotes: v.myNotes,
      };
    });
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((r: any) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vessels.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openVessel = (v: any) => {
    try {
      localStorage.setItem(`vessel:${v.id}`, JSON.stringify(v));
      const prev = JSON.parse(localStorage.getItem("public:vessels") || "[]");
      const map = new Map(prev.map((it: any) => [it.id, it]));
      map.set(v.id, v);
      localStorage.setItem(
        "public:vessels",
        JSON.stringify(Array.from(map.values()))
      );
    } catch {}
    router.push(`/vessels/${v.id}`);
  };

  const [editing, setEditing] = useState<{
    id: string;
    field: ColumnKey;
  } | null>(null);
  const [editVal, setEditVal] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [editing]);

  const startEdit = (row: any, field: ColumnKey) => {
    if (!hasEnterprise) return;
    const editable: ColumnKey[] = [
      "name",
      "destinationPort",
      "reportedETA",
      "reportedDestination",
      "currentPort",
      "imo",
      "vesselType",
      "flag",
    ];
    if (editable.indexOf(field) === -1) return;
    if (field === "flag")
      setEditVal(row.country || row.flag || row.flagEmoji || "");
    else setEditVal(String(row[field] ?? ""));
    setEditing({ id: row.id, field });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditVal("");
  };

  const commitEdit = () => {
    if (!editing) return;
    const id = editing.id;
    const field = editing.field;
    let patch: any = {};

    if (field === "flag") {
      const val = editVal.trim();
      patch.country = val; // сохраняем и сюда
      patch.flag = val; // и сюда — для моков
      if (isFlagEmoji(val)) {
        patch.flagEmoji = val;
      } else {
        const a2 = nameToAlpha2(val);
        const e = a2
          ? (() => {
              const aCp = RI_BASE + (a2.toUpperCase().charCodeAt(0) - 0x41);
              const bCp = RI_BASE + (a2.toUpperCase().charCodeAt(1) - 0x41);
              const toSur = (cp: number) => {
                if (cp <= 0xffff) return String.fromCharCode(cp);
                cp -= 0x10000;
                const hi = 0xd800 + (cp >> 10);
                const lo = 0xdc00 + (cp & 0x3ff);
                return String.fromCharCode(hi, lo);
              };
              return toSur(aCp) + toSur(bCp);
            })()
          : undefined;
        if (e) patch.flagEmoji = e;
      }
    } else {
      patch[field] = editVal.trim() || undefined;
    }

    savePatch(id, patch);
    setEditing(null);
    setEditVal("");
    setOvVersion((x) => x + 1);
    toast({ title: "Saved" });
  };

  const ActionMenu = ({ vessel }: { vessel: any }) => {
    const fire = (message: string) => toast({ title: message });

    const quick = (field: ColumnKey, label: string) => {
      if (!hasEnterprise) return;
      const val = window.prompt(`Edit ${label}`, vessel[field] ?? "");
      if (val === null) return;
      savePatch(vessel.id, { [field]: val });
      setOvVersion((x) => x + 1);
      toast({ title: "Saved" });
    };

    const quickFlag = () => {
      if (!hasEnterprise) return;
      const cur = vessel.country || vessel.flag || vessel.flagEmoji || "";
      const val = window.prompt(
        "Edit Flag / Country\n(you can type country name, ISO like 'TR', or paste 🇹🇷)",
        cur
      );
      if (val === null) return;
      const patch: any = { country: val, flag: val };
      if (isFlagEmoji(val)) patch.flagEmoji = val;
      else {
        const a2 = nameToAlpha2(val);
        if (a2) {
          // построить эмодзи по ISO
          const aCp = RI_BASE + (a2.toUpperCase().charCodeAt(0) - 0x41);
          const bCp = RI_BASE + (a2.toUpperCase().charCodeAt(1) - 0x41);
          const toSur = (cp: number) => {
            if (cp <= 0xffff) return String.fromCharCode(cp);
            cp -= 0x10000;
            const hi = 0xd800 + (cp >> 10);
            const lo = 0xdc00 + (cp & 0x3ff);
            return String.fromCharCode(hi, lo);
          };
          patch.flagEmoji = toSur(aCp) + toSur(bCp);
        }
      }
      savePatch(vessel.id, patch);
      setOvVersion((x) => x + 1);
      toast({ title: "Saved" });
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
            aria-label="More actions"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => fire("Create Notification clicked")}>
            Create Notification
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Show on Map clicked")}>
            Show on Map
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Details clicked")}>
            Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Show Route Forecast clicked")}>
            Show Route Forecast
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Voyage Timeline clicked")}>
            Voyage Timeline
          </DropdownMenuItem>
          <DropdownMenuItem disabled onClick={() => fire("Locked feature")}>
            Position History 🔒
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Port Calls clicked")}>
            Port Calls
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fire("Nearby Vessels clicked")}>
            Nearby Vessels
          </DropdownMenuItem>

          {hasEnterprise && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => quick("name", "Name")}>
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={quickFlag}>
                Edit Flag / Country
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => quick("destinationPort", "Destination")}
              >
                Edit Destination
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => quick("currentPort", "Current Port")}
              >
                Edit Current Port
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => quick("vesselType", "Vessel Type")}
              >
                Edit Type
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quick("imo", "IMO")}>
                Edit IMO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => quick("reportedETA", "ETA")}>
                Edit ETA
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  quick("reportedDestination", "Reported Destination")
                }
              >
                Edit Reported Destination
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  /* -------------------- Mobile cards -------------------- */

  const MobileCards = () => (
    <div className="grid gap-3">
      {filteredData.map((v: any) => {
        const a2 = alpha2FromVessel(v);
        const src = flagImgUrl(a2);
        return (
          <div
            key={v.id}
            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <img
                src={v.photoUrl}
                alt={v.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      className="form-checkbox rounded text-blue-600 mt-[2px]"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleSelectOne(v.id)}
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      {a2 ? (
                        <img
                          src={src}
                          alt={v.country || v.flag || a2.toUpperCase()}
                          className="w-5 h-4 rounded-sm ring-1 ring-black/10"
                          loading="lazy"
                          onError={(e) =>
                            ((
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none")
                          }
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      <button
                        onClick={() => openVessel(v)}
                        className="font-semibold text-gray-900 dark:text-white truncate hover:underline"
                        title="Open vessel profile"
                      >
                        {v.name}
                      </button>
                    </div>
                  </div>
                  <ActionMenu vessel={v} />
                </div>

                {v.mapIcon ? (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={v.mapIcon}
                      alt="icon"
                      className="w-5 h-5 rounded object-contain"
                    />
                    <span className="text-xs text-gray-5 00 dark:text-gray-400">
                      Map icon
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">Destination</span>
                    <button
                      onClick={() => openVessel(v)}
                      className="font-medium text-gray-800 dark:text-gray-200 truncate hover:underline"
                    >
                      {v.destinationPort || "-"}
                    </button>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>ETA</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {v.reportedETA || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Current port</span>
                    <button
                      onClick={() => openVessel(v)}
                      className="font-medium text-gray-800 dark:text-gray-200 truncate hover:underline"
                    >
                      {v.currentPort || "-"}
                    </button>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>IMO</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {v.imo || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Type</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {v.vesselType || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Latest position</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {v.latestPositionTime || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Lat, Lon</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {v.latitude ?? "-"}, {v.longitude ?? "-"}
                    </span>
                  </div>
                  {v.myNotes ? (
                    <div className="flex justify-between gap-2">
                      <span>Notes</span>
                      <span className="italic text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                        {v.myNotes}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {hasEnterprise && (
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEdit(v)}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(v.id)}
                  className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div className="px-1 pt-1 text-xs text-gray-500 dark:text-gray-400">
        Total filtered: {filteredData.length} • Total rows: {merged.length}
      </div>
    </div>
  );

  /* -------------------- Desktop table -------------------- */

  const DesktopTable = () => (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Filtered: {filteredData.length}
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Total: {merged.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm">
              Columns
            </button>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-xl p-2 hidden group-hover:block">
              {ALL_COLUMNS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg_white/10 cursor-pointer"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={visibleCols[key]}
                    onChange={() =>
                      setVisibleCols((p) => ({ ...p, [key]: !p[key] }))
                    }
                    className="form-checkbox rounded text-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm active:scale-[0.98] transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] text-sm text-left text-slate-600 dark:text-slate-300">
          <thead className="text-slate-700 uppercase bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-400">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-blue-600"
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === filteredData.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              {cols.map((c, i) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 ${i === 0 ? "whitespace-nowrap" : ""}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((v: any) => {
              const a2 = alpha2FromVessel(v);
              const src = flagImgUrl(a2);

              const isEditing = (field: ColumnKey) =>
                !!editing && editing.id === v.id && editing.field === field;

              return (
                <tr
                  key={v.id}
                  className="bg-white dark:bg-[#121212] border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="form-checkbox rounded text-blue-600"
                      checked={selectedIds.includes(v.id)}
                      onChange={() => toggleSelectOne(v.id)}
                    />
                  </td>

                  {cols.map(({ key }) => {
                    if (key === "flag") {
                      return (
                        <td
                          key={key}
                          className="px-4 py-3 cursor-text"
                          onDoubleClick={() => startEdit(v, "flag")}
                          title={
                            hasEnterprise
                              ? "Double click to edit Flag/Country"
                              : undefined
                          }
                        >
                          {isEditing("flag") ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-[160px] rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/10 px-2 py-1 text-sm outline-none"
                              placeholder="TR / Turkey / 🇹🇷"
                            />
                          ) : a2 ? (
                            <img
                              src={src}
                              alt={v.country || v.flag || a2.toUpperCase()}
                              className="w-6 h-5 rounded-sm ring-1 ring-black/10"
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

                    if (key === "name") {
                      return (
                        <th
                          key={key}
                          scope="row"
                          className="px-4 py-3 font-medium whitespace-nowrap"
                        >
                          {isEditing("name") ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-[220px] rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/10 px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => openVessel(v)}
                              onDoubleClick={() => startEdit(v, "name")}
                              className="text-slate-900 dark:text-white hover:underline"
                              title={
                                hasEnterprise
                                  ? "Click to open, double click to edit"
                                  : "Open vessel profile"
                              }
                            >
                              {v.name}
                            </button>
                          )}
                        </th>
                      );
                    }

                    if (key === "photoUrl") {
                      return (
                        <td key={key} className="px-4 py-3">
                          <img
                            src={v.photoUrl}
                            alt={v.name}
                            className="w-16 h-12 object-cover rounded-lg ring-1 ring-black/5"
                            onError={(e) =>
                              ((
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none")
                            }
                          />
                        </td>
                      );
                    }

                    if (key === "mapIcon") {
                      return (
                        <td key={key} className="px-4 py-3">
                          {v.mapIcon ? (
                            <img
                              src={v.mapIcon}
                              alt="icon"
                              className="w-6 h-6 rounded object-contain"
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    }

                    if (key === "destinationPort" || key === "currentPort") {
                      const k = key as ColumnKey;
                      return (
                        <td
                          key={key}
                          className="px-4 py-3 cursor-text"
                          onDoubleClick={() => startEdit(v, k)}
                          title={
                            hasEnterprise ? "Double click to edit" : undefined
                          }
                        >
                          {isEditing(k) ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-[200px] rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/10 px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => openVessel(v)}
                              className="hover:underline"
                              title="Open vessel profile"
                            >
                              {v[key] ?? "-"}
                            </button>
                          )}
                        </td>
                      );
                    }

                    const editable: Record<string, string> = {
                      vesselType: "Vessel Type",
                      imo: "IMO",
                      reportedETA: "ETA",
                      reportedDestination: "Reported Destination",
                    };

                    if (editable[key]) {
                      const k = key as ColumnKey;
                      return (
                        <td
                          key={key}
                          className="px-4 py-3 cursor-text"
                          onDoubleClick={() => startEdit(v, k)}
                          title={
                            hasEnterprise ? "Double click to edit" : undefined
                          }
                        >
                          {isEditing(k) ? (
                            <input
                              ref={inputRef}
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="w-[200px] rounded-md bg-white/70 dark:bg-white/10 border border-gray-300 dark:border-white/10 px-2 py-1 text-sm outline-none"
                            />
                          ) : (
                            <span>{v[key] ?? "-"}</span>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={key} className="px-4 py-3">
                        {v[key] ?? "-"}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3">
                    {hasEnterprise ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(v)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(v.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition"
                        >
                          Delete
                        </button>
                        <ActionMenu vessel={v} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <ActionMenu vessel={v} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Selected: {selectedIds.length}</span>
        <span>
          Shown: {filteredData.length} / {merged.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="sm:hidden">
        <MobileCards />
      </div>
      <div className="hidden sm:block">
        <DesktopTable />
      </div>
    </div>
  );
};

export default VesselsTable;
