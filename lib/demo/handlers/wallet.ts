import { ROLE } from "@/lib/auth/roles";
import type { TopUpRequest, WalletAccount, WalletSummary } from "@/lib/wallet/types";
import { CREDIT_NOTE_MAX, TOP_UP_MAX, TOP_UP_MIN, TOP_UP_NOTE_MAX } from "@/lib/wallet/api";
import { nowIso, uuid } from "../ids";
import { contains, created, invalid, notFound, ok, requireRoles, requireUser, uuidParam, type DemoRequest, type RouteDef } from "../http";
import { cardById, compareUsers, toUserCard } from "../presenters";
import { RANK_BOOST, WALLET_PRICES, addTransaction, balanceOf, charge, historyOf } from "../ledger";
import type { DemoState, TopUpRequestRow } from "../types";

/** /wallet — virtual credits: summary, top-up requests, RANK boost; admin approves and credits (stage 2) */

const ADMIN = [ROLE.admin] as const;
const STATUSES = ["pending", "approved", "declined"];

function toRequest(state: DemoState, r: TopUpRequestRow): TopUpRequest {
  return { id: r.id, amount: r.amount, note: r.note, status: r.status, user: cardById(state, r.userId), handledAt: r.handledAt, createdAt: r.createdAt };
}

function summary(state: DemoState, userId: number): WalletSummary {
  const now = Date.now();
  const pending = state.topUpRequests.find((r) => r.userId === userId && r.status === "pending");
  return {
    balance: balanceOf(state, userId),
    transactions: historyOf(state, userId),
    prices: { activitySlot: WALLET_PRICES.activitySlot, rankBoost: WALLET_PRICES.rankBoost, rankBoostPoints: RANK_BOOST.points, rankBoostDays: RANK_BOOST.days },
    pendingTopUp: pending ? toRequest(state, pending) : null,
    activeBoosts: state.rankBoosts
      .filter((b) => b.userId === userId && Date.parse(b.expiresAt) > now)
      .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
      .map((b) => ({ points: b.points, expiresAt: b.expiresAt })),
  };
}

function getWallet(req: DemoRequest) {
  return ok(summary(req.state, requireUser(req).id));
}

function intAmount(value: unknown, min: number, max: number): number {
  const n = typeof value === "string" && value.trim() ? Number(value) : value;
  if (typeof n !== "number" || !Number.isInteger(n) || n < min || n > max) return invalid({ amount: "invalid" });
  return n;
}

function note(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return invalid({ note: "invalid" });
  const text = value.trim();
  if (text.length > max) invalid({ note: "tooLong" });
  return text || null;
}

function requestTopUp(req: DemoRequest) {
  const user = requireUser(req);
  const amount = intAmount(req.body.amount, TOP_UP_MIN, TOP_UP_MAX);
  const text = note(req.body.note, TOP_UP_NOTE_MAX);
  if (req.state.topUpRequests.some((r) => r.userId === user.id && r.status === "pending")) invalid({ amount: "pendingExists" });
  const at = nowIso();
  const row: TopUpRequestRow = { id: uuid(), userId: user.id, amount, note: text, status: "pending", handledById: null, handledAt: null, createdAt: at, updatedAt: at };
  req.state.topUpRequests.push(row);
  return created(toRequest(req.state, row));
}

function listRequests(req: DemoRequest) {
  requireRoles(req, ADMIN);
  const status = req.query.status;
  if (status && !STATUSES.includes(status)) invalid({ status: `status must be one of the following values: ${STATUSES.join(", ")}` });
  const rows = req.state.topUpRequests
    .filter((r) => !status || r.status === status)
    .sort((a, b) => (a.status === "pending" ? 0 : 1) - (b.status === "pending" ? 0 : 1) || b.createdAt.localeCompare(a.createdAt));
  return ok(rows.slice(0, 200).map((r) => toRequest(req.state, r)));
}

function handle(approve: boolean) {
  return (req: DemoRequest) => {
    const admin = requireRoles(req, ADMIN);
    const id = uuidParam(req);
    const row = req.state.topUpRequests.find((r) => r.id === id) ?? notFound("Top-up request not found");
    if (row.status !== "pending") invalid({ status: "alreadyHandled" });
    const at = nowIso();
    Object.assign(row, { status: approve ? "approved" : "declined", handledById: admin.id, handledAt: at, updatedAt: at });
    if (approve) addTransaction(req.state, { userId: row.userId, amount: row.amount, kind: "top_up", note: row.note, pointId: null, createdById: admin.id, createdAt: at });
    return ok(toRequest(req.state, row));
  };
}

/** Admin credit (amount > 0, top_up) or correction (amount < 0, adjustment) */
function credit(req: DemoRequest) {
  const admin = requireRoles(req, ADMIN);
  const userId = Number(req.body.userId);
  const target = Number.isInteger(userId) ? req.state.users.find((u) => u.id === userId && !u.deletedAt) : undefined;
  if (!target) invalid({ userId: "notFound" });
  const amount = intAmount(req.body.amount, -TOP_UP_MAX, TOP_UP_MAX);
  if (amount === 0) invalid({ amount: "invalid" });
  const text = note(req.body.note, CREDIT_NOTE_MAX);
  const tx = (amount < 0 ? charge : addTransaction)(req.state, {
    userId: target.id,
    amount,
    kind: amount < 0 ? "adjustment" : "top_up",
    note: text,
    pointId: null,
    createdById: admin.id,
  });
  return created({ id: tx.id, amount: tx.amount, kind: tx.kind, note: tx.note, pointId: tx.pointId, createdAt: tx.createdAt, balanceAfter: balanceOf(req.state, target.id) });
}

function accounts(req: DemoRequest) {
  requireRoles(req, ADMIN);
  const search = req.query.search ?? "";
  const rows: WalletAccount[] = req.state.users
    .filter((u) => !u.deletedAt && contains([u.firstName, u.lastName, u.email, `${u.firstName} ${u.lastName}`], search))
    .sort(compareUsers)
    .slice(0, 100)
    .map((u) => ({ user: toUserCard(u), balance: balanceOf(req.state, u.id) }));
  return ok(rows);
}

/** 100 credits → +250 RANK for 30 days */
function rankBoost(req: DemoRequest) {
  const user = requireUser(req);
  const at = new Date();
  charge(req.state, { userId: user.id, amount: -WALLET_PRICES.rankBoost, kind: "rank_boost", note: null, pointId: null, createdById: user.id });
  req.state.rankBoosts.push({
    id: uuid(),
    userId: user.id,
    points: RANK_BOOST.points,
    expiresAt: new Date(at.getTime() + RANK_BOOST.days * 86_400_000).toISOString(),
    createdAt: at.toISOString(),
  });
  return ok(summary(req.state, user.id));
}

export const walletRoutes: RouteDef[] = [
  ["GET", "/wallet", getWallet],
  ["GET", "/wallet/accounts", accounts],
  ["POST", "/wallet/credits", credit],
  ["POST", "/wallet/rank-boost", rankBoost],
  ["GET", "/wallet/top-up-requests", listRequests],
  ["POST", "/wallet/top-up-requests", requestTopUp],
  ["POST", "/wallet/top-up-requests/:id/approve", handle(true)],
  ["POST", "/wallet/top-up-requests/:id/decline", handle(false)],
];
