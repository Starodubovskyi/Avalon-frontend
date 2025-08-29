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
      "https://moya-planeta.ru/upload/images/xl/a7/d0/a7d0eaa500beb2a1098e8212e53286fbeb037996.jpg",
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
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPMC9WsvIDC6MOs37gKDx1CZ77PfEvbS-4uw&s",
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
      <PortsPage initialRows={mockPorts} />
    </div>
  );
}
