import type { CompanyMember, CompanyProfile } from "@/lib/companies/types";
import { POSITION_MAX } from "@/lib/companies/types";
import { nowIso } from "../ids";
import { forbidden, intParam, invalid, noContent, notFound, ok, requireUser, uuidParam, type DemoRequest, type RouteDef } from "../http";
import { cardFor, findUser, userRank } from "../presenters";
import { canEditPoint, canSeePoint, toPointView, visiblePoint } from "../pointView";
import type { CompanyMemberRow, DemoState, DemoUserRow, MapPointRow } from "../types";

/** /companies — company profile of a map point: team, branches, "I work here" (stage 2) */

type View = ReturnType<typeof toPointView>;

function member(state: DemoState, viewer: DemoUserRow, user: DemoUserRow, row: Omit<CompanyMemberRow, "pointId" | "userId">, role: "owner" | "member") {
  return {
    user: cardFor(viewer, user),
    position: row.position,
    role,
    status: row.status,
    headline: user.headline,
    rank: userRank(state, user.id),
    joinedAt: row.createdAt,
  } satisfies CompanyMember;
}

function membersOf(state: DemoState, viewer: DemoUserRow, p: MapPointRow, manage: boolean): CompanyMember[] {
  const out: CompanyMember[] = [];
  const owner = findUser(state, p.userId);
  if (owner && !owner.deletedAt) out.push(member(state, viewer, owner, { position: null, status: "active", createdAt: p.createdAt }, "owner"));
  const rows = state.companyMembers
    .filter((m) => m.pointId === p.id && m.userId !== p.userId && (m.status === "active" || manage))
    .sort((a, b) => (a.status === b.status ? a.createdAt.localeCompare(b.createdAt) : a.status === "active" ? -1 : 1));
  for (const m of rows) {
    const u = findUser(state, m.userId);
    if (u && !u.deletedAt) out.push(member(state, viewer, u, m, "member"));
  }
  return out;
}

function profileOf(state: DemoState, viewer: DemoUserRow, p: MapPointRow) {
  const manage = canEditPoint(viewer, p);
  const parentRow = p.parentId ? state.mapPoints.find((x) => x.id === p.parentId && !x.deletedAt) : undefined;
  const branches = state.mapPoints
    .filter((x) => x.parentId === p.id && !x.deletedAt && canSeePoint(viewer, x))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const mine = state.companyMembers.find((m) => m.pointId === p.id && m.userId === viewer.id);
  const profile: Omit<CompanyProfile, "point" | "parent" | "branches"> & { point: View; parent: View | null; branches: View[] } = {
    point: toPointView(state, viewer, p),
    parent: parentRow && canSeePoint(viewer, parentRow) ? toPointView(state, viewer, parentRow) : null,
    branches: branches.map((b) => toPointView(state, viewer, b)),
    members: membersOf(state, viewer, p, manage),
    myMembership: p.userId === viewer.id ? "owner" : mine ? mine.status : null,
    canManage: manage,
  };
  return profile;
}

function getProfile(req: DemoRequest) {
  const user = requireUser(req);
  return ok(profileOf(req.state, user, visiblePoint(req, user, "pointId")));
}

/** My points and the companies where I am an active member */
function mine(req: DemoRequest) {
  const user = requireUser(req);
  const memberOf = new Set(req.state.companyMembers.filter((m) => m.userId === user.id && m.status === "active").map((m) => m.pointId));
  const rows = req.state.mapPoints
    .filter((p) => !p.deletedAt && canSeePoint(user, p) && (p.userId === user.id || memberOf.has(p.id)))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  return ok(rows.map((p) => toPointView(req.state, user, p)));
}

function parsePosition(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return invalid({ position: "invalid" });
  const text = value.trim();
  if (text.length > POSITION_MAX) invalid({ position: "tooLong" });
  return text || null;
}

function join(req: DemoRequest) {
  const user = requireUser(req);
  const p = visiblePoint(req, user, "pointId");
  if (p.userId === user.id) invalid({ membership: "owner" });
  if (req.state.companyMembers.some((m) => m.pointId === p.id && m.userId === user.id)) invalid({ membership: "exists" });
  const position = parsePosition(req.body.position) ?? null;
  req.state.companyMembers.push({ pointId: p.id, userId: user.id, position, status: "pending", createdAt: nowIso() });
  return ok(profileOf(req.state, user, p));
}

/** A member may always leave, even when the point became invisible to them (team-only) */
function leave(req: DemoRequest) {
  const user = requireUser(req);
  const pointId = uuidParam(req, "pointId");
  const before = req.state.companyMembers.length;
  req.state.companyMembers = req.state.companyMembers.filter((m) => !(m.pointId === pointId && m.userId === user.id));
  if (req.state.companyMembers.length === before) notFound("Membership not found");
  return noContent();
}

function managedMember(req: DemoRequest): { viewer: DemoUserRow; point: MapPointRow; row: CompanyMemberRow } {
  const viewer = requireUser(req);
  const point = visiblePoint(req, viewer, "pointId");
  if (!canEditPoint(viewer, point)) forbidden("Forbidden");
  const userId = intParam(req, "userId");
  const row = req.state.companyMembers.find((m) => m.pointId === point.id && m.userId === userId) ?? notFound("Member not found");
  return { viewer, point, row };
}

function updateMember(req: DemoRequest) {
  const { viewer, row } = managedMember(req);
  const status = req.body.status;
  if (status !== undefined && status !== "active") invalid({ status: "invalid" });
  const position = parsePosition(req.body.position);
  if (status === "active") row.status = "active";
  if (position !== undefined) row.position = position;
  const u = findUser(req.state, row.userId) ?? notFound("Member not found");
  return ok(member(req.state, viewer, u, row, "member"));
}

function removeMember(req: DemoRequest) {
  const { point, row } = managedMember(req);
  req.state.companyMembers = req.state.companyMembers.filter((m) => !(m.pointId === point.id && m.userId === row.userId));
  return noContent();
}

export const companyRoutes: RouteDef[] = [
  ["GET", "/companies/mine", mine],
  ["GET", "/companies/:pointId", getProfile],
  ["POST", "/companies/:pointId/join", join],
  ["DELETE", "/companies/:pointId/members/me", leave],
  ["PATCH", "/companies/:pointId/members/:userId", updateMember],
  ["DELETE", "/companies/:pointId/members/:userId", removeMember],
];
