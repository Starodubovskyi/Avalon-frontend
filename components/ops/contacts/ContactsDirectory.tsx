"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Briefcase, MapPinPlus, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { ACTIVITY_CODES, type ActivityCode } from "@/lib/points/activities";
import { DEFAULT_FORM_KIND, POINT_KINDS, pointTitle, type PointKind } from "@/lib/points/team-points";
import { useTeamPoints } from "@/lib/points/hooks";
import { usePointLabels } from "@/lib/points/labels";
import { useMyCompanies } from "@/lib/companies/hooks";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, btn } from "../ui/primitives";
import { ContactCard } from "./ContactCard";
import { DirectoryFilters, type DirectoryTab } from "./DirectoryFilters";

function toTab(value: string | null): DirectoryTab {
  if (value === "mine" || (POINT_KINDS as readonly string[]).includes(value ?? "")) return value as DirectoryTab;
  return "all";
}

/**
 * Directory of the points on the map: everyone sees the public companies (the team sees all),
 * "My companies" lists my points and where I work. Cards open the company profile.
 */
export function ContactsDirectory() {
  const t = useTranslations("companies");
  const labels = usePointLabels();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "/companies";
  const params = useSearchParams();
  const tab = toTab(params?.get("tab") ?? null);
  const all = useTeamPoints();
  const mine = useMyCompanies();
  const source = tab === "mine" ? mine : all;
  const data = source.data;
  const [activity, setActivity] = useState<ActivityCode | "">("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");

  const setTab = (next: DirectoryTab) => router.replace(next === "all" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  const counts = useMemo(() => {
    const c = {} as Record<PointKind, number>;
    for (const k of POINT_KINDS) c[k] = (all.data ?? []).filter((p) => p.kind === k).length;
    return c;
  }, [all.data]);

  const kind = tab === "all" || tab === "mine" ? null : tab;
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
      .filter((p) => !q || `${pointTitle(p)} ${labels.activityList(p)} ${p.address ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || pointTitle(a).localeCompare(pointTitle(b)));
  }, [data, kind, activity, favoritesOnly, query, labels]);

  const filtered = !!(kind || activity || favoritesOnly || query.trim());
  const clear = () => {
    setActivity("");
    setFavoritesOnly(false);
    setQuery("");
    if (kind) setTab("all");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={canEdit(user) ? t("subtitleTeam") : t("subtitle")}
        actions={
          <Link href={`/maps?add=${kind || DEFAULT_FORM_KIND}`} className={btn.primary}>
            <MapPinPlus className="h-4 w-4" /> {t("addOnMap")}
          </Link>
        }
      />

      <DirectoryFilters
        tab={tab}
        onTab={setTab}
        counts={counts}
        total={(all.data ?? []).length}
        mineCount={mine.data ? mine.data.length : null}
        query={query}
        onQuery={setQuery}
        activity={activity}
        onActivity={setActivity}
        activityCounts={activityCounts}
        favoritesOnly={favoritesOnly}
        onFavoritesOnly={setFavoritesOnly}
      />

      {source.error && !data ? <ErrorBlock error={source.error} onRetry={() => void source.mutate()} /> : null}
      {source.isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          {tab === "mine" && !filtered ? (
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title={t("empty.mineTitle")}
              text={t("empty.mineText")}
              action={
                <Link href={`/maps?add=${DEFAULT_FORM_KIND}`} className={btn.primary}>
                  <MapPinPlus className="h-4 w-4" /> {t("empty.mineAction")}
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={favoritesOnly ? <Star className="h-7 w-7" /> : <MapPinPlus className="h-7 w-7" />}
              title={data.length ? (favoritesOnly ? t("empty.favoritesTitle") : t("empty.filteredTitle")) : t("empty.noneTitle")}
              text={data.length ? (filtered ? t("empty.filteredText") : t("empty.nothing")) : t("empty.noneText")}
              action={
                data.length ? (
                  <button type="button" onClick={clear} className={btn.secondary}>
                    {t("empty.clear")}
                  </button>
                ) : (
                  <Link href={`/maps?add=${DEFAULT_FORM_KIND}`} className={btn.primary}>
                    <MapPinPlus className="h-4 w-4" /> {t("empty.addFirst")}
                  </Link>
                )
              }
            />
          )}
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
