"use client";

import { useState } from "react";
import PortsTable from "@/components/dashboard/ports.tsx/portsTable";
import mockData  from "@/data/portsMockData";

const PortsPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ports Overview</h1>

      <input
        type="text"
        placeholder="Search by Port or UN/LOCODE..."
        className="mb-4 p-2 border rounded w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <PortsTable data={mockData} search={search} />
    </div>
  );
};

export default PortsPage;
