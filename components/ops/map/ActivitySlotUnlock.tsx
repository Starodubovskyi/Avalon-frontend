"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useWallet } from "@/lib/wallet/hooks";
import { usePointExtras } from "@/lib/points/hooks";
import { MAX_ACTIVITY_SLOTS } from "@/lib/points/limits";
import type { TeamPoint } from "@/lib/points/team-points";
import { Spinner, btn } from "../ui/primitives";

/** "Unlock another activity — 50 credits": shows the balance, asks once more, handles a short balance */
export function ActivitySlotUnlock({ point, className }: { point: TeamPoint; className?: string }) {
  const t = useTranslations("points");
  const { data: wallet } = useWallet();
  const { buySlot } = usePointExtras();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; insufficient: boolean } | null>(null);
  const price = wallet?.prices.activitySlot ?? 50;
  const balance = wallet?.balance;
  const short = balance !== undefined && balance < price;

  if (point.activitySlots >= MAX_ACTIVITY_SLOTS) {
    return <p className={cn("text-xs text-muted-foreground", className)}>{t("slots.max", { max: MAX_ACTIVITY_SLOTS })}</p>;
  }

  async function buy() {
    setBusy(true);
    setError(null);
    const result = await buySlot(point);
    setBusy(false);
    setConfirming(false);
    if ("error" in result) setError({ text: result.error, insufficient: result.insufficient });
  }

  return (
    <div className={cn("space-y-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.06] p-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_6px_16px_-8px_rgba(245,158,11,0.9)]">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 basis-40">
          <p className="text-sm font-semibold text-foreground">{t("slots.unlockTitle", { price })}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="h-3 w-3" aria-hidden />
            {balance === undefined ? t("slots.balanceUnknown") : t("slots.balance", { balance })}
          </p>
        </div>
        {confirming ? (
          <div className="flex gap-1.5">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className={cn(btn.ghost, "h-10")}>
              {t("slots.cancel")}
            </button>
            <button type="button" onClick={() => void buy()} disabled={busy} className={cn(btn.primary, "h-10")}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              {t("slots.confirm", { price })}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} disabled={short} className={cn(btn.secondary, "h-10")}>
            {t("slots.unlock")}
          </button>
        )}
      </div>
      {short || error ? (
        <p role="alert" className="text-xs text-bad">
          {error?.text ?? t("errors.balance.insufficient")}{" "}
          {short || error?.insufficient ? (
            <Link href="/balance?topup=1" className="font-semibold underline underline-offset-2">
              {t("slots.topUp")}
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
