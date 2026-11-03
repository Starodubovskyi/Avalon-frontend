"use client";

import Image from "next/image";
import { Clock3 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { WalletSummary } from "@/lib/wallet/types";

/** The "bank card": brand navy with a soft aurora, chip, balance in credits, holder and a pending top-up */
export function BalanceCard({ wallet, holder }: { wallet: WalletSummary; holder: string }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  const pending = wallet.pendingTopUp;
  return (
    <div className="brand-surface relative isolate aspect-[1.586] w-full max-w-[460px] overflow-hidden rounded-[22px] p-5 text-white shadow-[0_30px_60px_-24px_hsl(var(--brand-navy)/0.75)] ring-1 ring-white/10 sm:p-6">
      <div className="brand-aurora -z-10" aria-hidden />
      <div className="brand-grid -z-10 opacity-70" aria-hidden />
      <div className="absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full border border-white/10" aria-hidden />
      <div className="absolute -right-10 -top-14 -z-10 h-44 w-44 rounded-full border border-white/10" aria-hidden />

      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-0.5">
              <Image src="/brand/avalon-icon-192.png" alt="" width={28} height={28} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">{t("card.brand")}</span>
          </div>
          {/* EMV-style chip */}
          <span className="relative h-8 w-11 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-inner" aria-hidden>
            <span className="absolute inset-x-0 top-1/2 h-px bg-amber-700/40" />
            <span className="absolute inset-y-0 left-1/3 w-px bg-amber-700/40" />
            <span className="absolute inset-y-0 right-1/3 w-px bg-amber-700/40" />
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{t("card.available")}</p>
          <p className="tabular mt-1 font-display text-[40px] font-bold leading-none tracking-tight sm:text-5xl">
            {format.number(wallet.balance)}
            <span className="ml-2 align-baseline text-base font-semibold text-white/70">{t("card.unit", { count: wallet.balance })}</span>
          </p>
          <p className="mt-1 text-xs text-white/55">{t("card.rate")}</p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">{t("card.holder")}</p>
            <p className="truncate text-sm font-semibold uppercase tracking-[0.08em]">{holder}</p>
          </div>
          {pending ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              <Clock3 className="h-3 w-3" aria-hidden /> {t("card.pending", { amount: format.number(pending.amount) })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
