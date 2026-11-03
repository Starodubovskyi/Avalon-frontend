"use client";

import Link from "next/link";
import { useState } from "react";
import { Rocket, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fieldErrorCode, useApiErrorText } from "@/lib/api/fieldErrors";
import { WALLET_ERRORS } from "@/lib/wallet/api";
import { useWalletActions } from "@/lib/wallet/hooks";
import type { WalletSummary } from "@/lib/wallet/types";
import { Spinner, btn } from "../ui/primitives";

/** Confirmation before spending credits on +RANK for a month */
export function BoostDialog({ open, onOpenChange, wallet }: { open: boolean; onOpenChange: (open: boolean) => void; wallet: WalletSummary }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  const errorText = useApiErrorText("balance", WALLET_ERRORS);
  const { boostRank } = useWalletActions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; insufficient: boolean } | null>(null);
  const { rankBoost, rankBoostPoints, rankBoostDays } = wallet.prices;
  const short = wallet.balance < rankBoost;

  /** every way out of the dialog drops a stale error */
  function setOpen(next: boolean) {
    setError(null);
    onOpenChange(next);
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await boostRank();
      toast.success(t("boost.done", { points: rankBoostPoints, days: rankBoostDays }));
      setOpen(false);
    } catch (e) {
      setError({ text: errorText(e), insufficient: fieldErrorCode(e, WALLET_ERRORS) === "balance.insufficient" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{t("boost.title")}</DialogTitle>
          <DialogDescription>{t("boost.text", { points: rankBoostPoints, days: rankBoostDays })}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-amber-300/20 via-amber-400/10 to-transparent p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_10px_24px_-10px_rgba(245,158,11,0.9)]">
            <Trophy className="h-6 w-6" aria-hidden />
          </span>
          <dl className="grid flex-1 grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">{t("boost.price")}</dt>
              <dd className="tabular font-display text-lg font-bold">{t("card.amount", { count: rankBoost, amount: format.number(rankBoost) })}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("boost.gain")}</dt>
              <dd className="tabular font-display text-lg font-bold text-amber-600 dark:text-amber-300">+{format.number(rankBoostPoints)} RANK</dd>
            </div>
          </dl>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("boost.after", { balance: format.number(Math.max(0, wallet.balance - rankBoost)) })}
        </p>
        {short || error ? (
          <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">
            {error?.text ?? t("errors.balance.insufficient")}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className={btn.secondary}>
            {t("common.cancel")}
          </button>
          {short || error?.insufficient ? (
            <Link href="/balance?topup=1" onClick={() => setOpen(false)} className={btn.primary}>
              {t("boost.topUpFirst")}
            </Link>
          ) : (
            <button type="button" onClick={() => void confirm()} disabled={busy} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Rocket className="h-4 w-4" />}
              {t("boost.confirm", { price: format.number(rankBoost) })}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
