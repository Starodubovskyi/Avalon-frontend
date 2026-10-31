import { ROLE } from "@/lib/auth/roles";
import { uuid } from "../ids";
import {
  TEAM_ROLES,
  contains,
  created,
  fail,
  intQuery,
  invalid,
  noContent,
  notFound,
  ok,
  requireRoles,
  requireUser,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import type { PortRow, PortStatusValue } from "../types";

/** /ports (admin edits, everyone reads) and /ais/status (simulated AIS feed) */

const UNLOCODE_RE = /^[A-Z]{2}[A-Z0-9]{3}$/;

function normalizeStatus(raw: unknown): PortStatusValue | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  const v = raw.trim().toUpperCase();
  if (v.includes("CONGEST")) return "CONGESTED";
  if (v.includes("CLOSE")) return "CLOSED";
  if (v.includes("OPEN")) return "OPEN";
  return undefined;
}

function normalizeUnlocode(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const code = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  return UNLOCODE_RE.test(code) ? code : undefined;
}

function coord(raw: unknown, field: "lat" | "lng"): number | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  const limit = field === "lat" ? 90 : 180;
  if (typeof raw !== "number" || !Number.isFinite(raw) || Math.abs(raw) > limit) {
    return invalid({ [field]: `${field} must not be greater than ${limit}` });
  }
  return raw;
}

function list(req: DemoRequest) {
  requireUser(req);
  const page = intQuery(req, "page", 1, 10_000) ?? 1;
  const limit = intQuery(req, "limit", 1, 500) ?? 50;
  const status = normalizeStatus(req.query.status);
  const rows = req.state.ports
    .filter((p) => !p.deletedAt)
    .filter((p) => (status ? p.status === status : true))
    .filter((p) => contains([p.name, p.unlocode, p.country], req.query.search ?? ""))
    .sort((a, b) => a.name.localeCompare(b.name));
  return ok(rows.slice((page - 1) * limit, page * limit));
}

function findActive(req: DemoRequest): PortRow {
  const id = uuidParam(req);
  return req.state.ports.find((p) => p.id === id && !p.deletedAt) ?? notFound("Port not found");
}

function getOne(req: DemoRequest) {
  requireUser(req);
  return ok(findActive(req));
}

function assertFree(req: DemoRequest, unlocode: string, exceptId?: string) {
  if (req.state.ports.some((p) => !p.deletedAt && p.unlocode === unlocode && p.id !== exceptId)) {
    fail(409, { status: 409, errors: { unlocode: "alreadyExists" } });
  }
}

function create(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  const unlocode = normalizeUnlocode(req.body.unlocode) ?? invalid({ unlocode: "UN/LOCODE must be 5 characters (AA + 3)" });
  assertFree(req, unlocode);
  const at = new Date().toISOString();
  const name = typeof req.body.name === "string" && req.body.name.trim() ? req.body.name.trim() : unlocode;
  const row: PortRow = {
    id: uuid(),
    name,
    unlocode,
    country: typeof req.body.country === "string" && req.body.country.trim() ? req.body.country.trim() : unlocode.slice(0, 2),
    status: normalizeStatus(req.body.status) ?? "OPEN",
    timezone: typeof req.body.timezone === "string" && req.body.timezone.trim() ? req.body.timezone.trim() : "UTC",
    lat: coord(req.body.lat, "lat") ?? null,
    lng: coord(req.body.lng, "lng") ?? null,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  };
  req.state.ports.push(row);
  return created(row);
}

function update(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  const port = findActive(req);
  if (req.body.unlocode !== undefined) {
    const code = normalizeUnlocode(req.body.unlocode) ?? invalid({ unlocode: "UN/LOCODE must be 5 characters (AA + 3)" });
    assertFree(req, code, port.id);
    port.unlocode = code;
  }
  if (typeof req.body.name === "string" && req.body.name.trim()) port.name = req.body.name.trim();
  if (typeof req.body.country === "string" && req.body.country.trim()) port.country = req.body.country.trim();
  if (typeof req.body.timezone === "string" && req.body.timezone.trim()) port.timezone = req.body.timezone.trim();
  const status = normalizeStatus(req.body.status);
  if (status) port.status = status;
  const lat = coord(req.body.lat, "lat");
  const lng = coord(req.body.lng, "lng");
  if (lat !== undefined) port.lat = lat;
  if (lng !== undefined) port.lng = lng;
  port.updatedAt = new Date().toISOString();
  return ok(port);
}

function remove(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  findActive(req).deletedAt = new Date().toISOString();
  return noContent();
}

/** Simulated feed: positions drift on every list fetch, so the indicator reads "live" */
function aisStatus(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const tracked = req.state.vessels.filter((v) => !v.deletedAt && !v.departedAt && (v.imo || v.mmsi));
  const fixes = req.state.vessels.map((v) => (v.positionSource === "ais" ? v.positionAt : null)).filter((x): x is string => !!x);
  const last = fixes.sort().pop() ?? null;
  return ok({ enabled: true, connected: true, lastMessageAt: last, trackedVessels: tracked.length });
}

export const portRoutes: RouteDef[] = [
  ["GET", "/ports", list],
  ["GET", "/ports/:id", getOne],
  ["POST", "/ports", create],
  ["PATCH", "/ports/:id", update],
  ["DELETE", "/ports/:id", remove],
  ["GET", "/ais/status", aisStatus],
];
