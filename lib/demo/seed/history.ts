import { uuid } from "../ids";
import type { FieldChanges, FieldValue, VesselEventRow, VesselRow } from "../types";
import { EDITORS } from "./users";

/**
 * Audit trail consistent with each vessel's current state: a "created" event, then one
 * "updated" event per checklist item / milestone that is done, signed by rotating editors.
 */

const MIN = 60_000;
const H = 60 * MIN;

type Step = { at: number; changes: FieldChanges };

function change(field: string, from: FieldValue, to: FieldValue): FieldChanges {
  return { [field]: { from, to } };
}

function ms(iso: string | null): number | null {
  return iso ? new Date(iso).getTime() : null;
}

function stepsFor(v: VesselRow, created: number): Step[] {
  const eta = ms(v.etaSulina) ?? created + 30 * H;
  const arrived = ms(v.arrivedAt);
  const inPort = ms(v.inPortAt);
  const departed = ms(v.departedAt);
  const steps: Step[] = [];
  const add = (at: number, changes: FieldChanges) => steps.push({ at, changes });

  if (v.mswIn) add(created + 5 * H, change("mswIn", false, true));
  if (v.pdaSent) add(created + 9 * H, change("pdaSent", false, true));
  if (v.prearrivalsIn === "ok") add(eta - 20 * H, change("prearrivalsIn", "not_ok", "ok"));
  if (v.t1) add(eta - 8 * H, change("t1", null, v.t1));
  if (arrived !== null) add(arrived + 12 * MIN, change("arrivedAt", null, v.arrivedAt));
  if (v.pilotageArranged) add((arrived ?? eta) + 2 * H, change("pilotageArranged", false, true));
  if (v.pilot) add((arrived ?? eta) + 2 * H + 4 * MIN, change("pilot", null, v.pilot));
  if (inPort !== null) add(inPort + 18 * MIN, change("inPortAt", null, v.inPortAt));
  if (v.paid) add((inPort ?? eta) + 26 * H, change("paid", false, true));
  if (v.prearrivalsOut === "ok") add((departed ?? (inPort ?? eta) + 40 * H) - 9 * H, change("prearrivalsOut", "not_ok", "ok"));
  if (departed !== null) add(departed + 25 * MIN, change("departedAt", null, v.departedAt));
  if (v.mswOut) add((departed ?? eta) + 3 * H, change("mswOut", false, true));
  if (v.notes) add(created + 50 * MIN, change("notes", null, v.notes));
  return steps;
}

function createdChanges(v: VesselRow): FieldChanges {
  const fields: (keyof VesselRow)[] = [
    "name", "imo", "mmsi", "type", "destination", "condition", "masterName", "masterPhone",
    "masterEmail", "officeName", "officePhone", "officeEmail", "portAgent", "etaSulina",
  ];
  const out: FieldChanges = {};
  for (const f of fields) {
    const to = v[f];
    if (typeof to === "string" || typeof to === "number" || typeof to === "boolean") out[f] = { from: null, to };
  }
  return out;
}

export function seedHistory(vessels: VesselRow[], now: number): VesselEventRow[] {
  const events: VesselEventRow[] = [];
  let editor = 0;
  const nextEditor = () => EDITORS[editor++ % EDITORS.length];

  for (const v of vessels) {
    const created = new Date(v.createdAt).getTime();
    const author = nextEditor();
    events.push({
      id: uuid(),
      vesselId: v.id,
      vesselName: v.name,
      userId: author,
      action: "created",
      changes: createdChanges(v),
      createdAt: v.createdAt,
    });
    v.createdById = author;
    v.updatedById = author;

    const latest = now - 4 * MIN;
    const steps = stepsFor(v, created)
      .map((s) => ({ ...s, at: Math.min(Math.max(s.at, created + MIN), latest) }))
      .sort((a, b) => a.at - b.at);
    let last = created;
    for (const s of steps) {
      const at = Math.max(s.at, last + 1000);
      last = at;
      const by = nextEditor();
      events.push({
        id: uuid(),
        vesselId: v.id,
        vesselName: v.name,
        userId: by,
        action: "updated",
        changes: s.changes,
        createdAt: new Date(at).toISOString(),
      });
      v.updatedById = by;
      v.updatedAt = new Date(at).toISOString();
    }
  }
  return events;
}
