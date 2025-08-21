"use client";

import dynamic from "next/dynamic";

const PortsPage = dynamic(() => import("@/components/ports/PortsPage"), {
  ssr: false,
});

const mockPorts = [
  {
    id: "1",
    port: "Port of Constanta",
    unlocode: "ROCND",
    country: "Romania", 
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Constanta_Port.jpg/320px-Constanta_Port.jpg",
    vessels: 45, 
    arrivals: 12, 
    departures: 8,
    expectedArrivals: 14,
    timezone: "UTC+02:00", 
    anchorage: "Outer Anchorage Constanta", 
    geoArea1: "Europe", 
    geoArea2: "Black Sea", 
    coverage: "High",
  },
  {
    id: "2",
    port: "Port of Rotterdam",
    unlocode: "NLRTM",
    country: "Netherlands",
    photoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Rotterdam_Harbor.jpg/320px-Rotterdam_Harbor.jpg",
    vessels: 210,
    arrivals: 32,
    departures: 40,
    expectedArrivals: 72,
    timezone: "UTC+01:00",
    anchorage: "Maas Anchorage",
    geoArea1: "Europe",
    geoArea2: "North Sea",
    coverage: "Very High",
  },
];

export default function PortsRoutePage() {
  return (
    <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
      <div className="px-1 sm:px-2 lg:px-2 py-1">
        <div
          className="
            w-full
            rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
            dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          "
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <PortsPage initialRows={mockPorts} />
          </div>
        </div>
      </div>
    </div>
  );
}
