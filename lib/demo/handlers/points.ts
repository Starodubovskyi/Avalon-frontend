import { DEFAULT_POINT_KIND, POINT_KINDS, toPointKind } from "@/lib/points/team-points";
import { FREE_ACTIVITIES, activityFromText, isActivityCode, type ActivityCode } from "@/lib/points/activities";
import { LOGO_MAX_CHARS, LOGO_MIME_TYPES, TITLE_MAX } from "@/lib/points/limits";
import { markDirty } from "../db";
import { nowIso, uuid } from "../ids";
import {
  TEAM_ROLES,
  byNewest,
  created,
  invalid,
  noContent,
  notFound,
  ok,
  type DemoResult,
  requireRoles,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserRef, userRank } from "../presenters";
import type { DemoState, MapPointRow } from "../types";

/** /map-points — team-wide points on the fleet map (GeoPointsV2), staff/admin only */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO_RE = /^data:([a-z]+\/[a-z]+);base64,([A-Za-z0-9+/]+={0,2})$/;

type TextField = "firstName" | "lastName" | "activity" | "phone" | "email" | "address" | "notes";
type Field = TextField | "kind" | "lat" | "lng" | "activities" | "logo";
/** Legacy text columns where "" is a value (clears the stored text), not "not given" */
const CLEARABLE: readonly TextField[] = ["lastName", "activity"];
const TEXT_MAX: Record<TextField, number> = { firstName: TITLE_MAX, lastName: 255, activity: 255, phone: 50, email: 255, address: 500, notes: 2000 };

/** Demo databases saved before GeoPointsV2 get the same mapping as the migration */
function upgrade(state: DemoState): void {
  let changed = false;
  for (const raw of state.mapPoints) {
    const p = raw as MapPointRow & Partial<Pick<MapPointRow, "activities" | "logo" | "logoVersion" | "favoritedBy">>;
    const current =
      Array.isArray(p.activities) &&
      Array.isArray(p.favoritedBy) &&
      p.logo !== undefined &&
      p.logoVersion !== undefined &&
      (POINT_KINDS as readonly string[]).includes(p.kind);
    if (current) continue;
    const legacy = activityFromText(p.activity);
    Object.assign(p, {
      kind: toPointKind(p.kind),
      activities: Array.isArray(p.activities) ? p.activities.filter(isActivityCode) : legacy ? [legacy] : [],
      logo: p.logo ?? null,
      logoVersion: p.logo ? p.logoVersion ?? newLogoVersion() : null,
      favoritedBy: Array.isArray(p.favoritedBy) ? p.favoritedBy : [],
    });
    changed = true;
  }
  if (changed) markDirty();
}

function newLogoVersion(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** The list carries only hasLogo/logoVersion; the image is served by GET /map-points/:id/logo */
function toView(req: DemoRequest, p: MapPointRow) {
  return {
    id: p.id,
    userId: p.userId,
    kind: p.kind,
    lat: p.lat,
    lng: p.lng,
    firstName: p.firstName,
    lastName: p.lastName,
    activity: p.activity,
    activities: p.activities,
    hasLogo: !!p.logo,
    logoVersion: p.logo ? p.logoVersion : null,
    phone: p.phone,
    email: p.email,
    address: p.address,
    notes: p.notes,
    photoId: null,
    isFavorite: !!req.user && p.favoritedBy.includes(req.user.id),
    rank: userRank(req.state, p.userId),
    createdBy: toUserRef(req.state, p.userId),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** IsPresent + IsActivityCodes: absent is fine, null / not an array / unknown code → invalid; duplicates dropped */
function parseActivities(v: unknown, errors: Record<string, string>): ActivityCode[] | undefined {
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || !v.every(isActivityCode)) {
    errors.activities = "invalid";
    return undefined;
  }
  return v.filter((c, i) => v.indexOf(c) === i);
}

/** IsOptional + IsImageDataUrl: null or "" clears; tooLong is checked before the format */
function parseLogo(v: unknown, errors: Record<string, string>): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string") errors.logo = "invalid";
  else if (v.length > LOGO_MAX_CHARS) errors.logo = "tooLong";
  else {
    const mime = LOGO_RE.exec(v)?.[1] ?? "";
    if (!(LOGO_MIME_TYPES as readonly string[]).includes(mime)) errors.logo = "invalid";
    else return v;
  }
  return undefined;
}

/** Empty strings count as "not given" (emptyToUndefined); notes clear to null, lastName/activity to "" */
function parse(body: Record<string, unknown>, partial: boolean): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const errors: Record<string, string> = {};
  const raw = (f: TextField | "kind" | "lat" | "lng") => {
    const v = body[f];
    if (typeof v !== "string" || v.trim() !== "") return v;
    if (f === "notes") return null;
    return (CLEARABLE as readonly string[]).includes(f) ? "" : undefined;
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
    else if (v.length > TEXT_MAX[f]) errors[f] = `${f} must be shorter than or equal to ${TEXT_MAX[f]} characters`;
    else if (f === "email" && !EMAIL_RE.test(v)) errors.email = "email must be an email";
    else out[f] = v;
  }
  const activities = parseActivities(body.activities, errors);
  if (activities !== undefined) out.activities = activities;
  const logo = parseLogo(body.logo, errors);
  if (logo !== undefined) out.logo = logo;
  if (Object.keys(errors).length) invalid(errors);
  // business rule checked by the service after the DTO passed
  if (activities && activities.length > FREE_ACTIVITIES) invalid({ activities: "premiumRequired" });
  return out;
}

