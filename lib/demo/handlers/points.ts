import { POINT_KINDS } from "@/lib/points/team-points";
import { nowIso, uuid } from "../ids";
import {
  TEAM_ROLES,
  byNewest,
  created,
  invalid,
  noContent,
  notFound,
  ok,
  requireRoles,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserRef } from "../presenters";
import type { DemoState, MapPointRow } from "../types";

/** /map-points — team-wide contacts on the fleet map, staff/admin only */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "kind" | "lat" | "lng" | "firstName" | "lastName" | "activity" | "phone" | "email" | "address" | "notes";
const TEXT_MAX: Partial<Record<Field, number>> = { firstName: 255, lastName: 255, activity: 255, phone: 50, email: 255, address: 500, notes: 2000 };

function toView(state: DemoState, p: MapPointRow) {
  return {
    id: p.id,
    userId: p.userId,
    kind: p.kind,
    lat: p.lat,
    lng: p.lng,
    firstName: p.firstName,
    lastName: p.lastName,
    activity: p.activity,
    phone: p.phone,
    email: p.email,
    address: p.address,
    notes: p.notes,
    photoId: null,
    isFavorite: false,
    createdBy: toUserRef(state, p.userId),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** Empty strings count as "not given" (emptyToUndefined), notes clear to null */
function parse(body: Record<string, unknown>, partial: boolean): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const errors: Record<string, string> = {};
  const raw = (f: Field) => {
    const v = body[f];
    return typeof v === "string" && v.trim() === "" ? (f === "notes" ? null : undefined) : v;
  };
  const kind = raw("kind");
  if (kind !== undefined) {
    if (typeof kind === "string" && (POINT_KINDS as readonly string[]).includes(kind)) out.kind = kind;
    else errors.kind = `kind must be one of the following values: ${POINT_KINDS.join(", ")}`;
  }
  for (const [f, min, max] of [["lat", -90, 90], ["lng", -180, 180]] as const) {
    const v = raw(f);
    if (v === undefined) {
      if (!partial) errors[f] = `${f} must not be less than ${min}`;
      continue;
    }
    const n = typeof v === "string" ? Number(v) : v;
    if (typeof n !== "number" || !Number.isFinite(n)) errors[f] = `${f} must be a number conforming to the specified constraints`;
    else if (n < min || n > max) errors[f] = `${f} must not be ${n < min ? `less than ${min}` : `greater than ${max}`}`;
    else out[f] = n;
  }
  for (const f of ["firstName", "lastName", "activity", "phone", "email", "address", "notes"] as const) {
    const v = raw(f);
    if (v === undefined) {
      if (f === "firstName" && !partial) errors.firstName = "firstName should not be empty";
      continue;
    }
    // IsOptional lets null through: contact fields clear, name-like columns are NOT NULL
    if (v === null) {
      if (f === "firstName") errors.firstName = "firstName should not be empty";
      else out[f] = f === "lastName" || f === "activity" ? "" : null;
      continue;
    }
    if (typeof v !== "string") errors[f] = `${f} must be a string`;
    else if (v.length > (TEXT_MAX[f] ?? 255)) errors[f] = `${f} must be shorter than or equal to ${TEXT_MAX[f]} characters`;
    else if (f === "email" && !EMAIL_RE.test(v)) errors.email = "email must be an email";
    else out[f] = v;
  }
  if (Object.keys(errors).length) invalid(errors);
  return out;
}

function list(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const rows = req.state.mapPoints.filter((p) => !p.deletedAt).sort(byNewest).slice(0, 1000);
  return ok(rows.map((p) => toView(req.state, p)));
}

function findActive(req: DemoRequest): MapPointRow {
  const id = uuidParam(req);
  return req.state.mapPoints.find((p) => p.id === id && !p.deletedAt) ?? notFound("Map point not found");
}

function getOne(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  return ok(toView(req.state, findActive(req)));
}

function create(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const v = parse(req.body, false);
  const at = nowIso();
  const row: MapPointRow = {
    id: uuid(),
    userId: user.id,
    kind: (v.kind as MapPointRow["kind"] | undefined) ?? "person",
    lat: v.lat as number,
    lng: v.lng as number,
    firstName: v.firstName as string,
    lastName: (v.lastName as string | undefined) ?? "",
    activity: (v.activity as string | undefined) ?? "",
    phone: (v.phone as string | undefined) ?? null,
    email: (v.email as string | undefined) ?? null,
    address: (v.address as string | undefined) ?? null,
    notes: (v.notes as string | null | undefined) ?? null,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  };
  req.state.mapPoints.push(row);
  return created(toView(req.state, row));
}

function update(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const id = uuidParam(req);
  const v = parse(req.body, true);
  const row = req.state.mapPoints.find((p) => p.id === id && !p.deletedAt) ?? notFound("Map point not found");
  Object.assign(row, v, { updatedAt: nowIso() });
  return ok(toView(req.state, row));
}

function remove(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  findActive(req).deletedAt = nowIso();
  return noContent();
}

export const pointRoutes: RouteDef[] = [
  ["GET", "/map-points", list],
  ["GET", "/map-points/:id", getOne],
  ["POST", "/map-points", create],
  ["PATCH", "/map-points/:id", update],
  ["DELETE", "/map-points/:id", remove],
];
