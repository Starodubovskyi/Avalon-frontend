import {
  CONDITIONS,
  DESTINATIONS,
  VESSEL_TYPES,
  type Destination,
  type VesselCondition,
  type VesselType,
} from "@/lib/vessels/types";

/**
 * Indicative proforma disbursement account (PDA) model for a Danube call via Sulina.
 * Pure functions, EUR, rounded to whole euros. Rates are planning figures only —
 * the real PDA comes from Avalon with current tariffs.
 */

export interface PdaInput {
  port: Destination;
  vesselType: VesselType;
  /** gross tonnage */
  gt: number;
  /** length overall, metres */
  loa: number;
  /** days alongside */
  days: number;
  condition: VesselCondition;
}

export type PdaGroup = "channel" | "port" | "services" | "agency";

export interface PdaLine {
  id: string;
  group: PdaGroup;
  label: string;
  /** how the amount was built, in plain words */
  basis: string;
  amount: number;
}

export interface PdaEstimate {
  input: PdaInput;
  lines: PdaLine[];
  total: number;
  currency: "EUR";
}

export const PDA_GROUP_LABEL: Record<PdaGroup, string> = {
  channel: "Sulina channel",
  port: "Port charges",
  services: "Marine services",
  agency: "Agency & clearance",
};

export const PDA_LIMITS = {
  gt: { min: 500, max: 30_000, step: 100 },
  loa: { min: 50, max: 200, step: 1 },
  days: { min: 1, max: 20, step: 1 },
} as const;

export const DEFAULT_PDA_INPUT: PdaInput = {
  port: "GALATI",
  vesselType: "general_cargo",
  gt: 5000,
  loa: 110,
  days: 3,
  condition: "loaded",
};

interface PortTariff {
  /** port dues, EUR per GT per call */
  portDues: number;
  /** berth dues, EUR per GT per day alongside */
  berthPerGtDay: number;
  /** river pilotage Sulina ↔ berth, per passage: base + per GT */
  riverPilotBase: number;
  riverPilotPerGt: number;
  /** towage is compulsory from this GT */
  tugFromGt: number;
  tugPerMove: number;
  /** per mooring or unmooring operation */
  mooring: number;
  /** customs, border, sanitary clearance per call */
  clearance: number;
}

const PORT_TARIFF: Record<Destination, PortTariff> = {
  TULCEA: { portDues: 0.11, berthPerGtDay: 0.03, riverPilotBase: 180, riverPilotPerGt: 0.02, tugFromGt: 4000, tugPerMove: 420, mooring: 140, clearance: 260 },
  IZMAIL: { portDues: 0.14, berthPerGtDay: 0.04, riverPilotBase: 360, riverPilotPerGt: 0.045, tugFromGt: 3000, tugPerMove: 520, mooring: 170, clearance: 340 },
  ORLIVKA: { portDues: 0.12, berthPerGtDay: 0.034, riverPilotBase: 340, riverPilotPerGt: 0.04, tugFromGt: 4000, tugPerMove: 460, mooring: 150, clearance: 320 },
  RENI: { portDues: 0.135, berthPerGtDay: 0.038, riverPilotBase: 400, riverPilotPerGt: 0.05, tugFromGt: 3000, tugPerMove: 500, mooring: 165, clearance: 340 },
  GIURGIULESTI: { portDues: 0.15, berthPerGtDay: 0.042, riverPilotBase: 410, riverPilotPerGt: 0.05, tugFromGt: 3000, tugPerMove: 510, mooring: 170, clearance: 360 },
  GALATI: { portDues: 0.12, berthPerGtDay: 0.035, riverPilotBase: 420, riverPilotPerGt: 0.05, tugFromGt: 3500, tugPerMove: 480, mooring: 160, clearance: 290 },
  BRAILA: { portDues: 0.115, berthPerGtDay: 0.034, riverPilotBase: 480, riverPilotPerGt: 0.055, tugFromGt: 3500, tugPerMove: 470, mooring: 155, clearance: 290 },
};

const CHANNEL_PER_GT = 0.3;
const BALLAST_CHANNEL_FACTOR = 0.8;
const BALLAST_PORT_FACTOR = 0.9;
const SULINA_PILOT_BASE = 350;
const SULINA_PILOT_PER_M = 4;
const TUG_PER_GT = 0.02;

const TYPE_EXTRA: Record<VesselType, { label: string; basis: string; amount: number } | null> = {
  general_cargo: null,
  tanker: { label: "Tanker safety & gas-free inspection", basis: "Flat, per call", amount: 260 },
  livestock: { label: "Veterinary inspection & certificates", basis: "Flat, per call", amount: 420 },
};

const AGENCY_BANDS: { upTo: number; fee: number }[] = [
  { upTo: 3000, fee: 1100 },
  { upTo: 6000, fee: 1400 },
  { upTo: 10_000, fee: 1750 },
  { upTo: 20_000, fee: 2200 },
  { upTo: Number.POSITIVE_INFINITY, fee: 2700 },
];

const eur = (n: number) => Math.round(n);
const num = (n: number) => n.toLocaleString("en-GB");

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Missing or blank → NaN, so the default applies (Number(null) would be 0) */
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return Number.NaN;
  return Number(value);
}

function pick<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.find((a) => a === value) ?? fallback;
}

