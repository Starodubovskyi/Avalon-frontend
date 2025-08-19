"use client";

import React, { useMemo, useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

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
  // дополнительные поля оставляем, если у тебя уже используются
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

/** Преобразуем название страны или уже готовый код в alpha-2 (нижний регистр) */
function nameToAlpha2(country?: string): string {
  if (!country) return "";
  const c = country.trim();
  if (c.length === 2) return c.toLowerCase(); // уже код, например "RO"
  const code = countries.getAlpha2Code(c, "en"); // например "Romania" -> "RO"
  return (code || "").toLowerCase();
}

/** Надёжный источник SVG-флагов */
function flagImgUrl(alpha2: string) {
  if (!alpha2) return "";
  return `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${alpha2}.svg`;
}

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

  const filteredData = useMemo(() => {
    return vessels.filter((vessel: any) => {
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
  }, [vessels, searchQuery, filters]);

  const toggleSelectAll = () =>
    selectedIds.length === filteredData.length
      ? setSelectedIds([])
      : setSelectedIds(filteredData.map((v: any) => v.id));

  const toggleSelectOne = (id: string) =>
    selectedIds.includes(id)
      ? setSelectedIds(selectedIds.filter((v) => v !== id))
      : setSelectedIds([...selectedIds, id]);

  // Настройка видимости колонок
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

  // Экспорт CSV (добавил country и flagCode)
  const exportCSV = () => {
    const rows = filteredData.map((v: any) => {
      const alpha2 = nameToAlpha2(v.country);
      return {
        flagCode: alpha2.toUpperCase() || "",
        country: v.country || "",
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

  const ActionMenu = ({ vessel }: { vessel: any }) => {
    const fire = (message: string) =>
      toast({
        title: message,
      });

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
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const MobileCards = () => (
    <div className="grid gap-3">
      {filteredData.map((v: any) => {
        const alpha2 = nameToAlpha2(v.country);
        const src = flagImgUrl(alpha2);

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
                    {/* Флаг + имя */}
                    <div className="flex items-center gap-2 min-w-0">
                      {alpha2 ? (
                        <img
                          src={src}
                          alt={v.country || alpha2.toUpperCase()}
                          className="w-5 h-4 rounded-sm ring-1 ring-black/10"
                          loading="lazy"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {v.name}
                      </h3>
                    </div>
                  </div>
                  <ActionMenu vessel={v} />
                </div>

                {/* Map icon (если используется) */}
                {v.mapIcon ? (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={v.mapIcon}
                      alt="icon"
                      className="w-5 h-5 rounded object-contain"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Map icon
                    </span>
                  </div>
                ) : null}

                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="truncate">Destination</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {v.destinationPort || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>ETA</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {v.reportedETA || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Current port</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {v.currentPort || "-"}
                    </span>
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

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(v)}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm active:scale-[0.98]"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(v.id)}
                className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}

      <div className="px-1 pt-1 text-xs text-gray-500 dark:text-gray-400">
        Total filtered: {filteredData.length} • Total rows: {vessels.length}
      </div>
    </div>
  );

  const DesktopTable = () => (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow overflow-hidden">
      {/* Панель управления таблицей */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Filtered: {filteredData.length}
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            Total: {vessels.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Выбор колонок */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm">
              Columns
            </button>
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] shadow-xl p-2 hidden group-hover:block">
              {ALL_COLUMNS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer"
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

          {/* Экспорт */}
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
              const alpha2 = nameToAlpha2(v.country);
              const src = flagImgUrl(alpha2);

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
                        <td key={key} className="px-4 py-3">
                          {alpha2 ? (
                            <img
                              src={src}
                              alt={v.country || alpha2.toUpperCase()}
                              className="w-6 h-5 rounded-sm ring-1 ring-black/10"
                              loading="lazy"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
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
                          className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap"
                        >
                          {v.name}
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
                    return (
                      <td key={key} className="px-4 py-3">
                        {v[key] ?? "-"}
                      </td>
                    );
                  })}

                  <td className="px-4 py-3">
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
          Shown: {filteredData.length} / {vessels.length}
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