function list(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  upgrade(req.state);
  const rows = req.state.mapPoints.filter((p) => !p.deletedAt).sort(byNewest).slice(0, 1000);
  return ok(rows.map((p) => toView(req, p)));
}

function findActive(req: DemoRequest): MapPointRow {
  upgrade(req.state);
  const id = uuidParam(req);
  return req.state.mapPoints.find((p) => p.id === id && !p.deletedAt) ?? notFound("Map point not found");
}

function getOne(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  return ok(toView(req, findActive(req)));
}

function create(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const v = parse(req.body, false);
  const at = nowIso();
  const row: MapPointRow = {
    id: uuid(),
    userId: user.id,
    kind: (v.kind as MapPointRow["kind"] | undefined) ?? DEFAULT_POINT_KIND,
    lat: v.lat as number,
    lng: v.lng as number,
    firstName: v.firstName as string,
    lastName: (v.lastName as string | undefined) ?? "",
    activity: (v.activity as string | undefined) ?? "",
    activities: (v.activities as MapPointRow["activities"] | undefined) ?? [],
    logo: (v.logo as string | null | undefined) ?? null,
    logoVersion: v.logo ? newLogoVersion() : null,
    phone: (v.phone as string | undefined) ?? null,
    email: (v.email as string | undefined) ?? null,
    address: (v.address as string | undefined) ?? null,
    notes: (v.notes as string | null | undefined) ?? null,
    favoritedBy: [],
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  };
  req.state.mapPoints.push(row);
  return created(toView(req, row));
}

function update(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const row = findActive(req);
  const v = parse(req.body, true);
  const logoChanged = v.logo !== undefined && v.logo !== row.logo;
  Object.assign(row, v, { updatedAt: nowIso() });
  if (logoChanged) row.logoVersion = row.logo ? newLogoVersion() : null;
  return ok(toView(req, row));
}

function remove(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  findActive(req).deletedAt = nowIso();
  return noContent();
}

/** data: URL (base64 or percent-encoded, e.g. the seeded SVG marks) → Blob */
function dataUrlBlob(url: string): Blob | null {
  const m = /^data:([^;,]+)((?:;[^;,]*)*?),([\s\S]*)$/.exec(url);
  if (!m) return null;
  const [, mime, params, payload] = m;
  if (params.includes(";base64")) {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  return new Blob([decodeURIComponent(payload)], { type: mime });
}

/** GET /map-points/:id/logo?v= — the image bytes, 404 without a logo */
function logo(req: DemoRequest): DemoResult {
  requireRoles(req, TEAM_ROLES);
  const row = findActive(req);
  const blob = row.logo ? dataUrlBlob(row.logo) : null;
  if (!blob) return notFound("Logo not found");
  return {
    status: 200,
    blob,
    headers: { "content-type": blob.type, "content-length": String(blob.size), "cache-control": "private, max-age=31536000, immutable" },
  };
}

/** Idempotent personal star: POST adds, DELETE removes; 404 for a missing point */
function setFavorite(on: boolean) {
  return (req: DemoRequest) => {
    const user = requireRoles(req, TEAM_ROLES);
    const row = findActive(req);
    const has = row.favoritedBy.includes(user.id);
    if (on && !has) row.favoritedBy.push(user.id);
    if (!on && has) row.favoritedBy = row.favoritedBy.filter((id) => id !== user.id);
    return ok({ isFavorite: on });
  };
}

export const pointRoutes: RouteDef[] = [
  ["GET", "/map-points", list],
  ["POST", "/map-points/:id/favorite", setFavorite(true)],
  ["DELETE", "/map-points/:id/favorite", setFavorite(false)],
  ["GET", "/map-points/:id/logo", logo],
  ["GET", "/map-points/:id", getOne],
  ["POST", "/map-points", create],
  ["PATCH", "/map-points/:id", update],
  ["DELETE", "/map-points/:id", remove],
];
