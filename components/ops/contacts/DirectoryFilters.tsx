"use client";

import { Briefcase, Search, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ACTIVITY_CODES, isActivityCode, type ActivityCode } from "@/lib/points/activities";
import { POINT_KINDS, type PointKind } from "@/lib/points/team-points";
import { usePointLabels } from "@/lib/points/labels";
import { SelectInput, TextInput, btn } from "../ui/primitives";
import { POINT_KIND_CLASS } from "../map/PointKindIcon";

export type DirectoryTab = PointKind | "all" | "mine";

/** Kind tabs (+ My companies), search, Business Activity and Favorites filters of /companies */
export function DirectoryFilters({
  tab,
  onTab,
  counts,
  total,
  mineCount,
  query,
  onQuery,
  activity,
  onActivity,
  activityCounts,
  favoritesOnly,
  onFavoritesOnly,
}: {
  tab: DirectoryTab;
  onTab: (tab: DirectoryTab) => void;
  counts: Record<PointKind, number>;
  total: number;
  mineCount: number | null;
  query: string;
  onQuery: (q: string) => void;
  activity: ActivityCode | "";
  onActivity: (a: ActivityCode | "") => void;
  activityCounts: Record<ActivityCode, number>;
  favoritesOnly: boolean;
  onFavoritesOnly: (on: boolean) => void;
}) {
  const t = useTranslations("companies");
  const labels = usePointLabels();
  const tabs: DirectoryTab[] = ["all", ...POINT_KINDS, "mine"];
  return (
    <div className="space-y-2 rounded-2xl border bg-card p-2 shadow-card">
      <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label={t("filters.kind")}>
        {tabs.map((k) => {
          const active = tab === k;
          const count = k === "all" ? total : k === "mine" ? mineCount : counts[k];
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(k)}
              className={cn(
                "flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                k === "mine" && "ml-auto",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {k === "mine" ? <Briefcase className="h-3.5 w-3.5" aria-hidden /> : k !== "all" ? <span className={cn("h-2 w-2 rounded-full", POINT_KIND_CLASS[k].dot)} /> : null}
              {k === "all" ? t("filters.all") : k === "mine" ? t("filters.mine") : labels.kindPlural(k)}
              {count !== null ? (
                <span className={cn("tabular rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/20" : "bg-muted text-foreground/70")}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 border-t p-1 pt-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("filters.search")}
            className="pl-9 text-base sm:text-sm"
            aria-label={t("filters.search")}
          />
        </div>
        <SelectInput
          value={activity}
          onChange={(e) => onActivity(isActivityCode(e.target.value) ? e.target.value : "")}
          aria-label={t("filters.activity")}
          className="sm:w-64"
        >
          <option value="">{t("filters.allActivities")}</option>
          {ACTIVITY_CODES.map((code) => (
            <option key={code} value={code}>
              {labels.activity(code)} ({activityCounts[code]})
            </option>
          ))}
        </SelectInput>
        <button
          type="button"
          onClick={() => onFavoritesOnly(!favoritesOnly)}
          aria-pressed={favoritesOnly}
          className={cn(btn.secondary, "shrink-0", favoritesOnly && "border-amber-400/60 bg-amber-400/10 text-amber-700 hover:bg-amber-400/15 dark:text-amber-300")}
        >
          <Star className={cn("h-4 w-4", favoritesOnly && "fill-amber-400 text-amber-400")} /> {t("filters.favorites")}
        </button>
      </div>
    </div>
  );
}
