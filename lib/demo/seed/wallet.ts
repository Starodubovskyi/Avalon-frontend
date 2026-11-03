import { uuid } from "../ids";
import type { MapPointRow, RankBoostRow, TopUpRequestRow, WalletTransactionRow } from "../types";

/** Credits of the demo users: approved and pending top-ups, a bought activity slot, RANK boosts */

const DAY = 86_400_000;

type RequestSpec = [userId: number, amount: number, note: string | null, status: TopUpRequestRow["status"], daysAgo: number];

const REQUESTS: RequestSpec[] = [
  [705, 300, "Bank transfer, invoice AV-2026-087", "approved", 40],
  [706, 100, "Card payment at the office", "approved", 12],
  [706, 100, "Sent twice by mistake", "declined", 8],
  [707, 500, "Prepayment for Q4 port calls", "approved", 20],
  [705, 200, "Bank transfer, invoice AV-2026-114", "pending", 0.1],
  [708, 50, "First top-up", "pending", 1],
];

type TxSpec = [userId: number, amount: number, kind: WalletTransactionRow["kind"], note: string | null, daysAgo: number, point?: string];

const EXTRA: TxSpec[] = [
  [701, 1000, "top_up", "Opening balance", 60],
  [701, -100, "rank_boost", null, 40],
  [701, -50, "activity_slot", "Avalon Shipping SRL", 50, "Avalon Shipping SRL"],
  [702, 200, "top_up", "Opening balance", 50],
  [705, -50, "activity_slot", "Danube Grain Trading SRL", 30, "Danube Grain Trading SRL"],
  [705, -100, "rank_boost", null, 10],
  [705, 150, "top_up", "Welcome bonus", 5],
  [706, -20, "adjustment", "Correction of a double credit", 7],
  [707, -100, "rank_boost", null, 5],
];

/** [userId, days the boost started ago]; boosts last 30 days */
const BOOSTS: [number, number][] = [
  [701, 40],
  [705, 10],
  [707, 5],
];

export function seedWallet(points: MapPointRow[], now: number) {
  const at = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();
  const topUpRequests: TopUpRequestRow[] = REQUESTS.map(([userId, amount, note, status, daysAgo]) => ({
    id: uuid(),
    userId,
    amount,
    note,
    status,
    handledById: status === "pending" ? null : 701,
    handledAt: status === "pending" ? null : at(daysAgo - 0.05),
    createdAt: at(daysAgo),
    updatedAt: at(status === "pending" ? daysAgo : daysAgo - 0.05),
  }));
  const walletTransactions: WalletTransactionRow[] = [
    ...topUpRequests
      .filter((r) => r.status === "approved")
      .map((r) => ({ id: uuid(), userId: r.userId, amount: r.amount, kind: "top_up" as const, note: r.note, pointId: null, createdById: 701, createdAt: r.handledAt ?? r.createdAt })),
    ...EXTRA.map(([userId, amount, kind, note, daysAgo, point]) => ({
      id: uuid(),
      userId,
      amount,
      kind,
      note,
      pointId: point ? points.find((p) => p.firstName === point)?.id ?? null : null,
      createdById: amount > 0 || kind === "adjustment" ? 701 : userId,
      createdAt: at(daysAgo),
    })),
  ];
  const rankBoosts: RankBoostRow[] = BOOSTS.map(([userId, startedAgo]) => ({
    id: uuid(),
    userId,
    points: 250,
    createdAt: at(startedAgo),
    expiresAt: at(startedAgo - 30),
  }));
  return { topUpRequests, walletTransactions, rankBoosts };
}
