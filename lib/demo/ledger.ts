import type { WalletTransaction } from "@/lib/wallet/types";
import { invalid } from "./http";
import { uuid } from "./ids";
import type { DemoState, WalletTransactionRow } from "./types";

/** Wallet ledger of the demo: insert-only rows, the balance is their sum (backend src/wallet) */

export const WALLET_PRICES = { activitySlot: 50, rankBoost: 100 } as const;
export const RANK_BOOST = { points: 250, days: 30 } as const;

export function balanceOf(state: DemoState, userId: number): number {
  return state.walletTransactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.amount, 0);
}

type NewTransaction = Omit<WalletTransactionRow, "id" | "createdAt"> & { createdAt?: string };

export function addTransaction(state: DemoState, tx: NewTransaction): WalletTransactionRow {
  const row: WalletTransactionRow = { id: uuid(), createdAt: new Date().toISOString(), ...tx };
  state.walletTransactions.push(row);
  return row;
}

/** Spend from the balance: 422 { balance: 'insufficient' } when it does not cover the price */
export function charge(state: DemoState, tx: NewTransaction & { amount: number }): WalletTransactionRow {
  if (balanceOf(state, tx.userId) + tx.amount < 0) invalid({ balance: "insufficient" });
  return addTransaction(state, tx);
}

/** Newest first with the running balance after each row (last 50) */
export function historyOf(state: DemoState, userId: number, limit = 50): WalletTransaction[] {
  // by time, then by insertion order (two rows in the same millisecond keep the order they were written)
  const rows = state.walletTransactions
    .map((t, seq) => ({ t, seq }))
    .filter(({ t }) => t.userId === userId)
    .sort((a, b) => a.t.createdAt.localeCompare(b.t.createdAt) || a.seq - b.seq)
    .map(({ t }) => t);
  let running = 0;
  const out = rows.map((t) => {
    running += t.amount;
    return { id: t.id, amount: t.amount, kind: t.kind, note: t.note, pointId: t.pointId, createdAt: t.createdAt, balanceAfter: running };
  });
  return out.reverse().slice(0, limit);
}
