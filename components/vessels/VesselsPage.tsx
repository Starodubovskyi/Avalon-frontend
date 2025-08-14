"use client";

import React, { useState } from "react";
import VesselsHeader from "./VesselsHeader";
import VesselsTabs from "./VesselsTabs";
import VesselsActions from "./VesselsActions";
import VesselsTable from "./VesselsTable";
import VesselsModal from "./VesselsModal";
import { mockVesselsData } from "@/components/types/mockData1";
import { X } from "lucide-react";

const filterKeyMap: Record<string, string> = {
  Flag: "flag",
  "My Fleets": "fleets",
  IMO: "imo",
  ENI: "eni",
  "Vessel Name": "name",
  "Ship Type": "vesselType",
  Status: "status",
  "Build Year": "buildYear",
  Length: "length",
  Beam: "beam",
  Deadweight: "deadweight",
  "Gross Tonnage": "grossTonnage",
  "Net Tonnage": "netTonnage",
  Callsign: "callsign",
  "Destination Port": "destinationPort",
  "Current Port": "currentPort",
  "Last Port": "lastPort",
  "Reported ETA": "reportedETA",
};

const VesselsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [vessels, setVessels] = useState(mockVesselsData);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editVessel, setEditVessel] = useState<any>(null);

  const handleAddVessel = (vessel: any) =>
    setVessels((prev) => [...prev, vessel]);
  const handleEditVessel = (updated: any) =>
    setVessels((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  const handleDeleteVessel = (id: string) =>
    setVessels((prev) => prev.filter((v) => v.id !== id));
  const handleDeleteSelected = () => {
    setVessels((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
    setSelectedIds([]);
  };

  const handleAddFilter = (filterName: string) => {
    const key =
      filterKeyMap[filterName] || filterName.toLowerCase().replace(/\s/g, "");
    setActiveFilters((prev) => ({ ...prev, [key]: prev[key] || "" }));
  };
  const handleUpdateFilterValue = (key: string, value: string) =>
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  const handleRemoveFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const renderFilterName = (key: string) =>
    Object.keys(filterKeyMap).find((name) => filterKeyMap[name] === key) || key;

  return (
    <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/40 bg-white dark:bg-black px-3 sm:px-6 pt-3 sm:pt-6 pb-3 border-b border-gray-200 dark:border-white/10">
          <VesselsHeader
            onAdd={() => setIsAddOpen(true)}
            onDeleteSelected={handleDeleteSelected}
            hasSelected={selectedIds.length > 0}
          />
          <VesselsTabs />
          <VesselsActions
            onAddFilter={handleAddFilter}
            onSearch={setSearchQuery}
            className="mt-2"
          />
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap">
              {Object.entries(activeFilters).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                    {renderFilterName(key)}:
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleUpdateFilterValue(key, e.target.value)
                    }
                    placeholder="Value"
                    className="w-24 sm:w-32 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveFilter(key)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="Remove filter"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 sm:px-6 py-3 sm:py-6">
          <VesselsTable
            filters={activeFilters}
            searchQuery={searchQuery}
            vessels={vessels}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onEdit={setEditVessel}
            onDelete={handleDeleteVessel}
          />
        </div>
      </div>

      {isAddOpen && (
        <VesselsModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddVessel}
        />
      )}
      {editVessel && (
        <VesselsModal
          initialData={editVessel}
          onClose={() => setEditVessel(null)}
          onSubmit={handleEditVessel}
        />
      )}
    </div>
  );
};

export default VesselsPage;
