import type { AuthUser } from "@/lib/domain/map-point";

/** Mirrors backend RoleEnum */
export const ROLE = {
  admin: 1,
  viewer: 2,
  staff: 3,
} as const;

export type RoleId = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_LABEL: Record<number, string> = {
  [ROLE.admin]: "Admin",
  [ROLE.staff]: "Staff",
  [ROLE.viewer]: "Viewer",
};

export function roleId(user: AuthUser | null | undefined): number | null {
  return user?.role?.id ?? null;
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return roleId(user) === ROLE.admin;
}

/** Staff and admins edit vessels, documents and see the audit log */
export function canEdit(user: AuthUser | null | undefined): boolean {
  const id = roleId(user);
  return id === ROLE.admin || id === ROLE.staff;
}

export function displayName(user: AuthUser | null | undefined): string {
  if (!user) return "";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.email || "User";
}

export function initials(user: AuthUser | null | undefined): string {
  const name = displayName(user);
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}
