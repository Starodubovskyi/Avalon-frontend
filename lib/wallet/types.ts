import type { UserCard } from "@/lib/network/api";

/** Mirrors backend src/wallet (docs/designs/2026-11-03-phase2-3-wallet-profiles-i18n.md) */
export type WalletTransactionKind = "top_up" | "activity_slot" | "rank_boost" | "refund" | "adjustment";
export type TopUpStatus = "pending" | "approved" | "declined";

export interface WalletTransaction {
  id: string;
  amount: number;
  kind: WalletTransactionKind;
  note: string | null;
  pointId: string | null;
  createdAt: string;
  balanceAfter: number;
}

export interface TopUpRequest {
  id: string;
  amount: number;
  note: string | null;
  status: TopUpStatus;
  user: UserCard;
  handledAt: string | null;
  createdAt: string;
}

export interface WalletPrices {
  activitySlot: number;
  rankBoost: number;
  rankBoostPoints: number;
  rankBoostDays: number;
}

export interface WalletSummary {
  balance: number;
  /** Newest first, last 50 */
  transactions: WalletTransaction[];
  prices: WalletPrices;
  pendingTopUp: TopUpRequest | null;
  activeBoosts: { points: number; expiresAt: string }[];
}

export interface WalletAccount {
  user: UserCard;
  balance: number;
}
