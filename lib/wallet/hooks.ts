"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fieldErrorCode } from "@/lib/api/fieldErrors";
import { useAuth } from "@/lib/auth/useAuth";
import { isAdmin } from "@/lib/auth/roles";
import { TEAM_POINTS_KEY } from "@/lib/points/team-points";
import { isCompanyKey } from "@/lib/companies/hooks";
import { isProfileKey } from "@/lib/profiles/hooks";
import { WALLET_ERRORS, WalletApi } from "./api";
import type { TopUpRequest, TopUpStatus, WalletAccount, WalletSummary } from "./types";

export const WALLET_KEY = "wallet";

type TopUpsKey = readonly ["wallet-top-ups", TopUpStatus | "all"];
type AccountsKey = readonly ["wallet-accounts", string];

/** The signed-in user's balance, prices and recent history. Shared by the topbar chip and /balance. */
export function useWallet() {
  const { isAuthed } = useAuth();
  return useSWR<WalletSummary>(isAuthed ? WALLET_KEY : null, () => WalletApi.summary(), {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
  });
}

/** Admin: top-up requests by status (null = every status) */
export function useTopUpRequests(status: TopUpStatus | null) {
  const { user } = useAuth();
  const key: TopUpsKey | null = isAdmin(user) ? ["wallet-top-ups", status ?? "all"] : null;
  return useSWR<TopUpRequest[]>(key, ([, s]: TopUpsKey) => WalletApi.topUpRequests(s === "all" ? null : s), {
    keepPreviousData: true,
    refreshInterval: 30_000,
  });
}

/** Admin: balances of users matching the search (up to 100) */
export function useWalletAccounts(search: string) {
  const { user } = useAuth();
  const key: AccountsKey | null = isAdmin(user) ? ["wallet-accounts", search.trim()] : null;
  return useSWR<WalletAccount[]>(key, ([, q]: AccountsKey) => WalletApi.accounts(q), { keepPreviousData: true });
}

function isWalletAdminKey(key: unknown): boolean {
  return Array.isArray(key) && (key[0] === "wallet-top-ups" || key[0] === "wallet-accounts");
}

/** Wallet writes; each refreshes the summary (and the admin lists). Errors are thrown to the caller. */
export function useWalletActions() {
  const { mutate } = useSWRConfig();

  const requestTopUp = useCallback(
    async (amount: number, note: string | null) => {
      try {
        const saved = await WalletApi.requestTopUp(amount, note);
        await mutate(WALLET_KEY);
        void mutate(isWalletAdminKey);
        return saved;
      } catch (e) {
        // a request sent from another tab: show it as pending
        if (fieldErrorCode(e, WALLET_ERRORS) === "amount.pendingExists") void mutate(WALLET_KEY);
        throw e;
      }
    },
    [mutate],
  );

  const boostRank = useCallback(async () => {
    const summary = await WalletApi.rankBoost();
    await mutate(WALLET_KEY, summary, { revalidate: false });
    // the author's RANK on every map point and profile changes
    void mutate(TEAM_POINTS_KEY);
    void mutate((k: unknown) => isProfileKey(k) || isCompanyKey(k));
    return summary;
  }, [mutate]);

  const handleTopUp = useCallback(
    async (id: string, approve: boolean) => {
      try {
        const saved = approve ? await WalletApi.approve(id) : await WalletApi.decline(id);
        await mutate(isWalletAdminKey);
        void mutate(WALLET_KEY);
        return saved;
      } catch (e) {
        // another admin was faster: refresh the list so the row shows its real status
        if (fieldErrorCode(e, WALLET_ERRORS) === "status.alreadyHandled") void mutate(isWalletAdminKey);
        throw e;
      }
    },
    [mutate],
  );

  const credit = useCallback(
    async (userId: number, amount: number, note: string | null) => {
      const tx = await WalletApi.credit(userId, amount, note);
      await mutate(isWalletAdminKey);
      void mutate(WALLET_KEY);
      return tx;
    },
    [mutate],
  );

  return { requestTopUp, boostRank, handleTopUp, credit };
}
