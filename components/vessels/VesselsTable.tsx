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
  const filteredData = (vessels as any[]).filter((vessel) => {
    const matchesSearch = Object.values(vessel as any).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;

      if (key === "fleets" && Array.isArray((vessel as any).fleets)) {
        return (vessel as any).fleets.some((fleet: string) =>
          fleet.toLowerCase().includes(value.toLowerCase())
        );
      }

      const vesselValue = (vessel as any)[key];
      return String(vesselValue).toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((v) => v.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((v) => v !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div
      className="
        bg-white border border-slate-200 shadow rounded-2xl p-6 overflow-x-auto
        dark:bg-white/5 dark:border-white/10 dark:shadow-white/10
      "
    >
      <table className="w-full text-xs sm:text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-slate-700 uppercase bg-slate-50 dark:bg-[#1a1a1a] dark:text-slate-400 text-xs sm:text-sm">
          <tr>
            <th className="p-2 sm:p-4 rounded-tl-xl">
              <input
                type="checkbox"
                className="form-checkbox text-blue-600 rounded"
                checked={
                  selectedIds.length > 0 &&
                  selectedIds.length === filteredData.length
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">Vessel Name</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">Photos</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">Destination Port</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">Reported ETA</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3 hidden sm:table-cell">
              Reported Destination
            </th>
            <th className="px-3 py-2 sm:px-6 sm:py-3 hidden sm:table-cell">
              Current Port
            </th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">IMO</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3">Vessel Type</th>
            <th className="px-3 py-2 sm:px-6 sm:py-3 rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((vessel) => (
            <tr
              key={vessel.id}
              className="bg-white dark:bg-[#1a1a1a] border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <td className="w-4 p-2 sm:p-4">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600 rounded"
                  checked={selectedIds.includes(vessel.id)}
                  onChange={() => toggleSelectOne(vessel.id)}
                />
              </td>
              <th
                scope="row"
                className="px-3 py-2 sm:px-6 sm:py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap"
              >
                {vessel.name}
              </th>
              <td className="px-3 py-2 sm:px-6 sm:py-4">
                <img
                  src={vessel.photoUrl}
                  alt={vessel.name}
                  className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded-lg"
                />
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4">
                {vessel.destinationPort}
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4">
                {vessel.reportedETA}
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4 hidden sm:table-cell">
                {vessel.reportedDestination}
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4 hidden sm:table-cell">
                {vessel.currentPort}
              </td>
              <td className="px-3 py-2 sm:px-6 sm:py-4">{vessel.imo}</td>
              <td className="px-3 py-2 sm:px-6 sm:py-4">{vessel.vesselType}</td>
              <td className="px-3 py-2 sm:px-6 sm:py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(vessel)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(vessel.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        <span>Total filtered records: {filteredData.length}</span>
        <span>Total Rows: {vessels.length}</span>
      </div>
    </div>
  );
};

export default VesselsTable;
