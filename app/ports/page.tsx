"use client";

import { FaGlobe } from "react-icons/fa";
import { TbLock } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
// import PortsTable from "@/components/dashboard/ports.tsx/portsTable";
import mockPorts from "@/data/portsMockData";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { GrPowerReset } from "react-icons/gr";

const PortsPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      {" "}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold mb-2">Ports</h1>
          <div className="relative w-full max-w-sm">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search MarineTraffic"
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-fit self-start">
          <Download className="w-4 h-4 mr-2" />
          Export All Data
        </Button>
      </div>
      <div className="flex gap-4 border-b">
        <div className="border-b-2 border-blue-600 pb-2 font-medium text-blue-600">
          Ports
        </div>
        <div className="text-gray-400 flex items-center gap-1 cursor-not-allowed">
          <TbLock /> Expected arrivals
        </div>
        <div className="text-gray-400 flex items-center gap-1 cursor-not-allowed">
          <TbLock /> Arrivals & Departures
        </div>
        <div className="text-gray-400 flex items-center gap-1 cursor-not-allowed">
          <TbLock /> Berth Calls
        </div>
        <div className="text-gray-400 flex items-center gap-1 cursor-not-allowed">
          <TbLock /> Port congestion
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FaGlobe /> Add Filter
          </Button>
          <input
            type="text"
            placeholder="Quick Search in Name, UNLOCODE"
            className="border px-3 py-2 rounded-md w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 text-sm text-blue-600 font-medium cursor-pointer">
          <span className="flex items-center gap-1">
            <GrPowerReset /> Reset All
          </span>
          <span className="flex items-center gap-1">▼ Columns</span>
          <span className="flex items-center gap-1">▼ Time Display</span>
        </div>
      </div>
      {/* <PortsTable data={mockPorts} search={search} /> */}
    </div>
  );
};

export default PortsPage;
