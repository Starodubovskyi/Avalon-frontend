import { ROLE } from "@/lib/auth/roles";
import { demoToken, setDemoFlag } from "../mode";
import {
  created,
  intParam,
  invalid,
  isRecord,
  noContent,
  notFound,
  ok,
  requireRoles,
  requireUser,
  unauthorized,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserDto } from "../presenters";
import type { DemoUserRow, RoleIdValue } from "../types";

/** /auth/* (session, profile, fake password change) and /users (admin team management) */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_IDS: number[] = [ROLE.admin, ROLE.viewer, ROLE.staff];

function str(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  return typeof v === "string" ? v.trim() : undefined;
}

function byEmail(req: DemoRequest, email: string): DemoUserRow | undefined {
  const e = email.toLowerCase();
  return req.state.users.find((u) => !u.deletedAt && u.email.toLowerCase() === e);
}

/** Any password works in the demo; the email must belong to a demo account */
function login(req: DemoRequest) {
  const email = str(req.body, "email") ?? "";
  const password = str(req.body, "password") ?? "";
  if (!EMAIL_RE.test(email)) invalid({ email: "email must be an email" });
  if (!password) invalid({ password: "password should not be empty" });
  const user = byEmail(req, email) ?? invalid({ email: "notFound" });
  setDemoFlag(true);
  return ok({
    token: demoToken(user.id),
    refreshToken: `demo-refresh.${user.id}`,
    tokenExpires: Date.now() + 12 * 3_600_000,
    user: toUserDto(user),
  });
}

function validateNewUser(req: DemoRequest): { email: string; firstName: string; lastName: string } {
  const email = str(req.body, "email") ?? "";
  const firstName = str(req.body, "firstName") ?? "";
  const lastName = str(req.body, "lastName") ?? "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const errors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) errors.email = "email must be an email";
  if (password.length < 6) errors.password = "password must be longer than or equal to 6 characters";
  if (!firstName) errors.firstName = "firstName should not be empty";
  if (!lastName) errors.lastName = "lastName should not be empty";
  if (Object.keys(errors).length) invalid(errors);
  if (byEmail(req, email)) invalid({ email: "emailAlreadyExists" });
  return { email: email.toLowerCase(), firstName, lastName };
}

function addUser(req: DemoRequest, roleId: RoleIdValue, statusId: number): DemoUserRow {
  const fields = validateNewUser(req);
  const at = new Date().toISOString();
  const row: DemoUserRow = {
    id: Math.max(...req.state.users.map((u) => u.id)) + 1,
    ...fields,
    roleId,
    statusId,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
  };
  req.state.users.push(row);
  return row;
}

function register(req: DemoRequest) {
  addUser(req, ROLE.viewer, 1);
  return noContent();
}

function me(req: DemoRequest) {
  return ok(toUserDto(requireUser(req)));
}

function updateMe(req: DemoRequest) {
  const user = requireUser(req);
  const firstName = str(req.body, "firstName");
  const lastName = str(req.body, "lastName");
  if (typeof req.body.password === "string" && req.body.password) {
    if (req.body.password.length < 6) invalid({ password: "password must be longer than or equal to 6 characters" });
    if (!str(req.body, "oldPassword")) invalid({ oldPassword: "missingOldPassword" });
  }
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  user.updatedAt = new Date().toISOString();
  return ok(toUserDto(user));
}

/** Signing out of the demo also leaves demo mode (the login page then talks to the real server) */
function logout(req: DemoRequest) {
  requireUser(req);
  setDemoFlag(false);
  return noContent();
}

function refresh(): never {
  return unauthorized();
}

function idRef(value: unknown, allowed: number[]): number | undefined {
  if (!isRecord(value)) return undefined;
  const id = Number(value.id);
  return allowed.includes(id) ? id : undefined;
}

function listUsers(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const rows = req.state.users.filter((u) => !u.deletedAt).sort((a, b) => a.id - b.id);
  const slice = rows.slice((page - 1) * limit, page * limit);
  return ok({ data: slice.map(toUserDto), hasNextPage: rows.length > page * limit });
}

function createUser(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  const roleId = (idRef(req.body.role, ROLE_IDS) ?? ROLE.viewer) as RoleIdValue;
  const statusId = idRef(req.body.status, [1, 2]) ?? 1;
  return created(toUserDto(addUser(req, roleId, statusId)));
}

function findUserOr404(req: DemoRequest): DemoUserRow {
  const id = intParam(req);
  return req.state.users.find((u) => u.id === id && !u.deletedAt) ?? notFound("User not found");
}

function patchUser(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  const user = findUserOr404(req);
  if (req.body.role !== undefined) {
    const roleId = idRef(req.body.role, ROLE_IDS) ?? invalid({ role: "roleNotExists" });
    user.roleId = roleId as RoleIdValue;
  }
  const status = idRef(req.body.status, [1, 2]);
  if (status) user.statusId = status;
  const firstName = str(req.body, "firstName");
  const lastName = str(req.body, "lastName");
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  user.updatedAt = new Date().toISOString();
  return ok(toUserDto(user));
}

function getUser(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  return ok(toUserDto(findUserOr404(req)));
}

function deleteUser(req: DemoRequest) {
  requireRoles(req, [ROLE.admin]);
  findUserOr404(req).deletedAt = new Date().toISOString();
  return noContent();
}

export const userRoutes: RouteDef[] = [
  ["POST", "/auth/email/login", login],
  ["POST", "/auth/email/register", register],
  ["GET", "/auth/me", me],
  ["PATCH", "/auth/me", updateMe],
  ["POST", "/auth/logout", logout],
  ["POST", "/auth/refresh", refresh],
  ["GET", "/users", listUsers],
  ["POST", "/users", createUser],
  ["GET", "/users/:id", getUser],
  ["PATCH", "/users/:id", patchUser],
  ["DELETE", "/users/:id", deleteUser],
];
