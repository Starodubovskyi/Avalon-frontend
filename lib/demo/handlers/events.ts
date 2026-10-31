import type { VesselEventView } from "@/lib/vessels/types";
import { uuid } from "../ids";
import {
  TEAM_ROLES,
  byNewest,
  intQuery,
  invalid,
  isUuid,
  isoQuery,
  notFound,
  ok,
  requireRoles,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserRef } from "../presenters";
import type { DemoState, FieldChanges, VesselEventRow } from "../types";

/** Audit log: GET /vessels/:id/events and GET /vessel-events (keyset on createdAt, id) */

const MAX_LIMIT = 200;

export function recordEvent(
  state: DemoState,
  e: { vesselId: string; vesselName: string; userId: number; action: VesselEventRow["action"]; changes: FieldChanges },
  at: string,
): void {
  state.vesselEvents.push({ id: uuid(), ...e, createdAt: at });
}

function toView(state: DemoState, e: VesselEventRow): VesselEventView {
  return {
    id: e.id,
    vesselId: e.vesselId,
    vesselName: e.vesselName,
    action: e.action,
    changes: e.changes,
    user: toUserRef(state, e.userId),
    createdAt: e.createdAt,
  };
}

function byVessel(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const id = uuidParam(req);
  const events = req.state.vesselEvents.filter((e) => e.vesselId === id).sort(byNewest).slice(0, MAX_LIMIT);
  if (events.length === 0 && !req.state.vessels.some((v) => v.id === id)) notFound("Vessel not found");
  return ok(events.map((e) => toView(req.state, e)));
}

function recent(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const limit = intQuery(req, "limit", 1, MAX_LIMIT) ?? 100;
  const beforeId = req.query.beforeId;
  if (beforeId !== undefined && !isUuid(beforeId)) invalid({ beforeId: "beforeId must be a UUID" });
  const before = isoQuery(req, "before");
  if (beforeId && !before) invalid({ before: "before must be a valid ISO 8601 date string" });
  const cursorMs = before ? new Date(before).getTime() : null;
  const events = req.state.vesselEvents
    .filter((e) => {
      if (cursorMs === null) return true;
      const t = new Date(e.createdAt).getTime();
      return beforeId ? t < cursorMs || (t === cursorMs && e.id < beforeId) : t < cursorMs;
    })
    .sort(byNewest)
    .slice(0, limit);
  return ok(events.map((e) => toView(req.state, e)));
}

export const eventRoutes: RouteDef[] = [
  ["GET", "/vessels/:id/events", byVessel],
  ["GET", "/vessel-events", recent],
];
