import type { Destination, UserRef, VesselType } from "@/lib/vessels/types";

/** Agency requests — contract: docs/designs/2026-10-31-client-sections-and-demo.md */

export const REQUEST_STATUSES = ["new", "quoted", "accepted", "declined"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface AgencyRequest {
  id: string;
  status: RequestStatus;
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  vesselName: string;
  imo: string | null;
  vesselType: VesselType;
  destination: Destination;
  /** ETA Sulina, ISO */
  eta: string | null;
  cargo: string | null;
  notes: string | null;
  /** agent's reply, visible to the client */
  staffNote: string | null;
  vesselId: string | null;
  createdBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyRequestDto {
  company: string;
  contactName: string;
  email: string;
  phone?: string | null;
  vesselName: string;
  imo?: string | null;
  vesselType: VesselType;
  destination: Destination;
  eta?: string | null;
  cargo?: string | null;
  notes?: string | null;
}

export interface UpdateAgencyRequestDto {
  status?: RequestStatus;
  staffNote?: string | null;
  vesselId?: string | null;
}

export const REQUEST_LIMITS = {
  company: 120,
  contactName: 120,
  email: 160,
  phone: 40,
  vesselName: 80,
  cargo: 160,
  notes: 2000,
  staffNote: 2000,
} as const;

export interface StatusMeta {
  label: string;
  /** one line for the client */
  hint: string;
  text: string;
  soft: string;
  dot: string;
}

export const REQUEST_STATUS_META: Record<RequestStatus, StatusMeta> = {
  new: {
    label: "New",
    hint: "Received — an agent will reply shortly",
    text: "text-stage-expected",
    soft: "bg-stage-expected/10",
    dot: "bg-stage-expected",
  },
  quoted: {
    label: "Quoted",
    hint: "The agent has sent terms or a PDA",
    text: "text-stage-roads",
    soft: "bg-stage-roads/10",
    dot: "bg-stage-roads",
  },
  accepted: {
    label: "Accepted",
    hint: "On the Avalon board — we are handling the call",
    text: "text-ok",
    soft: "bg-ok/10",
    dot: "bg-ok",
  },
  declined: {
    label: "Declined",
    hint: "Not taken this time — see the agent's note",
    text: "text-stage-departed",
    soft: "bg-stage-departed/15",
    dot: "bg-stage-departed",
  },
};
