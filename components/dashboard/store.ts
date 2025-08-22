"use client";

import { create } from "zustand";
import { Alert, MaintenanceJob, PortCall, Vessel, Voyage, Certificate, PortCallStatus } from "./types";

type Filters = {
  status: string;
  type: string;
  region: string;
  risk: string;
};

type State = {
  vessels: Vessel[];
  portCalls: PortCall[];
  voyages: Voyage[];
  maintenance: MaintenanceJob[];
  alerts: Alert[];
  certificates: Certificate[];
  searchQuery: string;
  filters: Filters;
  activeTab: "operations" | "technical" | "commercial";
  setSearchQuery: (q: string) => void;
  setFilters: (partial: Partial<Filters>) => void;
  setActiveTab: (t: State["activeTab"]) => void;
  updatePortCallStatus: (id: string, status: PortCallStatus) => void;
};

const now = new Date();

const vesselsMock: Vessel[] = [
  {
    id: "v1",
    name: "Stark Aurora",
    imo: "9734567",
    mmsi: "256789000",
    type: "Bulk",
    status: "Underway",
    lat: 37.9,
    lon: 23.7,
    speed: 12.5,
    course: 145,
    region: "MED",
    nextPort: "Piraeus",
    etaIso: new Date(now.getTime() + 36 * 3600 * 1000).toISOString(),
    risk: "Low",
  },
  {
    id: "v2",
    name: "Stark Horizon",
    imo: "9743210",
    mmsi: "256789111",
    type: "Tanker",
    status: "In Port",
    lat: 51.9,
    lon: 4.5,
    speed: 0,
    course: 0,
    region: "EU",
    nextPort: "Rotterdam",
    etaIso: new Date(now.getTime() + 6 * 3600 * 1000).toISOString(),
    risk: "Medium",
  },
  {
    id: "v3",
    name: "Stark Atlas",
    imo: "9759991",
    mmsi: "256789222",
    type: "Container",
    status: "Anchorage",
    lat: 1.3,
    lon: 103.8,
    speed: 0.5,
    course: 90,
    region: "APAC",
    nextPort: "Singapore",
    etaIso: new Date(now.getTime() + 18 * 3600 * 1000).toISOString(),
    risk: "High",
  },
];

const portCallsMock: PortCall[] = [
  {
    id: "pc1",
    vesselId: "v1",
    port: "Piraeus",
    berth: "B-12",
    etaIso: new Date(now.getTime() + 30 * 3600 * 1000).toISOString(),
    status: "Scheduled",
    delayHours: 0,
    agent: "BluePort",
  },
  {
    id: "pc2",
    vesselId: "v2",
    port: "Rotterdam",
    berth: "E-4",
    etaIso: new Date(now.getTime() + 4 * 3600 * 1000).toISOString(),
    status: "Scheduled",
    delayHours: 2,
    agent: "Harbor BV",
  },
  {
    id: "pc3",
    vesselId: "v3",
    port: "Singapore",
    berth: "T-7",
    etaIso: new Date(now.getTime() + 16 * 3600 * 1000).toISOString(),
    status: "Scheduled",
    delayHours: 1,
    agent: "SGP Agents",
  },
];

const voyagesMock: Voyage[] = [
  {
    id: "voy1",
    vesselId: "v1",
    from: "Constanta",
    to: "Piraeus",
    cargo: "Wheat",
    etaIso: new Date(now.getTime() + 36 * 3600 * 1000).toISOString(),
    speed: 12.5,
    weatherRisk: "Low",
  },
  {
    id: "voy2",
    vesselId: "v2",
    from: "Antwerp",
    to: "Rotterdam",
    cargo: "Crude",
    etaIso: new Date(now.getTime() + 6 * 3600 * 1000).toISOString(),
    speed: 8.2,
    weatherRisk: "Medium",
    delayHours: 2,
  },
  {
    id: "voy3",
    vesselId: "v3",
    from: "Port Klang",
    to: "Singapore",
    cargo: "Containers",
    etaIso: new Date(now.getTime() + 18 * 3600 * 1000).toISOString(),
    speed: 10.3,
    weatherRisk: "High",
    delayHours: 1,
  },
];

const maintenanceMock: MaintenanceJob[] = [
  {
    id: "m1",
    vesselId: "v2",
    job: "ME lube oil filter change",
    type: "Planned",
    dueIso: new Date(now.getTime() + 72 * 3600 * 1000).toISOString(),
    status: "Open",
  },
  {
    id: "m2",
    vesselId: "v3",
    job: "Radar antenna check",
    type: "Corrective",
    dueIso: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
    overdueHours: 10,
    status: "Open",
  },
];

const alertsMock: Alert[] = [
  {
    id: "a1",
    tsIso: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    type: "Delay",
    message: "Rotterdam ETA slipped by 2h for Stark Horizon",
    severity: "warning",
    entity: { kind: "PortCall", id: "pc2" },
  },
  {
    id: "a2",
    tsIso: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    type: "Weather",
    message: "High swell near Singapore anchorage for Stark Atlas",
    severity: "critical",
    entity: { kind: "Vessel", id: "v3" },
  },
  {
    id: "a3",
    tsIso: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    type: "Info",
    message: "Piraeus pilot confirmed for Stark Aurora",
    severity: "info",
    entity: { kind: "PortCall", id: "pc1" },
  },
];

const certificatesMock: Certificate[] = [
  { id: "c1", vesselId: "v1", name: "ISM",   expiryIso: new Date(now.getTime() + 8  * 24 * 3600 * 1000).toISOString() },
  { id: "c2", vesselId: "v2", name: "Class", expiryIso: new Date(now.getTime() + 25 * 24 * 3600 * 1000).toISOString() },
  { id: "c3", vesselId: "v3", name: "SIRE",  expiryIso: new Date(now.getTime() + 3  * 24 * 3600 * 1000).toISOString() },
];

export const useDashboardStore = create<State>((set) => ({
  vessels: vesselsMock,
  portCalls: portCallsMock,
  voyages: voyagesMock,
  maintenance: maintenanceMock,
  alerts: alertsMock,
  certificates: certificatesMock,
  searchQuery: "",
  filters: { status: "All", type: "All", region: "All", risk: "All" },
  activeTab: "operations",
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial } })),
  setActiveTab: (t) => set({ activeTab: t }),
  updatePortCallStatus: (id, status) =>
    set((s) => ({
      portCalls: s.portCalls.map((p) => (p.id === id ? { ...p, status } : p)),
    })),
}));
