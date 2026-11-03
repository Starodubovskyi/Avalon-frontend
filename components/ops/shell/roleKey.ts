import type { AuthUser } from "@/lib/domain/map-point";
import { ROLE, roleId } from "@/lib/auth/roles";

export type RoleKey = "admin" | "staff" | "viewer" | "user";

/** Role as a key of `common.role.*` */
export function roleKeyOf(user: AuthUser | null | undefined): RoleKey {
  const id = roleId(user);
  if (id === ROLE.admin) return "admin";
  if (id === ROLE.staff) return "staff";
  if (id === ROLE.viewer) return "viewer";
  return "user";
}
