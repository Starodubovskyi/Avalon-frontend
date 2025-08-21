export const MOCK_PORTS = [
  {
    id: "prt-odessa",
    country: "Ukraine",
    port: "Odessa",
    unlocode: "UAODS",
    photoUrl:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600",
    timezone: "UTC+02:00",
    vessels: 28,
    arrivals: 9, // last 24h
    departures: 7,
    expectedArrivals: 11,
    anchorage: "Odessa Anchorage",
    geoArea1: "Black Sea",
    geoArea2: "NW Black Sea",
    coverage: "High",
  },
  {
    id: "prt-rotterdam",
    country: "Netherlands",
    port: "Rotterdam",
    unlocode: "NLRTM",
    photoUrl:
      "https://images.unsplash.com/photo-1517954103162-9d8383b1e67b?q=80&w=600",
    timezone: "UTC+01:00",
    vessels: 146,
    arrivals: 58,
    departures: 41,
    expectedArrivals: 72,
    anchorage: "Maas Anchorage",
    geoArea1: "North Sea",
    geoArea2: "Rhine–Meuse–Scheldt delta",
    coverage: "Very High",
  },
];
