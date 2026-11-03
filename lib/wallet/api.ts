import api from "@/lib/api/client";
import type { KnownFieldErrors } from "@/lib/api/fieldErrors";
import type { TopUpRequest, TopUpStatus, WalletAccount, WalletSummary, WalletTransaction } from "./types";

/** 422 codes of /wallet calls the "balance" dictionary words */
export const WALLET_ERRORS: KnownFieldErrors = {
  amount: ["pendingExists", "invalid"],
  balance: ["insufficient"],
  status: ["alreadyHandled"],
  userId: ["notFound"],
  note: ["tooLong"],
};

/** Request and credit limits (backend top_up_request.amount CHECK, note lengths) */
export const TOP_UP_MIN = 1;
export const TOP_UP_MAX = 100_000;
export const TOP_UP_NOTE_MAX = 300;
export const CREDIT_NOTE_MAX = 200;

export const WalletApi = {
  async summary(): Promise<WalletSummary> {
    return (await api.get<WalletSummary>("/wallet")).data;
  },
  async requestTopUp(amount: number, note: string | null): Promise<TopUpRequest> {
    return (await api.post<TopUpRequest>("/wallet/top-up-requests", note ? { amount, note } : { amount })).data;
  },
  async rankBoost(): Promise<WalletSummary> {
    return (await api.post<WalletSummary>("/wallet/rank-boost")).data;
  },
  /** Admin */
  async topUpRequests(status: TopUpStatus | null): Promise<TopUpRequest[]> {
    return (await api.get<TopUpRequest[]>("/wallet/top-up-requests", { params: status ? { status } : {} })).data;
  },
  async approve(id: string): Promise<TopUpRequest> {
    return (await api.post<TopUpRequest>(`/wallet/top-up-requests/${encodeURIComponent(id)}/approve`)).data;
  },
  async decline(id: string): Promise<TopUpRequest> {
    return (await api.post<TopUpRequest>(`/wallet/top-up-requests/${encodeURIComponent(id)}/decline`)).data;
  },
  async credit(userId: number, amount: number, note: string | null): Promise<WalletTransaction> {
    return (await api.post<WalletTransaction>("/wallet/credits", note ? { userId, amount, note } : { userId, amount })).data;
  },
  async accounts(search: string): Promise<WalletAccount[]> {
    const q = search.trim();
    return (await api.get<WalletAccount[]>("/wallet/accounts", { params: q ? { search: q } : {} })).data;
  },
};
