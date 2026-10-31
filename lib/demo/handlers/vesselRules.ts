import {
  CONDITIONS,
  DESTINATIONS,
  T1_VALUES,
  VESSEL_TYPES,
  type ChecklistKey,
  type VesselView,
} from "@/lib/vessels/types";
import { ROLE } from "@/lib/auth/roles";
import { isIsoDate } from "../http";
import { toUserRef } from "../presenters";
import type { DemoState, FieldChanges, FieldValue, VesselRow } from "../types";

/** Vessel DTO rules, change diff and presenter — mirrors backend vessels/{dto,vessel-changes,vessel-presenter}.ts */

export const EDITABLE = [
  "name", "imo", "mmsi", "type", "destination", "condition", "masterName", "masterPhone", "masterEmail",
  "officeName", "officePhone", "officeEmail", "portAgent", "etaSulina", "arrivedAt", "inPortAt", "departedAt",
  "prearrivalsIn", "prearrivalsOut", "mswIn", "mswOut", "pdaSent", "paid", "t1", "pilotageArranged", "pilot",
  "notes", "lat", "lng",
] as const;
export type EditableField = (typeof EDITABLE)[number];

type Rule =
  | { k: "text"; min?: number; max: number; pattern?: RegExp; code?: string; nullable: boolean }
  | { k: "email"; max: number }
  | { k: "enum"; values: readonly string[]; nullable: boolean }
  | { k: "bool" }
  | { k: "date" }
  | { k: "num"; min: number; max: number };

const text = (max: number): Rule => ({ k: "text", max, nullable: true });

