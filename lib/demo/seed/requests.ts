import type { Destination, VesselType } from "@/lib/vessels/types";
import { uuid } from "../ids";
import type { RequestStatus } from "@/lib/requests/types";
import type { AgencyRequestRow, VesselRow } from "../types";

/** Client nominations (agency requests) across every status; two are already on the board */

const H = 3_600_000;
const D = 24 * H;

interface RequestSpec {
  by: number;
  company: string;
  contactName: string;
  email: string;
  phone: string | null;
  vesselName: string;
  imo: string | null;
  vesselType: VesselType;
  destination: Destination;
  /** ms from now */
  eta: number | null;
  cargo: string | null;
  notes: string | null;
  status: RequestStatus;
  staffNote: string | null;
  /** board vessel this request turned into */
  boardVessel?: string;
  createdAgo: number;
  updatedAgo: number;
}

const SPECS: RequestSpec[] = [
  {
    by: 705, company: "Danube Grain Trading SRL", contactName: "Sofia Petrenko", email: "sofia.petrenko@danube-grain.example",
    phone: "+40 236 000 410", vesselName: "DANUBE SPIRIT", imo: "9634218", vesselType: "general_cargo", destination: "IZMAIL",
    eta: 8 * D, cargo: "4,800 t milling wheat (export)", notes: "Loading at berth 7 if available. Please include tally and draft survey in the PDA.",
    status: "new", staffNote: null, createdAgo: 3 * H, updatedAgo: 3 * H,
  },
  {
    by: 706, company: "Pontic Chartering SA", contactName: "Daniel Novak", email: "d.novak@pontic-chartering.example",
    phone: "+359 52 000 118", vesselName: "AEGEAN HARVEST", imo: "9518764", vesselType: "general_cargo", destination: "RENI",
    eta: 5 * D, cargo: "5,500 t corn", notes: "Need a firm PDA and the current Reni line-up before we fix the vessel.",
    status: "new", staffNote: null, createdAgo: 20 * H, updatedAgo: 20 * H,
  },
  {
    by: 707, company: "Marmara Tankers Ltd", contactName: "Kerem Aksoy", email: "kerem.aksoy@marmara-tankers.example",
    phone: "+90 216 000 4410", vesselName: "MARMARA STAR", imo: "9402117", vesselType: "tanker", destination: "GALATI",
    eta: 3 * D, cargo: "3,200 t gasoil", notes: "Vessel is double-hull, 6.4 m arrival draft.",
    status: "quoted", staffNote: "Firm PDA sent: EUR 18,450 incl. Sulina channel dues, pilotage and two tugs at Galați. Berth window confirmed for your ETA.",
    createdAgo: 2 * D, updatedAgo: 26 * H,
  },
  {
    by: 705, company: "Danube Grain Trading SRL", contactName: "Sofia Petrenko", email: "sofia.petrenko@danube-grain.example",
    phone: "+40 236 000 410", vesselName: "UGAH CONFIDENCE", imo: null, vesselType: "general_cargo", destination: "IZMAIL",
    eta: 14 * H, cargo: "Ballast in — loading 5,000 t sunflower meal", notes: null,
    status: "accepted", staffNote: "Accepted — the vessel is on our board. Pilot and berth are booked; pre-arrival documents went to the master.",
    boardVessel: "UGAH CONFIDENCE", createdAgo: 4 * D, updatedAgo: 3 * D,
  },
  {
    by: 706, company: "Pontic Chartering SA", contactName: "Daniel Novak", email: "d.novak@pontic-chartering.example",
    phone: "+359 52 000 118", vesselName: "SEA GLORY", imo: null, vesselType: "tanker", destination: "RENI",
    eta: 4 * D, cargo: "To be confirmed by charterers", notes: "Nomination only for now.",
    status: "accepted", staffNote: "On the board as a nomination. We will confirm the berth once the cargo is fixed.",
    boardVessel: "SEA GLORY", createdAgo: 30 * H, updatedAgo: 25 * H,
  },
  {
    by: 708, company: "NordBulk Shipping AB", contactName: "Anna Lindqvist", email: "anna.lindqvist@nordbulk.example",
    phone: "+46 31 000 2270", vesselName: "NORDIC BREEZE", imo: "9287390", vesselType: "general_cargo", destination: "ORLIVKA",
    eta: 2 * D, cargo: "Project cargo — 2 × 120 t transformers", notes: "Heavy lift, ship's cranes 2 × 80 t.",
    status: "declined", staffNote: "Sorry — Orlivka has no shore crane for 120 t pieces this month. Izmail berth 7 can handle it; happy to quote there.",
    createdAgo: 5 * D, updatedAgo: 4 * D,
  },
];

export function seedRequests(vessels: VesselRow[], now: number): AgencyRequestRow[] {
  const byName = new Map(vessels.map((v) => [v.name, v]));
  return SPECS.map((s) => {
    const board = s.boardVessel ? byName.get(s.boardVessel) : undefined;
    return {
      id: uuid(),
      createdById: s.by,
      company: s.company,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      vesselName: s.vesselName,
      imo: s.imo ?? board?.imo ?? null,
      vesselType: s.vesselType,
      destination: s.destination,
      eta: board?.etaSulina ?? (s.eta === null ? null : new Date(now + s.eta).toISOString()),
      cargo: s.cargo,
      notes: s.notes,
      status: s.status,
      staffNote: s.staffNote,
      vesselId: board?.id ?? null,
      createdAt: new Date(now - s.createdAgo).toISOString(),
      updatedAt: new Date(now - s.updatedAgo).toISOString(),
    };
  });
}
