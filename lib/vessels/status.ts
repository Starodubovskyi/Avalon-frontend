import type {
  ChecklistKey,
  T1Status,
  VesselStage,
  VesselView,
} from "./types";

export interface StageMeta {
  label: string;
  short: string;
  /** tailwind text/bg classes built from the --st-* tokens */
  dot: string;
  text: string;
  soft: string;
  border: string;
  /** raw css color for the map */
  cssVar: string;
}

export const STAGE_META: Record<VesselStage, StageMeta> = {
  expected: {
    label: "Expected",
    short: "ETA",
    dot: "bg-stage-expected",
    text: "text-stage-expected",
    soft: "bg-stage-expected/10",
    border: "border-l-stage-expected",
    cssVar: "--st-expected",
  },
  at_roads: {
    label: "At Sulina roads",
    short: "Roads",
    dot: "bg-stage-roads",
    text: "text-stage-roads",
    soft: "bg-stage-roads/10",
    border: "border-l-stage-roads",
    cssVar: "--st-roads",
  },
  in_port: {
    label: "In port",
    short: "Port",
    dot: "bg-stage-port",
    text: "text-stage-port",
    soft: "bg-stage-port/10",
    border: "border-l-stage-port",
    cssVar: "--st-port",
  },
  departed: {
    label: "Departed",
    short: "Sailed",
    dot: "bg-stage-departed",
    text: "text-stage-departed",
    soft: "bg-stage-departed/10",
    border: "border-l-stage-departed",
    cssVar: "--st-departed",
  },
};

export interface ChecklistItemDef {
  key: ChecklistKey;
  label: string;
  short: string;
  hint: string;
  phase: "arrival" | "finance" | "departure";
}

export const CHECKLIST: ChecklistItemDef[] = [
  { key: "prearrivalsIn", label: "Prearrivals IN", short: "PRE IN", hint: "Pre-arrival documents are in order", phase: "arrival" },
  { key: "mswIn", label: "MSW IN", short: "MSW IN", hint: "Maritime Single Window filled for arrival", phase: "arrival" },
  { key: "pdaSent", label: "PDA", short: "PDA", hint: "Proforma disbursement account sent", phase: "finance" },
  { key: "t1", label: "T1", short: "T1", hint: "Customs transit document (yes / not needed)", phase: "arrival" },
  { key: "pilotageArranged", label: "Sulina pilotage", short: "PILOT", hint: "Pilot ordered for the Sulina channel", phase: "arrival" },
  { key: "paid", label: "Payment", short: "PAID", hint: "Payment received", phase: "finance" },
  { key: "prearrivalsOut", label: "Prearrivals OUT", short: "PRE OUT", hint: "Departure documents are in order", phase: "departure" },
  { key: "mswOut", label: "MSW OUT", short: "MSW OUT", hint: "Maritime Single Window filled for departure", phase: "departure" },
];

export function stageOf(v: Pick<VesselView, "arrivedAt" | "inPortAt" | "departedAt">): VesselStage {
  if (v.departedAt) return "departed";
  if (v.inPortAt) return "in_port";
  if (v.arrivedAt) return "at_roads";
  return "expected";
}

export function t1Done(t1: T1Status | null): boolean {
  return t1 === "yes" || t1 === "not_needed";
}

/** null = not visible to this user (restricted) */
export function isItemDone(v: VesselView, key: ChecklistKey): boolean | null {
  if (v.restricted) return null;
  switch (key) {
    case "prearrivalsIn":
      return v.prearrivalsIn === "ok";
    case "prearrivalsOut":
      return v.prearrivalsOut === "ok";
    case "t1":
      return t1Done(v.t1);
    default:
      return v[key] === true;
  }
}

export function isUnpaidAfterDeparture(v: VesselView): boolean {
  if (v.restricted) return false;
  if (typeof v.unpaidAfterDeparture === "boolean") return v.unpaidAfterDeparture;
  return !!v.departedAt && v.paid !== true;
}

export function pendingCount(v: VesselView): number {
  if (v.restricted) return 0;
  if (v.checklist) return v.checklist.total - v.checklist.done;
  return CHECKLIST.filter((c) => isItemDone(v, c.key) === false).length;
}

const STAGE_ORDER: Record<VesselStage, number> = {
  in_port: 0,
  at_roads: 1,
  expected: 2,
  departed: 3,
};

function timeOf(iso: string | null): number {
  return iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY;
}

/** Board order: unpaid departures pinned on top, then in port → roads → expected → departed */
export function compareVessels(a: VesselView, b: VesselView): number {
  const ua = isUnpaidAfterDeparture(a) ? 0 : 1;
  const ub = isUnpaidAfterDeparture(b) ? 0 : 1;
  if (ua !== ub) return ua - ub;
  const sa = STAGE_ORDER[a.stage];
  const sb = STAGE_ORDER[b.stage];
  if (sa !== sb) return sa - sb;
  if (a.stage === "departed") return timeOf(b.departedAt) - timeOf(a.departedAt);
  return timeOf(a.arrivedAt ?? a.etaSulina) - timeOf(b.arrivedAt ?? b.etaSulina);
}

export const STALE_POSITION_MS = 6 * 60 * 60 * 1000;

export function isPositionStale(v: VesselView, now = Date.now()): boolean {
  if (!v.positionAt) return true;
  return now - new Date(v.positionAt).getTime() > STALE_POSITION_MS;
}

export function daysSince(iso: string | null, now = Date.now()): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
}