const RULES: Record<EditableField, Rule> = {
  name: { k: "text", min: 2, max: 120, nullable: false },
  imo: { k: "text", max: 7, pattern: /^\d{7}$/, code: "imoInvalid", nullable: true },
  mmsi: { k: "text", max: 9, pattern: /^\d{9}$/, code: "mmsiInvalid", nullable: true },
  type: { k: "enum", values: VESSEL_TYPES, nullable: false },
  destination: { k: "enum", values: DESTINATIONS, nullable: false },
  condition: { k: "enum", values: CONDITIONS, nullable: true },
  masterName: text(120),
  masterPhone: text(50),
  masterEmail: { k: "email", max: 255 },
  officeName: text(120),
  officePhone: text(50),
  officeEmail: { k: "email", max: 255 },
  portAgent: text(255),
  etaSulina: { k: "date" },
  arrivedAt: { k: "date" },
  inPortAt: { k: "date" },
  departedAt: { k: "date" },
  prearrivalsIn: { k: "enum", values: ["ok", "not_ok"], nullable: false },
  prearrivalsOut: { k: "enum", values: ["ok", "not_ok"], nullable: false },
  mswIn: { k: "bool" },
  mswOut: { k: "bool" },
  pdaSent: { k: "bool" },
  paid: { k: "bool" },
  t1: { k: "enum", values: T1_VALUES, nullable: true },
  pilotageArranged: { k: "bool" },
  pilot: text(255),
  notes: text(4000),
  lat: { k: "num", min: -90, max: 90 },
  lng: { k: "num", min: -180, max: 180 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function check(field: string, rule: Rule, value: unknown): string | null {
  if (value === null) {
    const nullable = rule.k === "email" || rule.k === "date" || rule.k === "num" || (rule.k !== "bool" && rule.nullable);
    return nullable ? null : `${field} should not be null or undefined`;
  }
  switch (rule.k) {
    case "text":
      if (typeof value !== "string") return `${field} must be a string`;
      if (rule.pattern && !rule.pattern.test(value)) return rule.code ?? `${field} is invalid`;
      if (rule.min && value.length < rule.min) return `${field} must be longer than or equal to ${rule.min} characters`;
      if (value.length > rule.max) return `${field} must be shorter than or equal to ${rule.max} characters`;
      return null;
    case "email":
      return typeof value === "string" && EMAIL_RE.test(value) && value.length <= rule.max ? null : `${field} must be an email`;
    case "enum":
      return typeof value === "string" && rule.values.includes(value)
        ? null
        : `${field} must be one of the following values: ${rule.values.join(", ")}`;
    case "bool":
      return typeof value === "boolean" ? null : `${field} must be a boolean value`;
    case "date":
      return isIsoDate(value) ? null : `${field} must be a valid ISO 8601 date string`;
    case "num":
      if (typeof value !== "number" || !Number.isFinite(value)) return `${field} must be a number conforming to the specified constraints`;
      if (value < rule.min) return `${field} must not be less than ${rule.min}`;
      if (value > rule.max) return `${field} must not be greater than ${rule.max}`;
      return null;
  }
}

/** Validates the fields present in the body; `required` ones must be present (create) */
export function validateVesselInput(
  body: Record<string, unknown>,
  required: readonly EditableField[] = [],
): { values: Partial<Record<EditableField, unknown>>; errors: Record<string, string> } {
  const values: Partial<Record<EditableField, unknown>> = {};
  const errors: Record<string, string> = {};
  for (const field of EDITABLE) {
    const present = field in body && body[field] !== undefined;
    if (!present) {
      if (required.includes(field)) errors[field] = check(field, RULES[field], null) ?? `${field} should not be empty`;
      continue;
    }
    const value = body[field];
    const error = check(field, RULES[field], value);
    if (error) errors[field] = error;
    else values[field] = typeof value === "string" && RULES[field].k === "date" ? new Date(value).toISOString() : value;
  }
  return { values, errors };
}

export function toFieldValue(value: unknown): FieldValue {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return JSON.stringify(value);
}

export function diffVessel(current: VesselRow, values: Partial<Record<EditableField, unknown>>): FieldChanges {
  const changes: FieldChanges = {};
  for (const field of EDITABLE) {
    if (!(field in values)) continue;
    const from = toFieldValue(current[field]);
    const to = toFieldValue(values[field]);
    if (from !== to) changes[field] = { from, to };
  }
  return changes;
}

export function createdChanges(values: Partial<Record<EditableField, unknown>>): FieldChanges {
  const changes: FieldChanges = {};
  for (const field of EDITABLE) {
    const to = toFieldValue(values[field]);
    if (to !== null) changes[field] = { from: null, to };
  }
  return changes;
}

const CHECKLIST_KEYS: ChecklistKey[] = ["prearrivalsIn", "mswIn", "pdaSent", "t1", "pilotageArranged", "paid", "prearrivalsOut", "mswOut"];

function itemDone(v: VesselRow, key: ChecklistKey): boolean {
  if (key === "prearrivalsIn") return v.prearrivalsIn === "ok";
  if (key === "prearrivalsOut") return v.prearrivalsOut === "ok";
  if (key === "t1") return v.t1 === "yes" || v.t1 === "not_needed";
  return v[key] === true;
}

function stage(v: VesselRow): VesselView["stage"] {
  if (v.departedAt) return "departed";
  if (v.inPortAt) return "in_port";
  if (v.arrivedAt) return "at_roads";
  return "expected";
}

/** Admin/staff see internal data; viewers get restricted=true with internal fields nulled */
export function toVesselView(v: VesselRow, state: DemoState, roleId: number): VesselView {
  const restricted = roleId !== ROLE.admin && roleId !== ROLE.staff;
  const pending = CHECKLIST_KEYS.filter((k) => !itemDone(v, k));
  const base = {
    id: v.id, name: v.name, imo: v.imo, mmsi: v.mmsi, type: v.type, destination: v.destination, condition: v.condition,
    etaSulina: v.etaSulina, arrivedAt: v.arrivedAt, inPortAt: v.inPortAt, departedAt: v.departedAt,
    lat: v.lat, lng: v.lng, sog: v.sog, cog: v.cog, positionSource: v.positionSource, positionAt: v.positionAt,
    stage: stage(v), createdAt: v.createdAt, updatedAt: v.updatedAt, restricted,
  };
  if (restricted) {
    return {
      ...base, masterName: null, masterPhone: null, masterEmail: null, officeName: null, officePhone: null,
      officeEmail: null, portAgent: null, prearrivalsIn: null, prearrivalsOut: null, mswIn: null, mswOut: null,
      pdaSent: null, paid: null, t1: null, pilotageArranged: null, pilot: null, notes: null, checklist: null,
      unpaidAfterDeparture: null, updatedBy: null,
    };
  }
  return {
    ...base, masterName: v.masterName, masterPhone: v.masterPhone, masterEmail: v.masterEmail, officeName: v.officeName,
    officePhone: v.officePhone, officeEmail: v.officeEmail, portAgent: v.portAgent, prearrivalsIn: v.prearrivalsIn,
    prearrivalsOut: v.prearrivalsOut, mswIn: v.mswIn, mswOut: v.mswOut, pdaSent: v.pdaSent, paid: v.paid, t1: v.t1,
    pilotageArranged: v.pilotageArranged, pilot: v.pilot, notes: v.notes,
    checklist: { done: CHECKLIST_KEYS.length - pending.length, total: CHECKLIST_KEYS.length, pending },
    unpaidAfterDeparture: Boolean(v.departedAt) && !v.paid,
    updatedBy: toUserRef(state, v.updatedById),
  };
}
