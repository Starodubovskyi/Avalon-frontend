import { ROLE } from "@/lib/auth/roles";
import type { DemoState, DemoUserRow } from "./types";

/** Request/response plumbing shared by the demo handlers (mirrors the Nest backend's error shapes) */

export interface DemoRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  form: FormData | null;
  user: DemoUserRow | null;
  state: DemoState;
}

export interface DemoResult {
  status: number;
  data?: unknown;
  /** Binary body for blob downloads */
  blob?: Blob;
  headers?: Record<string, string>;
}

export type DemoHandler = (req: DemoRequest) => DemoResult;
export type RouteDef = readonly [method: string, pattern: string, handler: DemoHandler];

export class DemoHttpError extends Error {
  constructor(readonly result: DemoResult) {
    super(`demo ${result.status}`);
  }
}

export const ok = (data: unknown): DemoResult => ({ status: 200, data });
export const created = (data: unknown): DemoResult => ({ status: 201, data });
export const noContent = (): DemoResult => ({ status: 204 });

export function fail(status: number, data: unknown): never {
  throw new DemoHttpError({ status, data });
}

export function notFound(message = "Not Found"): never {
  return fail(404, { message, error: "Not Found", statusCode: 404 });
}

/** RolesGuard rejection ("Forbidden resource"); plain ForbiddenException passes "Forbidden" */
export function forbidden(message = "Forbidden resource"): never {
  return fail(403, { message, error: "Forbidden", statusCode: 403 });
}

export function unauthorized(): never {
  return fail(401, { message: "Unauthorized", statusCode: 401 });
}

/** Boilerplate 422: { status: 422, errors: { field: code } } */
export function invalid(errors: Record<string, string>): never {
  return fail(422, { status: 422, errors });
}

export function badRequest(message: string): never {
  return fail(400, { message, error: "Bad Request", statusCode: 400 });
}

export const TEAM_ROLES: readonly number[] = [ROLE.admin, ROLE.staff];

export function requireUser(req: DemoRequest): DemoUserRow {
  return req.user ?? unauthorized();
}

export function requireRoles(req: DemoRequest, roles: readonly number[]): DemoUserRow {
  const user = requireUser(req);
  if (!roles.includes(user.roleId)) forbidden();
  return user;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** ParseUUIDPipe */
export function uuidParam(req: DemoRequest, name = "id"): string {
  const value = req.params[name];
  return isUuid(value) ? value : badRequest("Validation failed (uuid is expected)");
}

/** ParseIntPipe */
export function intParam(req: DemoRequest, name = "id"): number {
  const value = Number(req.params[name]);
  return Number.isInteger(value) ? value : badRequest("Validation failed (numeric string is expected)");
}

/** class-validator style integer query param with bounds; undefined when absent */
export function intQuery(req: DemoRequest, name: string, min: number, max: number): number | undefined {
  const raw = req.query[name];
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n)) return invalid({ [name]: `${name} must be an integer number` });
  if (n < min) return invalid({ [name]: `${name} must not be less than ${min}` });
  if (n > max) return invalid({ [name]: `${name} must not be greater than ${max}` });
  return n;
}

export function isoQuery(req: DemoRequest, name: string): string | undefined {
  const raw = req.query[name];
  if (raw === undefined || raw === "") return undefined;
  return isIsoDate(raw) ? raw : invalid({ [name]: `${name} must be a valid ISO 8601 date string` });
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Trimmed text body field validated like IsBodyText (empty / tooLong codes) */
export function bodyText(req: DemoRequest, field: string, max: number): string {
  const raw = req.body[field];
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return invalid({ [field]: "empty" });
  if (text.length > max) return invalid({ [field]: "tooLong" });
  return text;
}

export function contains(haystack: (string | null | undefined)[], needle: string): boolean {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((h) => !!h && h.toLowerCase().includes(q));
}

export function byNewest<T extends { createdAt: string; id: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

export function active<T extends { deletedAt: string | null }>(rows: T[]): T[] {
  return rows.filter((r) => !r.deletedAt);
}
