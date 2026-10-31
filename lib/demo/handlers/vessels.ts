import { ROLE } from "@/lib/auth/roles";
import { markDirty } from "../db";
import { nowIso, uuid } from "../ids";
import {
  TEAM_ROLES,
  contains,
  created,
  invalid,
  noContent,
  notFound,
  ok,
  requireRoles,
  requireUser,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { driftVessels } from "../liveness";
import type { VesselRow } from "../types";
import { recordEvent } from "./events";
import { createdChanges, diffVessel, toFieldValue, toVesselView, validateVesselInput, type EditableField } from "./vesselRules";

/** /vessels — list, card, create, patch (checklist toggles), soft delete; viewers are read-only */

const SCOPES = ["active", "departed", "all"];

function findActive(req: DemoRequest, id: string): VesselRow {
  return req.state.vessels.find((v) => v.id === id && !v.deletedAt) ?? notFound("Vessel not found");
}

/** Not departed first (by ETA, then arrival), departed afterwards (latest first), then name */
function compare(a: VesselRow, b: VesselRow): number {
  const ad = a.departedAt ? 1 : 0;
  const bd = b.departedAt ? 1 : 0;
  if (ad !== bd) return ad - bd;
  if (!ad) {
    const ak = a.etaSulina ?? a.arrivedAt;
    const bk = b.etaSulina ?? b.arrivedAt;
    if (ak !== bk) return ak === null ? 1 : bk === null ? -1 : ak.localeCompare(bk);
  } else if (a.departedAt !== b.departedAt) {
    return (b.departedAt ?? "").localeCompare(a.departedAt ?? "");
  }
  return a.name.localeCompare(b.name);
}

function list(req: DemoRequest) {
  const user = requireUser(req);
  const scope = req.query.scope ?? "all";
  if (!SCOPES.includes(scope)) invalid({ scope: `scope must be one of the following values: ${SCOPES.join(", ")}` });
  const search = (req.query.search ?? "").trim();
  if (search.length > 120) invalid({ search: "search must be shorter than or equal to 120 characters" });
  if (driftVessels(req.state, Date.now())) markDirty();
  const rows = req.state.vessels
    .filter((v) => !v.deletedAt)
    .filter((v) => (scope === "active" ? !v.departedAt : scope === "departed" ? !!v.departedAt : true))
    .filter((v) => contains([v.name, v.imo], search))
    .sort(compare)
    .slice(0, 500);
  return ok(rows.map((v) => toVesselView(v, req.state, user.roleId)));
}

function getOne(req: DemoRequest) {
  const user = requireUser(req);
  return ok(toVesselView(findActive(req, uuidParam(req)), req.state, user.roleId));
}

function assertPosition(lat: unknown, lng: unknown) {
  if ((lat === null || lat === undefined) !== (lng === null || lng === undefined)) {
    invalid({ [lat === null || lat === undefined ? "lat" : "lng"]: "latLngRequiredTogether" });
  }
}

function assertImoFree(req: DemoRequest, imo: unknown, exceptId?: string) {
  if (typeof imo !== "string" || !imo) return;
  if (req.state.vessels.some((v) => !v.deletedAt && v.imo === imo && v.id !== exceptId)) invalid({ imo: "imoAlreadyExists" });
}

function create(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const { values, errors } = validateVesselInput(req.body, ["name", "type", "destination"]);
  if (Object.keys(errors).length) invalid(errors);
  const lat = (values.lat as number | null | undefined) ?? null;
  const lng = (values.lng as number | null | undefined) ?? null;
  assertPosition(lat, lng);
  assertImoFree(req, values.imo);
  const at = nowIso();
  const hasPosition = lat !== null && lng !== null;
  const v = (k: EditableField) => values[k] ?? null;
  const row: VesselRow = {
    id: uuid(),
    name: String(values.name),
    imo: v("imo") as string | null,
    mmsi: v("mmsi") as string | null,
    type: values.type as VesselRow["type"],
    destination: values.destination as VesselRow["destination"],
    condition: v("condition") as VesselRow["condition"],
    etaSulina: v("etaSulina") as string | null,
    arrivedAt: v("arrivedAt") as string | null,
    inPortAt: v("inPortAt") as string | null,
    departedAt: v("departedAt") as string | null,
    lat,
    lng,
    sog: null,
    cog: null,
    positionSource: hasPosition ? "manual" : null,
    positionAt: hasPosition ? at : null,
    masterName: v("masterName") as string | null,
    masterPhone: v("masterPhone") as string | null,
    masterEmail: v("masterEmail") as string | null,
    officeName: v("officeName") as string | null,
    officePhone: v("officePhone") as string | null,
    officeEmail: v("officeEmail") as string | null,
    portAgent: v("portAgent") as string | null,
    prearrivalsIn: (values.prearrivalsIn as VesselRow["prearrivalsIn"] | undefined) ?? "not_ok",
    prearrivalsOut: (values.prearrivalsOut as VesselRow["prearrivalsOut"] | undefined) ?? "not_ok",
    mswIn: values.mswIn === true,
    mswOut: values.mswOut === true,
    pdaSent: values.pdaSent === true,
    paid: values.paid === true,
    t1: v("t1") as VesselRow["t1"],
    pilotageArranged: values.pilotageArranged === true,
    pilot: v("pilot") as string | null,
    notes: v("notes") as string | null,
    createdById: user.id,
    updatedById: user.id,
    createdAt: at,
    updatedAt: at,
    deletedAt: null,
    anchor: null,
  };
  req.state.vessels.push(row);
  recordEvent(req.state, { vesselId: row.id, vesselName: row.name, userId: user.id, action: "created", changes: createdChanges(values) }, at);
  return created(toVesselView(row, req.state, user.roleId));
}

function update(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const id = uuidParam(req);
  const { values, errors } = validateVesselInput(req.body);
  if (Object.keys(errors).length) invalid(errors);
  const current = findActive(req, id);
  const changes = diffVessel(current, values);
  if (Object.keys(changes).length === 0) return ok(toVesselView(current, req.state, user.roleId));

  // every check before the stored row is touched: a 422 must leave the vessel as it was
  if (changes.imo) assertImoFree(req, values.imo, id);
  const at = nowIso();
  if (changes.lat || changes.lng) {
    const lat = "lat" in values ? (values.lat as number | null) : current.lat;
    const lng = "lng" in values ? (values.lng as number | null) : current.lng;
    assertPosition(lat, lng);
    const source = lat !== null && lng !== null ? "manual" : null;
    if (current.positionSource !== source) changes.positionSource = { from: toFieldValue(current.positionSource), to: source };
    Object.assign(current, { positionSource: source, positionAt: source ? at : null, sog: null, cog: null, anchor: null });
  }
  const record = current as unknown as Record<string, unknown>;
  for (const field of Object.keys(changes)) {
    if (field in values) record[field] = values[field as EditableField];
  }
  current.updatedById = user.id;
  current.updatedAt = at;
  recordEvent(req.state, { vesselId: id, vesselName: current.name, userId: user.id, action: "updated", changes }, at);
  return ok(toVesselView(current, req.state, user.roleId));
}

function remove(req: DemoRequest) {
  const user = requireRoles(req, [ROLE.admin]);
  const current = findActive(req, uuidParam(req));
  const at = nowIso();
  current.deletedAt = at;
  recordEvent(req.state, { vesselId: current.id, vesselName: current.name, userId: user.id, action: "deleted", changes: {} }, at);
  return noContent();
}

export const vesselRoutes: RouteDef[] = [
  ["GET", "/vessels", list],
  ["GET", "/vessels/:id", getOne],
  ["POST", "/vessels", create],
  ["PATCH", "/vessels/:id", update],
  ["DELETE", "/vessels/:id", remove],
];
