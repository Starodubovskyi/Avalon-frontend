export type PortLite = {
  id: string;
  name: string;
  country: string;
  unlocode: string;
  arrivals: number;
  status: "Open" | "Closed" | "Congested";
  lat: number;
  lng: number;
  zoom?: number;
};

export const PORTS: PortLite[] = [
  {
    id: "constanta",
    name: "Constanța",
    country: "Romania",
    unlocode: "ROCND",
    arrivals: 124,
    status: "Open",
    lat: 44.1598,
    lng: 28.6348,
    zoom: 7,
  },
  {
    id: "odessa",
    name: "Odesa",
    country: "Ukraine",
    unlocode: "UAODS",
    arrivals: 98,
    status: "Congested",
    lat: 46.4825,
    lng: 30.7233,
    zoom: 7,
  },
  {
    id: "istanbul",
    name: "Istanbul",
    country: "Turkey",
    unlocode: "TRIST",
    arrivals: 210,
    status: "Open",
    lat: 41.0082,
    lng: 28.9784,
    zoom: 7,
  },
  {
    id: "rotterdam",
    name: "Rotterdam",
    country: "Netherlands",
    unlocode: "NLRTM",
    arrivals: 350,
    status: "Open",
    lat: 51.9244,
    lng: 4.4777,
    zoom: 7,
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    unlocode: "SGSIN",
    arrivals: 540,
    status: "Open",
    lat: 1.3521,
    lng: 103.8198,
    zoom: 8,
  },
  {
    id: "newyork",
    name: "New York",
    country: "USA",
    unlocode: "USNYC",
    arrivals: 185,
    status: "Closed",
    lat: 40.7128,
    lng: -74.006,
    zoom: 6,
  },
];
