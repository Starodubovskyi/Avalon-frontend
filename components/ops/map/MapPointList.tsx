"use client";

import { Lock, Search, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePointLabels } from "@/lib/points/labels";
import { pointTitle, type TeamPoint } from "@/lib/points/team-points";
import { TextInput } from "../ui/primitives";
import { PointLogoAvatar } from "./PointKindIcon";
import { RankBadge } from "./RankBadge";

export function MapPointList({
  points,
  selectedId,
  onSelect,
  query,
  onQuery,
  favoritesOnly,
  onFavoritesOnly,
  favoriteCount,
}: {
  points: TeamPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
  favoritesOnly: boolean;
  onFavoritesOnly: (on: boolean) => void;
  favoriteCount: number;
}) {
  const t = useTranslations("map");
  const labels = usePointLabels();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={query} onChange={(e) => onQuery(e.target.value)} placeholder={t("list.search")} className="h-10 pl-9" aria-label={t("list.search")} />
        </div>
        <div className="flex gap-1 text-xs font-semibold" role="group" aria-label={t("list.show")}>
          {([false, true] as const).map((fav) => (
            <button
              key={String(fav)}
              type="button"
              aria-pressed={favoritesOnly === fav}
              onClick={() => onFavoritesOnly(fav)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-2.5 transition",
                favoritesOnly === fav ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {fav ? <Star className={cn("h-3.5 w-3.5", favoritesOnly && "fill-amber-400 text-amber-400")} /> : null}
              {fav ? t("list.favorites", { count: favoriteCount }) : t("list.all")}
            </button>
          ))}
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {points.length === 0 ? (
          <li className="px-3 py-10 text-center text-sm text-muted-foreground">{favoritesOnly ? t("list.emptyFavorites") : t("list.empty")}</li>
        ) : null}
        {points.map((p) => {
          const activity = labels.activityLine(p);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                  selectedId === p.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent",
                )}
              >
                <PointLogoAvatar point={p} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold">{pointTitle(p)}</span>
                    {p.isFavorite ? <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-label={t("list.favoriteAria")} /> : null}
                    {p.visibility === "team" ? <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label={labels.visibility("team")} /> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {labels.kindShort(p.kind)}
                    {activity ? ` · ${activity}` : ""}
                  </span>
                </span>
                <RankBadge rank={p.rank} size="sm" label={false} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
