export type VesselStatus = "Underway" | "In Port" | "Anchorage" | "Off-hire";
export type VesselType = "Bulk" | "Tanker" | "Container" | "General";
export type Risk = "Low" | "Medium" | "High";

export type Vessel = {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  type: VesselType;
  status: VesselStatus;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  region: "EU" | "MED" | "APAC" | "AMER";
  nextPort?: string;
  etaIso?: string;
  risk?: Risk;
};

export type PortCallStatus = "Scheduled" | "Alongside" | "Departed" | "Cancelled";

export type PortCall = {
  id: string;
  vesselId: string;
  port: string;
  berth?: string;
  etaIso: string;
  etdIso?: string;
  agent?: string;
  status: PortCallStatus;
  delayHours?: number;
};

export type Voyage = {
  id: string;
  vesselId: string;
  from: string;
  to: string;
  cargo?: string;
  etaIso: string;
  speed: number;
  weatherRisk: Risk;
  delayHours?: number;
};

export type MaintenanceJob = {
  id: string;
  vesselId: string;
  job: string;
  type: "Planned" | "Corrective";
  dueIso: string;
  overdueHours?: number;
  assignee?: string;
  status: "Open" | "Done";
};

export type Certificate = {
  id: string;
  vesselId: string;
  name: string;
  expiryIso: string;
};

export type Alert = {
  id: string;
  tsIso: string;
  type: "Delay" | "Weather" | "Certificate" | "Anomaly" | "Info";
  message: string;
  severity: "info" | "warning" | "critical";
  entity?: { kind: "Vessel" | "PortCall" | "Voyage"; id: string };
};
