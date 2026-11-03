"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { personName } from "@/lib/network/format";
import { useDebounced } from "@/lib/network/hooks";
import { useWalletAccounts } from "@/lib/wallet/hooks";
import type { WalletAccount } from "@/lib/wallet/types";
import { Avatar, EmptyState, ErrorBlock, LoadingBlock, Spinner, TextInput, btn } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";
import { CreditDialog } from "./CreditDialog";

/** Admin: every account with its balance; Credit / Adjust opens the dialog */
export function AccountsPanel() {
  const t = useTranslations("balance");
  const format = useFormatter();
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 300);
  const { data, error, isLoading, isValidating, mutate } = useWalletAccounts(debounced);
  const [selected, setSelected] = useState<WalletAccount | null>(null);

  return (
    <section className="rounded-2xl border bg-card shadow-card">
      <div className="relative border-b p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <TextInput
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("accounts.search")}
          aria-label={t("accounts.search")}
          className="pl-9 text-base sm:text-sm"
        />
        {isValidating && data ? <Spinner className="absolute right-6 top-1/2 h-4 w-4 -translate-y-1/2" /> : null}
      </div>
      <div className="px-4 sm:px-5">
        {error && !data ? (
          <div className="py-4">
            <ErrorBlock error={new Error(t("loadError"))} onRetry={() => void mutate()} />
          </div>
        ) : null}
        {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
        {data && !data.length ? <EmptyState icon={<Users className="h-7 w-7" />} title={t("accounts.emptyTitle")} text={t("accounts.emptyText")} /> : null}
        {data?.length ? (
          <ul className="divide-y">
            {data.map((a) => {
              const name = personName(a.user);
              return (
                <li key={a.user.id} className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
                  <Avatar name={name} className="h-10 w-10" />
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{name}</span>
                      <PersonRoleBadge role={a.user.role} compact />
                    </p>
                    {a.user.email ? <p className="truncate text-xs text-muted-foreground">{a.user.email}</p> : null}
                  </div>
                  <span className={cn("tabular font-display text-lg font-bold", a.balance === 0 && "text-muted-foreground")}>
                    {format.number(a.balance)}
                  </span>
                  <button type="button" onClick={() => setSelected(a)} className={cn(btn.secondary, "ml-auto h-10 shrink-0 px-3")}>
                    <SlidersHorizontal className="h-4 w-4" /> {t("accounts.manage")}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <CreditDialog account={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
