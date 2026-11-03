import { ROLE } from "@/lib/auth/roles";
import type { UserCard, NetworkRole } from "@/lib/network/api";
import type { UserRef } from "@/lib/vessels/types";
import type { DemoState, DemoUserRow } from "./types";

/** Backend presenters for users: UserRef (vessels/documents), UserCard (chat/social), User (auth/team) */

export const ROLE_NAME: Record<number, string> = {
  [ROLE.admin]: "Admin",
  [ROLE.viewer]: "User",
  [ROLE.staff]: "Staff",
};

const STATUS_NAME: Record<number, string> = { 1: "Active", 2: "Inactive" };

export function findUser(state: DemoState, id: number | null | undefined): DemoUserRow | undefined {
  return id == null ? undefined : state.users.find((u) => u.id === id);
}

export function toUserRef(state: DemoState, id: number | null | undefined): UserRef | null {
  const u = findUser(state, id);
  return u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email } : null;
}

export function cardRole(roleId: number): NetworkRole {
  if (roleId === ROLE.admin) return "admin";
  if (roleId === ROLE.staff) return "staff";
  return "viewer";
}

export function toUserCard(u: DemoUserRow): UserCard {
  return { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: cardRole(u.roleId) };
}

export function cardById(state: DemoState, id: number): UserCard {
  const u = findUser(state, id);
  return u ? toUserCard(u) : { id, firstName: null, lastName: null, email: null, role: "viewer" };
}

/** Admin/staff see everyone; viewers only the team (users-directory/user-visibility.ts) */
export function canSeeUser(viewer: DemoUserRow, target: DemoUserRow): boolean {
  const team = viewer.roleId === ROLE.admin || viewer.roleId === ROLE.staff;
  return team || target.roleId === ROLE.admin || target.roleId === ROLE.staff;
}

export function canDeleteContent(viewer: DemoUserRow, authorId: number): boolean {
  return authorId === viewer.id || viewer.roleId === ROLE.admin;
}

/**
 * Rank of a user, as the backend counts it on read:
 * 10 × points on the map + 5 × points with a logo + 3 × posts + 1 × comments + 5 × agency requests; deleted rows do not count.
 */
export function userRank(state: DemoState, userId: number | null | undefined): number {
  if (userId == null) return 0;
  const points = state.mapPoints.filter((p) => p.userId === userId && !p.deletedAt);
  const logos = points.filter((p) => !!p.logo).length;
  const posts = state.posts.filter((p) => p.authorId === userId && !p.deletedAt).length;
  // like the backend: a comment under a deleted post no longer counts
  const livePosts = new Set(state.posts.filter((p) => !p.deletedAt).map((p) => p.id));
  const comments = state.comments.filter((c) => c.authorId === userId && !c.deletedAt && livePosts.has(c.postId)).length;
  const requests = state.agencyRequests.filter((r) => r.createdById === userId).length;
  return 10 * points.length + 5 * logos + 3 * posts + comments + 5 * requests;
}

/** firstName, lastName, email, id — ascending, nulls last */
export function compareUsers(a: DemoUserRow, b: DemoUserRow): number {
  return (
    a.firstName.localeCompare(b.firstName) ||
    a.lastName.localeCompare(b.lastName) ||
    a.email.localeCompare(b.email) ||
    a.id - b.id
  );
}

/** User domain object as serialized by /auth/me and /users */
export function toUserDto(u: DemoUserRow) {
  return {
    id: u.id,
    email: u.email,
    provider: "email",
    socialId: null,
    firstName: u.firstName,
    lastName: u.lastName,
    photo: null,
    role: { id: u.roleId, name: ROLE_NAME[u.roleId] ?? null },
    status: { id: u.statusId, name: STATUS_NAME[u.statusId] ?? null },
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    deletedAt: u.deletedAt,
  };
}
