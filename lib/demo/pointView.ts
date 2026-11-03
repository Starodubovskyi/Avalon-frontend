import { invalid, notFound, uuidParam, type DemoRequest } from "./http";
import { cardRole, findUser, isTeamUser, toUserRef, userRank } from "./presenters";
import type { CompanyMemberRow, DemoState, DemoUserRow, MapPointRow } from "./types";

/** Who sees and edits a map point, and the MapPointView the API returns (stage 2 rules) */

export function canSeePoint(viewer: DemoUserRow, p: MapPointRow): boolean {
  return isTeamUser(viewer) || p.visibility === "public" || p.userId === viewer.id;
}

export function canEditPoint(viewer: DemoUserRow, p: MapPointRow): boolean {
  return isTeamUser(viewer) || p.userId === viewer.id;
}

export function activeMembers(state: DemoState, pointId: string): CompanyMemberRow[] {
  return state.companyMembers.filter((m) => m.pointId === pointId && m.status === "active");
}

/** 404 for a missing, deleted or invisible point (the API never confirms that a hidden point exists) */
export function visiblePoint(req: DemoRequest, viewer: DemoUserRow, param = "id"): MapPointRow {
  const id = uuidParam(req, param);
  const row = req.state.mapPoints.find((p) => p.id === id && !p.deletedAt);
  return row && canSeePoint(viewer, row) ? row : notFound("Map point not found");
}

/** createdBy as the viewer gets it: email only for the team, a team author or the author themselves (backend canSeeEmail) */
function authorOf(state: DemoState, viewer: DemoUserRow, userId: number) {
  const ref = toUserRef(state, userId);
  const author = findUser(state, userId);
  if (!ref || !author) return null;
  const canSeeEmail = isTeamUser(viewer) || isTeamUser(author) || viewer.id === author.id;
  return { ...ref, email: canSeeEmail ? ref.email : null, role: cardRole(author.roleId) };
}

/** The list carries only hasLogo/logoVersion; the image is served by GET /map-points/:id/logo */
export function toPointView(state: DemoState, viewer: DemoUserRow, p: MapPointRow) {
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
    // notes are internal: only those who may edit the point get them
    notes: canEditPoint(viewer, p) ? p.notes : null,
    photoId: null,
    isFavorite: p.favoritedBy.includes(viewer.id),
    rank: userRank(state, p.userId),
    createdBy: authorOf(state, viewer, p.userId),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    visibility: p.visibility,
    description: p.description,
    website: p.website,
    parentId: p.parentId,
    activitySlots: p.activitySlots,
    emailVerified: !!p.emailVerifiedAt,
    canEdit: canEditPoint(viewer, p),
    memberCount: 1 + activeMembers(state, p.id).filter((m) => m.userId !== p.userId).length,
  };
}

/**
 * parentId of a branch: a head office the caller may edit, other than the point itself and not below it
 * (422 parentId notFound / invalid, like the backend)
 */
export function checkParent(state: DemoState, viewer: DemoUserRow, parentId: string, selfId: string | null): void {
  if (parentId === selfId) invalid({ parentId: "invalid" });
  const byId = (id: string | null) => (id ? state.mapPoints.find((p) => p.id === id && !p.deletedAt) : undefined);
  const parent = byId(parentId);
  if (!parent || parent.kind !== "head_office" || !canEditPoint(viewer, parent)) invalid({ parentId: "notFound" });
  // no cycles: walking up from the new parent must never reach the point itself
  const seen = new Set<string>();
  for (let cur: MapPointRow | undefined = parent; cur?.parentId && !seen.has(cur.id); cur = byId(cur.parentId)) {
    seen.add(cur.id);
    if (cur.parentId === selfId) invalid({ parentId: "invalid" });
  }
}
