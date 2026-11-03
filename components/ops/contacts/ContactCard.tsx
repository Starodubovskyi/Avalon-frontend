"use client";

import Link from "next/link";
import { Briefcase, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/vessels/format";
import { userName } from "@/lib/vessels/types";
import { activityLine } from "@/lib/points/activities";
import { POINT_KIND_SHORT, pointTitle, useFavoriteToggle, type TeamPoint } from "@/lib/points/team-points";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointLogoAvatar } from "../map/PointKindIcon";
import { RankBadge } from "../map/RankBadge";
import { mailtoHref, telHref, whatsappDigits } from "../map/PointActions";

/** One point of the team map as a directory card: logo, type, Business Activity, rank, contacts */
export function ContactCard({ p }: { p: TeamPoint }) {
  const toggleFavorite = useFavoriteToggle();
  const activity = activityLine(p);
  const wa = whatsappDigits(p.phone);
  return (
    <li className="group flex min-w-0 flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <PointLogoAvatar point={p} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{pointTitle(p)}</p>
          <p className={cn("truncate text-[11px] font-bold uppercase tracking-[0.1em]", POINT_KIND_CLASS[p.kind].text)}>{POINT_KIND_SHORT[p.kind]}</p>
        </div>
        <button
          type="button"
          onClick={() => void toggleFavorite(p)}
          aria-pressed={p.isFavorite}
          aria-label={p.isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cn(btn.icon, "-mr-1.5 -mt-1.5 h-10 w-10", p.isFavorite && "text-amber-500 hover:text-amber-500")}
        >
          <Star className={cn("h-[18px] w-[18px]", p.isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={cn("flex min-w-0 items-center gap-1.5 text-[13px]", activity ? "font-medium" : "text-muted-foreground")}>
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{activity || "No Business Activity"}</span>
        </span>
        <RankBadge rank={p.rank} size="sm" />
      </div>

      <div className="mt-3 flex-1 space-y-1.5 text-sm">
        {p.phone ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={telHref(p.phone)} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
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
          <a href={mailtoHref(p.email)} className="flex min-w-0 items-center gap-1.5 break-all text-primary hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {p.email}
          </a>
        ) : null}
        {p.address ? (
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="line-clamp-2">{p.address}</span>
          </p>
        ) : null}
        {!p.phone && !p.email && !p.address ? <p className="text-muted-foreground">No contact details yet</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span className="truncate text-[11px] text-muted-foreground">
          {userName(p.createdBy)} · {fmtRelative(p.createdAt)}
        </span>
        <Link href={`/maps?point=${p.id}`} className={cn(btn.ghost, "h-8 shrink-0 px-2.5 text-xs")}>
          <MapPin className="h-3.5 w-3.5" /> On map
        </Link>
      </div>
    </li>
  );
}
