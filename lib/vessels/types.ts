export const VESSEL_TYPES = ["general_cargo", "tanker", "livestock"] as const;
export type VesselType = (typeof VESSEL_TYPES)[number];

export const DESTINATIONS = [
  "IZMAIL",
  "RENI",
  "ORLIVKA",
  "GIURGIULESTI",
  "GALATI",
  "BRAILA",
  "TULCEA",
] as const;
export type Destination = (typeof DESTINATIONS)[number];

export const CONDITIONS = ["ballast", "loaded"] as const;
export type VesselCondition = (typeof CONDITIONS)[number];

export type OkStatus = "ok" | "not_ok";
export const T1_VALUES = ["yes", "no", "not_needed"] as const;
export type T1Status = (typeof T1_VALUES)[number];

export const STAGES = ["expected", "at_roads", "in_port", "departed"] as const;
export type VesselStage = (typeof STAGES)[number];

export type ChecklistKey =
  | "prearrivalsIn"
  | "mswIn"
  | "pdaSent"
  | "t1"
  | "pilotageArranged"
  | "paid"
  | "prearrivalsOut"
  | "mswOut";

export interface UserRef {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

export interface VesselView {
  id: string;
  name: string;
  imo: string | null;
  mmsi: string | null;
  type: VesselType;
  destination: Destination;
  condition: VesselCondition | null;
  etaSulina: string | null;
  arrivedAt: string | null;
  inPortAt: string | null;
  departedAt: string | null;
  lat: number | null;
  lng: number | null;
  sog: number | null;
  cog: number | null;
  positionSource: "ais" | "manual" | null;
  positionAt: string | null;
  stage: VesselStage;
  createdAt: string;
  updatedAt: string;
  restricted: boolean;
  masterName: string | null;
  masterPhone: string | null;
  masterEmail: string | null;
  officeName: string | null;
  officePhone: string | null;
  officeEmail: string | null;
  portAgent: string | null;
  prearrivalsIn: OkStatus | null;
  prearrivalsOut: OkStatus | null;
  mswIn: boolean | null;
  mswOut: boolean | null;
  pdaSent: boolean | null;
  paid: boolean | null;
  t1: T1Status | null;
  pilotageArranged: boolean | null;
  pilot: string | null;
  notes: string | null;
  checklist: { done: number; total: number; pending: ChecklistKey[] } | null;
  unpaidAfterDeparture: boolean | null;
  updatedBy: UserRef | null;
}

export interface VesselInput {
  name?: string;
  imo?: string | null;
  mmsi?: string | null;
  type?: VesselType;
  destination?: Destination;
  condition?: VesselCondition | null;
  masterName?: string | null;
  masterPhone?: string | null;
  masterEmail?: string | null;
  officeName?: string | null;
  officePhone?: string | null;
  officeEmail?: string | null;
  portAgent?: string | null;
  etaSulina?: string | null;
  arrivedAt?: string | null;
  inPortAt?: string | null;
  departedAt?: string | null;
  prearrivalsIn?: OkStatus;
  prearrivalsOut?: OkStatus;
  mswIn?: boolean;
  mswOut?: boolean;
  pdaSent?: boolean;
  paid?: boolean;
  t1?: T1Status | null;
  pilotageArranged?: boolean;
  pilot?: string | null;
  notes?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface VesselEventView {
  id: string;
  vesselId: string;
  vesselName: string;
  action: "created" | "updated" | "deleted";
  changes: Record<string, { from: unknown; to: unknown }>;
  user: UserRef | null;
  createdAt: string;
}

export const DOCUMENT_CATEGORIES = [
  "vessel",
  "customs",
  "port",
  "crew",
  "finance",
  "template",
  "other",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface DocumentView {
  id: string;
  title: string;
  category: DocumentCategory;
  vesselId: string | null;
  vesselName: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  notes: string | null;
  uploadedBy: UserRef | null;
  createdAt: string;
}

export interface AisStatus {
  enabled: boolean;
  connected: boolean;
  lastMessageAt: string | null;
  trackedVessels: number;
}

export const TYPE_LABEL: Record<VesselType, string> = {
  general_cargo: "General cargo",
  tanker: "Tanker",
  livestock: "Livestock",
};

export const CONDITION_LABEL: Record<VesselCondition, string> = {
  ballast: "Ballast",
  loaded: "Loaded",
};

export const DESTINATION_LABEL: Record<Destination, string> = {
  IZMAIL: "Izmail",
  RENI: "Reni",
  ORLIVKA: "Orlivka",
  GIURGIULESTI: "Giurgiulești",
  GALATI: "Galați",
  BRAILA: "Brăila",
  TULCEA: "Tulcea",
};

export const T1_LABEL: Record<T1Status, string> = {
  yes: "Yes",
  no: "No",
  not_needed: "Not needed",
};

export const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  vessel: "Vessel",
  customs: "Customs",
  port: "Port",
  crew: "Crew",
  finance: "Finance",
  template: "Template",
  other: "Other",
};

export function userName(u: UserRef | null | undefined): string {
  if (!u) return "System";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return full || u.email || `User #${u.id}`;
}
