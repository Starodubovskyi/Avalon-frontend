import { MAX_ACTIVITY_SLOTS } from "@/lib/points/limits";
import { nowIso } from "../ids";
import { forbidden, invalid, isRecord, ok, requireUser, type DemoRequest, type RouteDef } from "../http";
import { isTeamUser } from "../presenters";
import { charge, WALLET_PRICES } from "../ledger";
import { canEditPoint, toPointView, visiblePoint } from "../pointView";
import type { MapPointRow } from "../types";

/** Paid Business Activity slots and the point email confirmation (stage 2) */

const RESEND_AFTER_MS = 60_000;

function editable(req: DemoRequest): MapPointRow {
  const user = requireUser(req);
  const row = visiblePoint(req, user);
  if (!canEditPoint(user, row)) forbidden("Forbidden");
  return row;
}

/** POST /map-points/:id/activity-slots — 50 credits from whoever pressed the button */
function buySlot(req: DemoRequest) {
  const user = requireUser(req);
  const row = editable(req);
  if (row.activitySlots >= MAX_ACTIVITY_SLOTS) invalid({ activitySlots: "max" });
  charge(req.state, {
    userId: user.id,
    amount: -WALLET_PRICES.activitySlot,
    kind: "activity_slot",
    note: row.firstName,
    pointId: row.id,
    createdById: user.id,
  });
  row.activitySlots += 1;
  row.updatedAt = nowIso();
  return ok(toPointView(req.state, user, row));
}

/**
 * POST /map-points/:id/email-verification. The demo has no mailbox, so the address is confirmed
 * at once (the UI says so in a toast); the error codes are the backend's.
 */
function sendVerification(req: DemoRequest) {
  const row = editable(req);
  if (!row.email) invalid({ email: "missing" });
  if (row.emailVerifiedAt) invalid({ email: "alreadyVerified" });
  if (row.emailVerificationSentAt && Date.now() - Date.parse(row.emailVerificationSentAt) < RESEND_AFTER_MS) invalid({ email: "tooSoon" });
  const at = nowIso();
  row.emailVerificationSentAt = at;
  row.emailVerifiedAt = at;
  return ok({ sent: true });
}

/** Team only: confirm by hand when mail is not configured */
function markVerified(req: DemoRequest) {
  const user = requireUser(req);
  if (!isTeamUser(user)) forbidden();
  const row = visiblePoint(req, user);
  if (!row.email) invalid({ email: "missing" });
  row.emailVerifiedAt = row.emailVerifiedAt ?? nowIso();
  return ok(toPointView(req.state, user, row));
}

/**
 * Public: POST /map-points/email-verification/confirm { token }. Demo tokens: "demo-verify.<pointId>"
 * confirms; tokens starting with "expired" / "stale" give those codes; anything else is invalid.
 */
function confirm(req: DemoRequest) {
  const token = isRecord(req.body) && typeof req.body.token === "string" ? req.body.token.trim() : "";
  if (token.startsWith("expired")) invalid({ token: "expired" });
  if (token.startsWith("stale")) invalid({ token: "stale" });
  const id = /^demo-verify\.([0-9a-f-]{36})$/i.exec(token)?.[1];
  const row = id ? req.state.mapPoints.find((p) => p.id === id && !p.deletedAt) : undefined;
  if (!row || !row.email) return invalid({ token: "invalid" });
  row.emailVerifiedAt = row.emailVerifiedAt ?? nowIso();
  return ok({ pointId: row.id, title: row.firstName, email: row.email });
}

export const pointExtraRoutes: RouteDef[] = [
  ["POST", "/map-points/email-verification/confirm", confirm],
  ["POST", "/map-points/:id/activity-slots", buySlot],
  ["POST", "/map-points/:id/email-verification/mark-verified", markVerified],
  ["POST", "/map-points/:id/email-verification", sendVerification],
];
