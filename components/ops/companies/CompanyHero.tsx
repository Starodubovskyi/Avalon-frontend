"use client";

import Link from "next/link";
import { BadgeCheck, ChevronRight, Lock, Pencil, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePointLabels } from "@/lib/points/labels";
import { pointTitle } from "@/lib/points/team-points";
import type { CompanyProfile } from "@/lib/companies/types";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointLogoAvatar } from "../map/PointKindIcon";
import { PointActions } from "../map/PointActions";
import { RankBadge } from "../map/RankBadge";
import { MembershipButton } from "./MembershipButton";

/** Gradient cover, logo, title, kind, activities, RANK and the actions of a company profile */
export function CompanyHero({ profile, onEdit }: { profile: CompanyProfile; onEdit: () => void }) {
  const t = useTranslations("companies");
  const labels = usePointLabels();
  const { point } = profile;
  const shareUrl = typeof window === "undefined" ? undefined : `${window.location.origin}/companies/${point.id}`;
  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-card">
      <div className={cn("relative h-32 overflow-hidden sm:h-40", POINT_KIND_CLASS[point.kind].gradient)}>
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-black/10 blur-3xl" aria-hidden />
        <div className="brand-grid opacity-60" aria-hidden />
        <nav className="absolute left-4 top-3 flex items-center gap-1 text-xs font-semibold text-white/85 sm:left-6" aria-label={t("profile.breadcrumb")}>
          <Link href="/companies" className="rounded-md px-1 py-1 hover:text-white hover:underline">
            {t("title")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="max-w-[45vw] truncate">{labels.kindPlural(point.kind)}</span>
        </nav>
        {point.visibility === "team" ? (
          <span className="absolute right-4 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur sm:right-6">
            <Lock className="h-3 w-3" aria-hidden /> {labels.visibility("team")}
          </span>
        ) : null}
      </div>

      <div className="px-4 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
          <span className="relative z-10 inline-flex rounded-3xl bg-card">
            <PointLogoAvatar point={point} size="xl" className="ring-4 ring-card" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <MembershipButton profile={profile} />
            {point.canEdit ? (
              <button type="button" onClick={onEdit} className={cn(btn.secondary, "h-10")}>
                <Pencil className="h-4 w-4" /> {t("profile.edit")}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <h1 className="break-words font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{pointTitle(point)}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.14em]", POINT_KIND_CLASS[point.kind].text)}>{labels.kind(point.kind)}</span>
            <RankBadge rank={point.rank} title={t("profile.rankHint")} />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden /> {t("card.people", { count: point.memberCount })}
            </span>
            {point.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-ok">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> {t("profile.verifiedCompany")}
              </span>
            ) : null}
          </div>
          {point.activities.length ? (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("profile.activities")}>
              {point.activities.map((code) => (
                <li key={code} className="rounded-full border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground/85">
                  {labels.activity(code)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <PointActions point={point} shareUrl={shareUrl} className="mt-4 rounded-2xl border bg-muted/30 p-1" />
      </div>
    </section>
  );
}
