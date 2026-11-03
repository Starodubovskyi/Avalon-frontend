"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, Lock, Mail, MapPin, MessageCircle, Phone, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePointLabels } from "@/lib/points/labels";
import { useFavoriteToggle } from "@/lib/points/hooks";
import { pointTitle, type TeamPoint } from "@/lib/points/team-points";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointLogoAvatar } from "../map/PointKindIcon";
import { RankBadge } from "../map/RankBadge";
import { VerifiedBadge } from "../map/PointEmailField";
import { mailtoHref, telHref, whatsappDigits } from "../map/PointActions";

/** One map point as a directory card: logo, type, Business Activity, RANK, contacts; the title opens the profile */
export function ContactCard({ p }: { p: TeamPoint }) {
  const t = useTranslations("companies");
  const labels = usePointLabels();
  const toggleFavorite = useFavoriteToggle();
  const activity = labels.activityLine(p);
  const wa = whatsappDigits(p.phone);
  const profile = `/companies/${p.id}`;
  return (
    <li className="group flex min-w-0 flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <Link href={profile} className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20" tabIndex={-1} aria-hidden>
          <PointLogoAvatar point={p} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={profile} className="block truncate font-semibold hover:text-primary hover:underline focus-visible:underline focus-visible:outline-none">
            {pointTitle(p)}
          </Link>
          <p className="flex items-center gap-1.5">
            <span className={cn("truncate text-[11px] font-bold uppercase tracking-[0.1em]", POINT_KIND_CLASS[p.kind].text)}>{labels.kindShort(p.kind)}</span>
            {p.visibility === "team" ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                <Lock className="h-2.5 w-2.5" aria-hidden /> {labels.visibility("team")}
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void toggleFavorite(p)}
          aria-pressed={p.isFavorite}
          aria-label={p.isFavorite ? t("card.unfavorite") : t("card.favorite")}
          className={cn(btn.icon, "-mr-1.5 -mt-1.5 h-10 w-10", p.isFavorite && "text-amber-500 hover:text-amber-500")}
        >
          <Star className={cn("h-[18px] w-[18px]", p.isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={cn("flex min-w-0 items-center gap-1.5 text-[13px]", activity ? "font-medium" : "text-muted-foreground")}>
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{activity || t("card.noActivity")}</span>
          {p.activities.length > 1 ? <span className="shrink-0 text-xs text-muted-foreground">+{p.activities.length - 1}</span> : null}
        </span>
        <RankBadge rank={p.rank} size="sm" />
      </div>

      <div className="mt-3 flex-1 space-y-1.5 text-sm">
        {p.phone ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={telHref(p.phone)} className="inline-flex min-h-6 items-center gap-1.5 font-medium text-primary hover:underline">
              <Phone className="h-3.5 w-3.5" /> {p.phone}
            </a>
            {wa.length >= 9 ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-ok hover:underline">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
        {p.email ? (
          <p className="flex min-w-0 flex-wrap items-center gap-1.5">
            <a href={mailtoHref(p.email)} className="flex min-w-0 items-center gap-1.5 break-all text-primary hover:underline">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {p.email}
            </a>
            {p.emailVerified ? <VerifiedBadge /> : null}
          </p>
        ) : null}
        {p.address ? (
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="line-clamp-2">{p.address}</span>
          </p>
        ) : null}
        {!p.phone && !p.email && !p.address ? <p className="text-muted-foreground">{t("card.noContacts")}</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span className="flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" aria-hidden /> {t("card.people", { count: p.memberCount })}
        </span>
        <div className="flex shrink-0 gap-1">
          <Link href={`/maps?point=${p.id}`} className={cn(btn.ghost, "h-10 px-2.5 text-xs")}>
            <MapPin className="h-3.5 w-3.5" /> {t("card.onMap")}
          </Link>
          <Link href={profile} className={cn(btn.secondary, "h-10 px-3 text-xs")}>
            {t("card.profile")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </li>
  );
}
