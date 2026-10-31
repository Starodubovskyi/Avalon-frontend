import { ROLE } from "@/lib/auth/roles";
import { getState, markDirty, persistIfDirty } from "./db";
import type { DemoRole } from "./mode";
import { DEMO_ACCOUNTS } from "./seed/users";
import type { RoleIdValue } from "./types";

const ROLE_ID: Record<DemoRole, RoleIdValue> = { admin: ROLE.admin, staff: ROLE.staff, viewer: ROLE.viewer };

/** Makes sure the chosen demo account exists, is active and has the chosen role; returns its id */
export function prepareDemoAccount(role: DemoRole): number {
  const state = getState();
  const id = DEMO_ACCOUNTS[role];
  const user = state.users.find((u) => u.id === id);
  if (user && (user.deletedAt || user.roleId !== ROLE_ID[role] || user.statusId !== 1)) {
    user.deletedAt = null;
    user.roleId = ROLE_ID[role];
    user.statusId = 1;
    user.updatedAt = new Date().toISOString();
    markDirty();
  }
  persistIfDirty();
  return id;
}
