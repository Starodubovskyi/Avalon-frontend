"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Globe2, Info, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { userName } from "@/lib/vessels/types";
import type { TeamPoint } from "@/lib/points/team-points";
import { Panel } from "../ui/primitives";
import { VerifiedBadge } from "../map/PointEmailField";
import { mailtoHref, telHref } from "../map/PointActions";

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <div className="mt-0.5 break-words text-sm">{children}</div>
      </div>
    </div>
  );
}

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Description, website and the contacts of a company (verified email badge) */
export function CompanyAbout({ point }: { point: TeamPoint }) {
  const t = useTranslations("companies");
  const format = useFormatter();
  return (
    <Panel title={t("about.title")} icon={<Info className="h-4 w-4" />} bodyClassName="pt-1">
      {point.description ? (
        <p className="whitespace-pre-line pb-3 text-[15px] leading-relaxed text-foreground/90">{point.description}</p>
      ) : (
        <p className="pb-3 text-sm text-muted-foreground">{point.canEdit ? t("about.noDescriptionOwner") : t("about.noDescription")}</p>
      )}
      <div className="divide-y border-t">
        {point.website ? (
          <Row icon={<Globe2 className="h-4 w-4" />} label={t("about.website")}>
            <a href={/^https?:\/\//i.test(point.website) ? point.website : undefined} target="_blank" rel="noreferrer noopener" className="font-medium text-primary hover:underline">
              {host(point.website)}
            </a>
          </Row>
        ) : null}
        {point.phone ? (
          <Row icon={<Phone className="h-4 w-4" />} label={t("about.phone")}>
            <a href={telHref(point.phone)} className="font-medium tabular-nums text-primary hover:underline">
              {point.phone}
            </a>
          </Row>
        ) : null}
        {point.email ? (
          <Row icon={<Mail className="h-4 w-4" />} label={t("about.email")}>
            <span className="flex flex-wrap items-center gap-2">
              <a href={mailtoHref(point.email)} className="break-all font-medium text-primary hover:underline">
                {point.email}
              </a>
              {point.emailVerified ? <VerifiedBadge /> : <span className="text-xs text-muted-foreground">{t("about.notVerified")}</span>}
            </span>
          </Row>
        ) : null}
        {point.address ? (
          <Row icon={<MapPin className="h-4 w-4" />} label={t("about.address")}>
            {point.address}
          </Row>
        ) : null}
        <Row icon={<UserRound className="h-4 w-4" />} label={t("about.addedBy")}>
          {point.createdBy ? (
            <Link href={`/people/${point.createdBy.id}`} className="font-medium hover:text-primary hover:underline">
              {userName(point.createdBy)}
            </Link>
          ) : (
            "—"
          )}
        </Row>
        <Row icon={<CalendarDays className="h-4 w-4" />} label={t("about.onMapSince")}>
          {format.dateTime(new Date(point.createdAt), { day: "numeric", month: "long", year: "numeric" })}
        </Row>
      </div>
    </Panel>
  );
}
