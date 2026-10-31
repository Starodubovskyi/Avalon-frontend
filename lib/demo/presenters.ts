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