/** Keeps every input inside the model's range; unknown values fall back to defaults */
export function normalizePdaInput(raw: Partial<Record<keyof PdaInput, string | number | null>>): PdaInput {
  const d = DEFAULT_PDA_INPUT;
  return {
    port: pick(raw.port == null ? null : String(raw.port), DESTINATIONS, d.port),
    vesselType: pick(raw.vesselType == null ? null : String(raw.vesselType), VESSEL_TYPES, d.vesselType),
    condition: pick(raw.condition == null ? null : String(raw.condition), CONDITIONS, d.condition),
    gt: clamp(toNumber(raw.gt), PDA_LIMITS.gt.min, PDA_LIMITS.gt.max, d.gt),
    loa: clamp(toNumber(raw.loa), PDA_LIMITS.loa.min, PDA_LIMITS.loa.max, d.loa),
    days: clamp(toNumber(raw.days), PDA_LIMITS.days.min, PDA_LIMITS.days.max, d.days),
  };
}

export function agencyFee(gt: number, days: number): number {
  const band = AGENCY_BANDS.find((b) => gt <= b.upTo) ?? AGENCY_BANDS[AGENCY_BANDS.length - 1];
  return band.fee + Math.max(0, days - 5) * 60;
}

export function estimatePda(raw: PdaInput): PdaEstimate {
  const input = normalizePdaInput(raw);
  const { gt, loa, days, condition, vesselType } = input;
  const t = PORT_TARIFF[input.port];
  const ballast = condition === "ballast";
  const channelRate = CHANNEL_PER_GT * (ballast ? BALLAST_CHANNEL_FACTOR : 1);
  const lines: PdaLine[] = [
    {
      id: "channel-dues",
      group: "channel",
      label: "Sulina channel dues",
      basis: `${num(gt)} GT × €${channelRate.toFixed(2)} × 2 passages${ballast ? " (ballast rate)" : ""}`,
      amount: eur(gt * channelRate * 2),
    },
    {
      id: "sulina-pilotage",
      group: "channel",
      label: "Sulina pilotage, in & out",
      basis: `€${SULINA_PILOT_BASE} + ${loa} m LOA × €${SULINA_PILOT_PER_M}, × 2`,
      amount: eur((SULINA_PILOT_BASE + loa * SULINA_PILOT_PER_M) * 2),
    },
    {
      id: "river-pilotage",
      group: "services",
      label: "River pilotage Sulina ↔ berth",
      basis: `€${t.riverPilotBase} + ${num(gt)} GT × €${t.riverPilotPerGt}, × 2`,
      amount: eur((t.riverPilotBase + gt * t.riverPilotPerGt) * 2),
    },
    {
      id: "port-dues",
      group: "port",
      label: "Port dues",
      basis: `${num(gt)} GT × €${t.portDues}${ballast ? " × 0.9 ballast" : ""}`,
      amount: eur(gt * t.portDues * (ballast ? BALLAST_PORT_FACTOR : 1)),
    },
    {
      id: "berth-dues",
      group: "port",
      label: `Berth dues, ${days} ${days === 1 ? "day" : "days"}`,
      basis: `${num(gt)} GT × €${t.berthPerGtDay} × ${days}`,
      amount: eur(gt * t.berthPerGtDay * days),
    },
    {
      id: "mooring",
      group: "services",
      label: "Mooring & unmooring",
      basis: `2 operations × €${gt > 10_000 ? Math.round(t.mooring * 1.3) : t.mooring}`,
      amount: eur(2 * t.mooring * (gt > 10_000 ? 1.3 : 1)),
    },
  ];

  if (gt >= t.tugFromGt) {
    lines.push({
      id: "towage",
      group: "services",
      label: "Towage, in & out",
      basis: `(€${t.tugPerMove} + ${num(gt)} GT × €${TUG_PER_GT}) × 2 — compulsory from ${num(t.tugFromGt)} GT`,
      amount: eur((t.tugPerMove + gt * TUG_PER_GT) * 2),
    });
  }

  const wasteFactor = vesselType === "tanker" ? 1.5 : 1;
  lines.push({
    id: "waste",
    group: "port",
    label: "Ship-generated waste fee",
    basis: `€180 + ${num(gt)} GT × €0.015${wasteFactor > 1 ? " × 1.5 slops" : ""}`,
    amount: eur((180 + gt * 0.015) * wasteFactor),
  });

  const extra = TYPE_EXTRA[vesselType];
  if (extra) lines.push({ id: "type-extra", group: "agency", ...extra });

  lines.push(
    {
      id: "clearance",
      group: "agency",
      label: "Customs, border & sanitary clearance",
      basis: "Flat, per call",
      amount: t.clearance,
    },
    {
      id: "agency-fee",
      group: "agency",
      label: "Agency fee",
      basis: days > 5 ? `GT band + ${days - 5} extra days × €60` : "By GT band",
      amount: agencyFee(gt, days),
    },
    {
      id: "comms",
      group: "agency",
      label: "Communication, transport & bank charges",
      basis: `€150 + ${days} × €25`,
      amount: eur(150 + days * 25),
    },
  );

  return { input, lines, total: lines.reduce((sum, l) => sum + l.amount, 0), currency: "EUR" };
}

const EUR_FMT = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function fmtEur(amount: number): string {
  return EUR_FMT.format(amount);
}

/** Query string for /request so the agency form opens prefilled with the estimate */
export function requestQueryFromEstimate(estimate: PdaEstimate): string {
  const { input, total } = estimate;
  return new URLSearchParams({
    destination: input.port,
    vesselType: input.vesselType,
    gt: String(input.gt),
    loa: String(input.loa),
    days: String(input.days),
    condition: input.condition,
    estimate: String(total),
  }).toString();
}
