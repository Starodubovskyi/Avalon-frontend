import { DEFAULT_POINT_KIND } from "@/lib/points/team-points";
import { CLIENT_POINT_LIMIT } from "@/lib/points/limits";
import { nowIso, uuid } from "../ids";
import {
  byNewest,
  created,
  forbidden,
  invalid,
  noContent,
  notFound,
  ok,
  requireUser,
  type DemoRequest,
  type DemoResult,
  type RouteDef,
} from "../http";
import { isTeamUser } from "../presenters";
import { canEditPoint, canSeePoint, checkParent, toPointView, visiblePoint } from "../pointView";
import type { MapPointRow } from "../types";
import { parsePoint } from "./pointRules";
import { pointExtraRoutes } from "./pointExtras";

/**
 * /map-points — everyone signed in: the team sees every point, clients see public ones and their own,
 * create up to CLIENT_POINT_LIMIT and edit only their own (stage 2).
 */

function newLogoVersion(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function list(req: DemoRequest) {
  const user = requireUser(req);
  const rows = req.state.mapPoints.filter((p) => !p.deletedAt && canSeePoint(user, p)).sort(byNewest).slice(0, 1000);
  return ok(rows.map((p) => toPointView(req.state, user, p)));
}

function getOne(req: DemoRequest) {
  const user = requireUser(req);
  return ok(toPointView(req.state, user, visiblePoint(req, user)));
}

/** Owner or the team; a visible point of someone else is 403, an invisible one 404 */
function editablePoint(req: DemoRequest): MapPointRow {
  const user = requireUser(req);
  const row = visiblePoint(req, user);
  if (!canEditPoint(user, row)) forbidden("Forbidden");
  return row;
}

function create(req: DemoRequest) {
  const user = requireUser(req);
  const v = parsePoint(req.body, false);
  if (!isTeamUser(user)) {
    const own = req.state.mapPoints.filter((p) => !p.deletedAt && p.userId === user.id).length;
    if (own >= CLIENT_POINT_LIMIT) invalid({ points: "limitReached" });
  }
  const activities = (v.activities as MapPointRow["activities"] | undefined) ?? [];
  // a new point has one free slot
  if (activities.length > 1) invalid({ activities: "premiumRequired" });
  if (typeof v.parentId === "string") checkParent(req.state, user, v.parentId, null);
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
    activities,
    logo: (v.logo as string | null | undefined) ?? null,
    logoVersion: v.logo ? newLogoVersion() : null,
    phone: (v.phone as string | undefined) ?? null,
    email: (v.email as string | undefined) ?? null,
    address: (v.address as string | undefined) ?? null,
    notes: (v.notes as string | null | undefined) ?? null,
    favoritedBy: [],
    // backend default by kind: a person pin is team-only
    visibility: (v.visibility as MapPointRow["visibility"] | undefined) ?? (v.kind === "private_person" || !v.kind ? "team" : "public"),
    description: (v.description as string | null | undefined) ?? null,
    website: (v.website as string | null | undefined) ?? null,
    parentId: (v.parentId as string | null | undefined) ?? null,
    activitySlots: 1,
    emailVerifiedAt: null,
    emailVerificationSentAt: null,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  };
  req.state.mapPoints.push(row);
  return created(toPointView(req.state, user, row));
}

function update(req: DemoRequest) {
  const user = requireUser(req);
  const row = editablePoint(req);
  const v = parsePoint(req.body, true);
  const activities = v.activities as MapPointRow["activities"] | undefined;
  if (activities && activities.length > row.activitySlots) invalid({ activities: "premiumRequired" });
  if (typeof v.parentId === "string") checkParent(req.state, user, v.parentId, row.id);
  const logoChanged = v.logo !== undefined && v.logo !== row.logo;
  // a new address must be confirmed again; the 60 s resend cooldown is kept (no reset by changing the email)
  const emailChanged = v.email !== undefined && (v.email ?? null) !== row.email;
  // turning a point into a person pin without an explicit visibility makes it team-only, like the backend
  if (v.kind === "private_person" && row.kind !== "private_person" && v.visibility === undefined) v.visibility = "team";
  Object.assign(row, v, { updatedAt: nowIso() });
  if (logoChanged) row.logoVersion = row.logo ? newLogoVersion() : null;
  if (emailChanged) row.emailVerifiedAt = null;
  return ok(toPointView(req.state, user, row));
}

function remove(req: DemoRequest) {
  const row = editablePoint(req);
  row.deletedAt = nowIso();
  // branches lose their head office (FK ON DELETE SET NULL), members go with the point (CASCADE)
  for (const p of req.state.mapPoints) if (p.parentId === row.id) p.parentId = null;
  req.state.companyMembers = req.state.companyMembers.filter((m) => m.pointId !== row.id);
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
  const user = requireUser(req);
  const row = visiblePoint(req, user);
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
    const user = requireUser(req);
    const row = visiblePoint(req, user);
    const has = row.favoritedBy.includes(user.id);
    if (on && !has) row.favoritedBy.push(user.id);
    if (!on && has) row.favoritedBy = row.favoritedBy.filter((id) => id !== user.id);
    return ok({ isFavorite: on });
  };
}

export const pointRoutes: RouteDef[] = [
  ...pointExtraRoutes,
  ["GET", "/map-points", list],
  ["POST", "/map-points/:id/favorite", setFavorite(true)],
  ["DELETE", "/map-points/:id/favorite", setFavorite(false)],
  ["GET", "/map-points/:id/logo", logo],
  ["GET", "/map-points/:id", getOne],
  ["POST", "/map-points", create],
  ["PATCH", "/map-points/:id", update],
  ["DELETE", "/map-points/:id", remove],
];
