"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clock3, Layers, Plus, Rocket, Sparkles, Trophy, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { displayName } from "@/lib/auth/roles";
import { useWallet } from "@/lib/wallet/hooks";
import { ErrorBlock, LoadingBlock, Panel, btn } from "../ui/primitives";
import { BalanceCard } from "./BalanceCard";
import { TopUpDialog } from "./TopUpDialog";
import { BoostDialog } from "./BoostDialog";
import { TransactionList } from "./TransactionList";

/** The signed-in user's wallet: card, actions, prices, active boosts and history */
export function WalletOverview() {
  const t = useTranslations("balance");
  const format = useFormatter();
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useWallet();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/balance";

  // /balance?topup=1 (from "Top up" links) opens the request dialog once
  const wantsTopUp = params?.get("topup") === "1";
  useEffect(() => {
    if (!wantsTopUp || !data) return;
    if (!data.pendingTopUp) setTopUpOpen(true);
    router.replace(pathname, { scroll: false });
  }, [wantsTopUp, data, router, pathname]);

  if (error && !data) return <ErrorBlock error={new Error(t("loadError"))} onRetry={() => void mutate()} />;
  if (isLoading || !data) return <LoadingBlock label={t("loading")} />;

  const pending = data.pendingTopUp;
  const prices = [
    { icon: Layers, label: t("prices.slot"), hint: t("prices.slotHint"), value: data.prices.activitySlot },
    { icon: Trophy, label: t("prices.boost"), hint: t("prices.boostHint", { points: data.prices.rankBoostPoints, days: data.prices.rankBoostDays }), value: data.prices.rankBoost },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3">
          <BalanceCard wallet={data} holder={displayName(user)} />
          <div className="grid max-w-[460px] grid-cols-2 gap-2">
            <button type="button" onClick={() => setTopUpOpen(true)} disabled={!!pending} className={cn(btn.primary, "h-11")}>
              <Plus className="h-4 w-4" /> {t("actions.topUp")}
            </button>
            <button type="button" onClick={() => setBoostOpen(true)} className={cn(btn.secondary, "h-11")}>
              <Rocket className="h-4 w-4" /> {t("actions.boost")}
            </button>
          </div>
          {pending ? (
            <p className="flex max-w-[460px] items-start gap-2 rounded-xl border border-stage-expected/30 bg-stage-expected/[0.07] px-3 py-2.5 text-xs text-foreground/80">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stage-expected" aria-hidden />
              {t("pending", {
                amount: format.number(pending.amount),
                date: format.dateTime(new Date(pending.createdAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
              })}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title={t("prices.title")} description={t("prices.hint")} icon={<Sparkles className="h-4 w-4" />} bodyClassName="grid gap-3 pt-2 sm:grid-cols-2">
            {prices.map(({ icon: Icon, label, hint, value }) => (
              <div key={label} className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <span className="tabular font-display text-2xl font-bold">{format.number(value)}</span>
                </div>
                <p className="mt-2 text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            ))}
          </Panel>
          <Panel title={t("boosts.title")} icon={<Wallet className="h-4 w-4" />} bodyClassName="pt-1">
            {data.activeBoosts.length ? (
              <ul className="space-y-2">
                {data.activeBoosts.map((b) => (
                  <li key={b.expiresAt} className="flex items-center justify-between gap-3 rounded-xl bg-amber-400/10 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      <Trophy className="h-4 w-4" aria-hidden /> +{format.number(b.points)} RANK
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("boosts.until", { date: format.dateTime(new Date(b.expiresAt), { day: "numeric", month: "long" }) })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("boosts.empty")}</p>
            )}
          </Panel>
        </div>
      </div>

      <TransactionList transactions={data.transactions} />
      <TopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
      <BoostDialog open={boostOpen} onOpenChange={setBoostOpen} wallet={data} />
    </div>
  );
}
