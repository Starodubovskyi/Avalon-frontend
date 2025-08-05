"use client";

import React from "react";
import { mockVesselsData } from "../shared/mockData1";

interface VesselsTableProps {
  filters: Record<string, string>;
  searchQuery: string;
}

const VesselsTable: React.FC<VesselsTableProps> = ({
  filters,
  searchQuery,
}) => {
  const filteredData = mockVesselsData.filter((vessel) => {
    const matchesSearch = Object.values(vessel).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;

      if (key === "fleets" && Array.isArray(vessel.fleets)) {
        return vessel.fleets.some((fleet) =>
          fleet.toLowerCase().includes(value.toLowerCase())
        );
      }

      const vesselValue = vessel[key as keyof typeof vessel];
      return String(vesselValue).toLowerCase().includes(value.toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  return (
    <div className="bg-white dark:bg-[#1a233b] p-2 sm:p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="w-full text-xs sm:text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded-lg text-xs sm:text-sm">
          <tr>
            <th scope="col" className="p-2 sm:p-4 rounded-tl-xl">
              <input
                type="checkbox"
                className="form-checkbox text-blue-600 rounded"
              />
            </th>
            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
              Vessel Name
            </th>

            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
              Photos
            </th>
            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
              Destination Port
            </th>
            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
              Reported ETA
            </th>
            <th
              scope="col"
              className="px-3 py-2 sm:px-6 sm:py-3 hidden sm:table-cell"
            >
              Reported Destination
            </th>
            <th
              scope="col"
              className="px-3 py-2 sm:px-6 sm:py-3 hidden sm:table-cell"
            >
              Current Port
            </th>
            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3">
              IMO
            </th>
            <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 rounded-tr-xl">
              Vessel Type
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((vessel, index) => (
            <tr
              key={index}
              className="bg-white dark:bg-[#1a233b] border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <td className="w-4 p-2 sm:p-4">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-600 rounded"
                />
              </td>
              <th
                scope="row"
                className="px-3 py-2 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
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
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
        <span>Total filtered records: {filteredData.length}</span>
        <span>Total Rows: {mockVesselsData.length}</span>
      </div>
    </div>
  );
};

export default VesselsTable;
