import { CHECKLIST, isItemDone, type ChecklistItemDef } from "./status";
import { fmtRelative } from "./format";
import type { ChecklistKey, VesselInput, VesselView } from "./types";

export type TaskUrgency = "overdue" | "now" | "upcoming";

export const URGENCY_ORDER: TaskUrgency[] = ["overdue", "now", "upcoming"];

export const URGENCY_LABEL: Record<TaskUrgency, string> = {
  overdue: "Overdue",
  now: "Due now",
  upcoming: "Upcoming",
};

/** Why a task has its urgency, as data — the UI renders it in the interface language (see TasksView) */
export type TaskReason =
  | { code: "sailed" | "berthedOpen" | "berthed" | "arrivedSulina" | "eta"; at: string | null }
  | { code: "atRoads" | "etaPassed" | "noEta" };

/** One open checklist item of one vessel — what is still red on the board */
export interface VesselTask {
  id: string;
  vessel: VesselView;
  item: ChecklistItemDef;
  urgency: TaskUrgency;
  /** English sentence, kept for existing callers */
  reason: string;
  why: TaskReason;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Which checklist items matter at the vessel's current stage */
function applies(v: VesselView, item: ChecklistItemDef): boolean {
  if (v.stage === "departed") return item.key === "paid" || item.phase === "departure";
  if (v.stage === "in_port") return true;
  return item.phase !== "departure";
}

function urgencyOf(v: VesselView, item: ChecklistItemDef, now: number): { urgency: TaskUrgency; reason: string; why: TaskReason } {
  if (v.stage === "departed") {
    return { urgency: "overdue", reason: `Sailed ${fmtRelative(v.departedAt, now)}`, why: { code: "sailed", at: v.departedAt } };
  }
  if (v.stage === "in_port") {
    return item.phase === "arrival"
      ? { urgency: "overdue", reason: `Berthed ${fmtRelative(v.inPortAt, now)}, still open`, why: { code: "berthedOpen", at: v.inPortAt } }
      : { urgency: "now", reason: `Berthed ${fmtRelative(v.inPortAt, now)}`, why: { code: "berthed", at: v.inPortAt } };
  }
  if (v.stage === "at_roads") {
    return item.phase === "arrival"
      ? { urgency: "now", reason: `Arrived at Sulina ${fmtRelative(v.arrivedAt, now)}`, why: { code: "arrivedSulina", at: v.arrivedAt } }
      : { urgency: "upcoming", reason: "At Sulina roads", why: { code: "atRoads" } };
  }
  const eta = v.etaSulina ? new Date(v.etaSulina).getTime() : null;
  if (eta !== null && eta - now < DAY_MS && item.phase === "arrival") {
    return eta < now
      ? { urgency: "now", reason: "ETA passed, not arrived yet", why: { code: "etaPassed" } }
      : { urgency: "now", reason: `ETA ${fmtRelative(v.etaSulina, now)}`, why: { code: "eta", at: v.etaSulina } };
  }
  return eta !== null
    ? { urgency: "upcoming", reason: `ETA ${fmtRelative(v.etaSulina, now)}`, why: { code: "eta", at: v.etaSulina } }
    : { urgency: "upcoming", reason: "No ETA yet", why: { code: "noEta" } };
}

export function deriveTasks(vessels: VesselView[], now = Date.now()): VesselTask[] {
  const tasks: VesselTask[] = [];
  for (const v of vessels) {
    if (v.restricted) continue;
    for (const item of CHECKLIST) {
      if (!applies(v, item) || isItemDone(v, item.key) !== false) continue;
      tasks.push({ id: `${v.id}:${item.key}`, vessel: v, item, ...urgencyOf(v, item, now) });
    }
  }
  return tasks;
}

/** Patch that turns a checklist item green */
export function doneInput(key: ChecklistKey): VesselInput {
  switch (key) {
    case "prearrivalsIn":
      return { prearrivalsIn: "ok" };
    case "prearrivalsOut":
      return { prearrivalsOut: "ok" };
    case "t1":
      return { t1: "yes" };
    case "mswIn":
      return { mswIn: true };
    case "mswOut":
      return { mswOut: true };
    case "pdaSent":
      return { pdaSent: true };
    case "paid":
      return { paid: true };
    case "pilotageArranged":
      return { pilotageArranged: true };
  }
}
