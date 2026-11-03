"use client";

import { useState } from "react";
import { Inbox, Users, Wallet, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { isAdmin } from "@/lib/auth/roles";
import { useTopUpRequests } from "@/lib/wallet/hooks";
import { PageHeader } from "../ui/primitives";
import { CountPill } from "../network/bits";
import { WalletOverview } from "./WalletOverview";
import { TopUpRequestsPanel } from "./TopUpRequestsPanel";
import { AccountsPanel } from "./AccountsPanel";

type Tab = "wallet" | "requests" | "accounts";

const TABS: { id: Tab; icon: LucideIcon }[] = [
  { id: "wallet", icon: Wallet },
  { id: "requests", icon: Inbox },
  { id: "accounts", icon: Users },
];

/** /balance: everyone's wallet; admins also handle top-up requests and accounts */
export function BalanceView() {
  const t = useTranslations("balance");
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [tab, setTab] = useState<Tab>("wallet");
  const { data: pending } = useTopUpRequests(admin ? "pending" : null);
  const pendingCount = admin ? pending?.length ?? 0 : 0;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      {admin ? (
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border bg-card p-1.5 shadow-card" role="tablist" aria-label={t("tabs.label")}>
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex min-h-10 flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 text-[13px] font-semibold transition sm:flex-none sm:px-3.5",
                tab === id ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary))]" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="hidden h-4 w-4 sm:block" aria-hidden />
              {id === "requests" ? (
                <>
                  <span className="sm:hidden">{t("tabs.requestsShort")}</span>
                  <span className="hidden sm:inline">{t("tabs.requests")}</span>
                </>
              ) : (
                t(`tabs.${id}`)
              )}
              {id === "requests" ? <CountPill count={pendingCount} label={t("tabs.pendingLabel")} className={cn(tab === id && "bg-white text-primary")} /> : null}
            </button>
          ))}
        </div>
      ) : null}
      {tab === "wallet" || !admin ? <WalletOverview /> : tab === "requests" ? <TopUpRequestsPanel /> : <AccountsPanel />}
    </div>
  );
}
