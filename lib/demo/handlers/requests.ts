import { REQUEST_LIMITS, REQUEST_STATUSES, type AgencyRequest, type RequestStatus } from "@/lib/requests/types";
import { DESTINATIONS, VESSEL_TYPES } from "@/lib/vessels/types";
import { nowIso, uuid } from "../ids";
import {
  TEAM_ROLES,
  byNewest,
  created,
  invalid,
  isIsoDate,
  isUuid,
  notFound,
  ok,
  requireRoles,
  requireUser,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserRef } from "../presenters";
import type { AgencyRequestRow, DemoState, DemoUserRow } from "../types";

/** /agency-requests — client nominations: anyone creates, staff/admin process, viewers see their own */

/** Backend AGENCY_REQUEST_LIST_LIMIT */
const LIST_LIMIT = 200;
const STATUSES: readonly string[] = REQUEST_STATUSES;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toView(state: DemoState, r: AgencyRequestRow): AgencyRequest {
  const { createdById, ...rest } = r;
  return { ...rest, createdBy: toUserRef(state, createdById) };
}

function isTeam(user: DemoUserRow): boolean {
  return TEAM_ROLES.includes(user.roleId);
}

type TextField = "company" | "contactName" | "email" | "phone" | "vesselName" | "cargo" | "notes";
const TEXT: [field: TextField, required: boolean][] = [
  ["company", true],
  ["contactName", true],
  ["email", true],
  ["phone", false],
  ["vesselName", true],
  ["cargo", false],
  ["notes", false],
];

function create(req: DemoRequest) {
  const user = requireUser(req);
  const b = req.body;
  const errors: Record<string, string> = {};
  const text: Record<string, string | null> = {};
  for (const [field, required] of TEXT) {
    const max = REQUEST_LIMITS[field];
    const raw = b[field];
    const value = typeof raw === "string" ? raw.trim() : raw == null ? "" : null;
    if (value === null) errors[field] = required ? "empty" : "invalid";
    else if (!value && required) errors[field] = field === "email" ? "invalidEmail" : "empty";
    else if (value.length > max) errors[field] = "tooLong";
    else text[field] = value || null;
  }
  if (text.email && !EMAIL_RE.test(text.email)) errors.email = "invalidEmail";
  const imo = typeof b.imo === "string" ? b.imo.trim() : b.imo == null ? "" : null;
  if (imo === null || (imo && !/^\d{7}$/.test(imo))) errors.imo = "imoInvalid";
  if (!(VESSEL_TYPES as readonly unknown[]).includes(b.vesselType)) errors.vesselType = "invalid";
  if (!(DESTINATIONS as readonly unknown[]).includes(b.destination)) errors.destination = "invalid";
  if (b.eta != null && b.eta !== "" && !isIsoDate(b.eta)) errors.eta = "invalidDateTime";
  if (Object.keys(errors).length) invalid(errors);

  const at = nowIso();
  const row: AgencyRequestRow = {
    id: uuid(),
    createdById: user.id,
    company: text.company as string,
    contactName: text.contactName as string,
    email: text.email as string,
    phone: text.phone ?? null,
    vesselName: (text.vesselName as string).toUpperCase(),
    imo: imo || null,
    vesselType: b.vesselType as AgencyRequestRow["vesselType"],
    destination: b.destination as AgencyRequestRow["destination"],
    eta: typeof b.eta === "string" && b.eta ? new Date(b.eta).toISOString() : null,
    cargo: text.cargo ?? null,
    notes: text.notes ?? null,
    status: "new",
    staffNote: null,
    vesselId: null,
    createdAt: at,
    updatedAt: at,
  };
  req.state.agencyRequests.push(row);
  return created(toView(req.state, row));
}

function list(req: DemoRequest) {
  const user = requireUser(req);
  const status = req.query.status?.trim() || undefined;
  if (status && !STATUSES.includes(status)) invalid({ status: "invalid" });
  const rows = req.state.agencyRequests
    .filter((r) => isTeam(user) || r.createdById === user.id)
    .filter((r) => !status || r.status === status)
    .sort(byNewest)
    .slice(0, LIST_LIMIT);
  return ok(rows.map((r) => toView(req.state, r)));
}

function findVisible(req: DemoRequest, user: DemoUserRow): AgencyRequestRow {
  const id = uuidParam(req);
  const row = req.state.agencyRequests.find((r) => r.id === id);
  if (!row || (!isTeam(user) && row.createdById !== user.id)) notFound("Agency request not found");
  return row;
}

function getOne(req: DemoRequest) {
  const user = requireUser(req);
  return ok(toView(req.state, findVisible(req, user)));
}

function update(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const b = req.body;
  const errors: Record<string, string> = {};
  if (b.status !== undefined && !(typeof b.status === "string" && STATUSES.includes(b.status))) errors.status = "invalid";
  if (b.staffNote !== undefined && b.staffNote !== null) {
    if (typeof b.staffNote !== "string") errors.staffNote = "invalid";
    else if (b.staffNote.trim().length > REQUEST_LIMITS.staffNote) errors.staffNote = "tooLong";
  }
  const vesselId = typeof b.vesselId === "string" ? b.vesselId.trim() || null : b.vesselId;
  if (vesselId !== undefined && vesselId !== null && !isUuid(vesselId)) errors.vesselId = "invalid";
  if (Object.keys(errors).length) invalid(errors);
  const row = findVisible(req, user);
  if (typeof vesselId === "string" && !req.state.vessels.some((v) => v.id === vesselId && !v.deletedAt)) {
    invalid({ vesselId: "notFound" });
  }
  if (b.status !== undefined) row.status = b.status as RequestStatus;
  if (b.staffNote !== undefined) row.staffNote = typeof b.staffNote === "string" && b.staffNote.trim() ? b.staffNote.trim() : null;
  if (vesselId !== undefined) row.vesselId = typeof vesselId === "string" ? vesselId : null;
  row.updatedAt = nowIso();
  return ok(toView(req.state, row));
}

export const requestRoutes: RouteDef[] = [
  ["POST", "/agency-requests", create],
  ["GET", "/agency-requests", list],
  ["GET", "/agency-requests/:id", getOne],
  ["PATCH", "/agency-requests/:id", update],
];
