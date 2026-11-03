"use client";

import Link from "next/link";
import { ArrowDownLeft, Layers, Receipt, RotateCcw, SlidersHorizontal, Trophy, type LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { WalletTransaction, WalletTransactionKind } from "@/lib/wallet/types";
import { EmptyState, Panel } from "../ui/primitives";

const KIND: Record<WalletTransactionKind, { icon: LucideIcon; tile: string }> = {
  top_up: { icon: ArrowDownLeft, tile: "bg-ok/10 text-ok" },
  activity_slot: { icon: Layers, tile: "bg-primary/10 text-primary" },
  rank_boost: { icon: Trophy, tile: "bg-amber-400/15 text-amber-600 dark:text-amber-300" },
  refund: { icon: RotateCcw, tile: "bg-ok/10 text-ok" },
  adjustment: { icon: SlidersHorizontal, tile: "bg-muted text-muted-foreground" },
};

/** Ledger rows, newest first: kind icon, note, date, signed amount and the balance after it */
export function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  return (
    <Panel title={t("history.title")} description={t("history.hint")} icon={<Receipt className="h-4 w-4" />} bodyClassName="pt-1">
      {transactions.length ? (
        <ul className="divide-y">
          {transactions.map((tx) => {
            const meta = KIND[tx.kind] ?? KIND.adjustment;
            const Icon = meta.icon;
            const credit = tx.amount > 0;
            return (
              <li key={tx.id} className="flex items-center gap-3 py-3">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.tile)}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t(`kinds.${tx.kind}`)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format.dateTime(new Date(tx.createdAt), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {tx.note ? (
                      <>
                        {" · "}
                        {tx.pointId ? (
                          <Link href={`/companies/${tx.pointId}`} className="hover:text-primary hover:underline">
                            {tx.note}
                          </Link>
                        ) : (
                          tx.note
                        )}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("tabular font-display text-[15px] font-bold", credit ? "text-ok" : "text-foreground")}>
                    {credit ? "+" : "−"}
                    {format.number(Math.abs(tx.amount))}
                  </p>
                  <p className="tabular text-[11px] text-muted-foreground">{t("history.after", { balance: format.number(tx.balanceAfter) })}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={<Receipt className="h-7 w-7" />} title={t("history.emptyTitle")} text={t("history.emptyText")} />
      )}
    </Panel>
  );
}
