"use client";

import React from "react";

interface VesselsTableProps {
  filters: Record<string, string>;
  searchQuery: string;
  vessels: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onEdit: (vessel: any) => void;
  onDelete: (id: string) => void;
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
  const filteredData = vessels.filter((vessel: any) => {
    const matchesSearch = Object.values(vessel).some((value: any) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
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

  const toggleSelectAll = () =>
    selectedIds.length === filteredData.length
      ? setSelectedIds([])
      : setSelectedIds(filteredData.map((v: any) => v.id));

  const toggleSelectOne = (id: string) =>
    selectedIds.includes(id)
      ? setSelectedIds(selectedIds.filter((v) => v !== id))
      : setSelectedIds([...selectedIds, id]);

  const MobileCards = () => (
    <div className="grid gap-3">
      {filteredData.map((v: any) => (
        <div
          key={v.id}
          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <img
              src={v.photoUrl}
              alt={v.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-blue-600 mt-[2px]"
                  checked={selectedIds.includes(v.id)}
                  onChange={() => toggleSelectOne(v.id)}
                />
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {v.name}
                </h3>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                <div className="flex justify-between gap-2">
                  <span className="truncate">Destination</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                    {v.destinationPort || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>ETA</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {v.reportedETA || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Current port</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                    {v.currentPort || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>IMO</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {v.imo || "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Type</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
                    {v.vesselType || "-"}
                  </span>
                </div>
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
      ))}

      <div className="px-1 pt-1 text-xs text-gray-500 dark:text-gray-400">
        Total filtered: {filteredData.length} • Total rows: {vessels.length}
      </div>
    </div>
  );

  const DesktopTable = () => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow">
      <table className="w-full min-w-[900px] text-sm text-left text-slate-600 dark:text-slate-300">
        <thead className="text-slate-700 uppercase bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-400">
          <tr>
            <th className="p-3 rounded-tl-2xl">
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
            <th className="px-4 py-3">Vessel Name</th>
            <th className="px-4 py-3">Photos</th>
            <th className="px-4 py-3">Destination Port</th>
            <th className="px-4 py-3">Reported ETA</th>
            <th className="px-4 py-3">Reported Destination</th>
            <th className="px-4 py-3">Current Port</th>
            <th className="px-4 py-3">IMO</th>
            <th className="px-4 py-3">Vessel Type</th>
            <th className="px-4 py-3 rounded-tr-2xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((v: any) => (
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
              <th
                scope="row"
                className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                {v.name}
              </th>
              <td className="px-4 py-3">
                <img
                  src={v.photoUrl}
                  alt={v.name}
                  className="w-16 h-12 object-cover rounded-lg"
                />
              </td>
              <td className="px-4 py-3">{v.destinationPort}</td>
              <td className="px-4 py-3">{v.reportedETA}</td>
              <td className="px-4 py-3">{v.reportedDestination}</td>
              <td className="px-4 py-3">{v.currentPort}</td>
              <td className="px-4 py-3">{v.imo}</td>
              <td className="px-4 py-3">{v.vesselType}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(v)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(v.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Total filtered: {filteredData.length}</span>
        <span>Total rows: {vessels.length}</span>
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
