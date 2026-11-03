"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Search, UserCheck, UserRoundCheck, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PeopleFilter } from "@/lib/network/api";
import { useDebounced, usePeople, usePeopleActions } from "@/lib/network/hooks";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, Spinner, TextInput } from "../ui/primitives";
import { focusRing } from "../network/bits";
import { PersonCard } from "./PersonCard";

/** Labels and empty states live in messages/<locale>/people.json under filters.<id> */
const FILTERS: { id: PeopleFilter; icon: LucideIcon }[] = [
  { id: "all", icon: UsersRound },
  { id: "friends", icon: ArrowLeftRight },
  { id: "following", icon: UserCheck },
  { id: "followers", icon: UserRoundCheck },
];

export function PeopleView() {
  const t = useTranslations("people");
  const [filter, setFilter] = useState<PeopleFilter>("all");
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 300);
  const { data, error, isLoading, isValidating, mutate } = usePeople(debounced, filter);
  const { toggleFollow } = usePeopleActions();
  const people = data ?? [];
  const current = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const searching = debounced.trim().length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-card xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label={t("filterLabel")}>
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all",
                  focusRing,
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary))]"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden /> {t(`filters.${f.id}.label`)}
              </button>
            );
          })}
        </div>
        <div className="relative p-1 xl:w-72 xl:p-0">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground xl:left-3" aria-hidden />
          <TextInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="pl-9 text-base sm:text-sm"
          />
          {isValidating && data ? <Spinner className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 xl:right-3" /> : null}
        </div>
      </div>

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}

      {data && !people.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          {searching ? (
            <EmptyState icon={<Search className="h-7 w-7" />} title={t("noMatchTitle")} text={t("noMatchText")} />
          ) : (
            <EmptyState
              icon={<current.icon className="h-7 w-7" />}
              title={t(`filters.${current.id}.emptyTitle`)}
              text={t(`filters.${current.id}.emptyText`)}
            />
          )}
        </div>
      ) : null}

      {people.length ? (
        <>
          <p className="tabular text-xs text-muted-foreground" aria-live="polite">
            {t("count", { count: people.length })}
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {people.map((p) => (
              <li key={p.id}>
                <PersonCard person={p} onToggleFollow={toggleFollow} />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
