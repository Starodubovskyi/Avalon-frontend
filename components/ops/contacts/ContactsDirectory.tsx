"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPinPlus, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTIVITY_CODES, ACTIVITY_LABEL, activityLine, isActivityCode, type ActivityCode } from "@/lib/points/activities";
import { DEFAULT_FORM_KIND, POINT_KINDS, POINT_KIND_PLURAL, pointTitle, useTeamPoints, type PointKind } from "@/lib/points/team-points";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, SelectInput, TextInput, btn } from "../ui/primitives";
import { POINT_KIND_CLASS } from "../map/PointKindIcon";
import { ContactCard } from "./ContactCard";

/** Directory of every typed point the team put on the map: head offices, branches, authorities, people… */
export function ContactsDirectory() {
  const { data, error, isLoading, mutate } = useTeamPoints();
  const [kind, setKind] = useState<PointKind | "">("");
  const [activity, setActivity] = useState<ActivityCode | "">("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = {} as Record<PointKind, number>;
    for (const k of POINT_KINDS) c[k] = (data ?? []).filter((p) => p.kind === k).length;
    return c;
  }, [data]);

  const activityCounts = useMemo(() => {
    const c = {} as Record<ActivityCode, number>;
    for (const code of ACTIVITY_CODES) c[code] = (data ?? []).filter((p) => (!kind || p.kind === kind) && p.activities.includes(code)).length;
    return c;
  }, [data, kind]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((p) => !kind || p.kind === kind)
      .filter((p) => !activity || p.activities.includes(activity))
      .filter((p) => !favoritesOnly || p.isFavorite)
      .filter((p) => !q || `${pointTitle(p)} ${activityLine(p)} ${p.address ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || pointTitle(a).localeCompare(pointTitle(b)));
  }, [data, kind, activity, favoritesOnly, query]);

  const filtered = !!(kind || activity || favoritesOnly || query.trim());

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Network"
        title="Companies & contacts"
        subtitle="Everyone the team pinned on the fleet map — head offices, branches, authorities, self-employed and people."
        actions={
          <Link href={`/maps?add=${kind || DEFAULT_FORM_KIND}`} className={btn.primary}>
            <MapPinPlus className="h-4 w-4" /> Add on map
          </Link>
        }
      />

      <div className="space-y-2 rounded-2xl border bg-card p-2 shadow-card">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Point type">
          {(["", ...POINT_KINDS] as const).map((k) => {
            const active = kind === k;
            return (
              <button
                key={k || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(k)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {k ? <span className={cn("h-2 w-2 rounded-full", POINT_KIND_CLASS[k].dot)} /> : null}
                {k ? POINT_KIND_PLURAL[k] : "All"}
                <span className={cn("tabular rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/20" : "bg-muted text-foreground/70")}>
                  {k ? counts[k] : (data ?? []).length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 border-t p-1 pt-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, address, email" className="pl-9" aria-label="Search contacts" />
          </div>
          <SelectInput
            value={activity}
            onChange={(e) => setActivity(isActivityCode(e.target.value) ? e.target.value : "")}
            aria-label="Business Activity"
            className="sm:w-64"
          >
            <option value="">All Business Activities</option>
            {ACTIVITY_CODES.map((code) => (
              <option key={code} value={code}>
                {ACTIVITY_LABEL[code]} ({activityCounts[code]})
              </option>
            ))}
          </SelectInput>
          <button
            type="button"
            onClick={() => setFavoritesOnly((f) => !f)}
            aria-pressed={favoritesOnly}
            className={cn(btn.secondary, "shrink-0", favoritesOnly && "border-amber-400/60 bg-amber-400/10 text-amber-700 hover:bg-amber-400/15 dark:text-amber-300")}
          >
            <Star className={cn("h-4 w-4", favoritesOnly && "fill-amber-400 text-amber-400")} /> Favorites
          </button>
        </div>
      </div>

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading contacts…" /> : null}
      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={favoritesOnly ? <Star className="h-7 w-7" /> : <MapPinPlus className="h-7 w-7" />}
            title={data.length ? (favoritesOnly ? "No favorites here" : "Nothing matches") : "No contacts yet"}
            text={
              data.length
                ? filtered
                  ? "Try another type or activity, or clear the search."
                  : "Nothing to show."
                : "Open the fleet map, press Add point, choose a type and click on the map."
            }
            action={
              data.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setKind("");
                    setActivity("");
                    setFavoritesOnly(false);
                    setQuery("");
                  }}
                  className={btn.secondary}
                >
                  Clear filters
                </button>
              ) : (
                <Link href={`/maps?add=${DEFAULT_FORM_KIND}`} className={btn.primary}>
                  <MapPinPlus className="h-4 w-4" /> Add the first one
                </Link>
              )
            }
          />
        </div>
      ) : null}
      {rows.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((p) => (
            <ContactCard key={p.id} p={p} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
