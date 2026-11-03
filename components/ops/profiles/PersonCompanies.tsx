"use client";

import Link from "next/link";
import { Building2, ChevronRight, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePointLabels } from "@/lib/points/labels";
import type { PersonCompany } from "@/lib/profiles/types";
import { EmptyState, Panel } from "../ui/primitives";
import { PointLogoAvatar } from "../map/PointKindIcon";

/** Companies the person owns or works at, each opening its profile */
export function PersonCompanies({ companies, isMe }: { companies: PersonCompany[]; isMe: boolean }) {
  const t = useTranslations("profiles");
  const labels = usePointLabels();
  return (
    <Panel title={t("companies.title")} icon={<Building2 className="h-4 w-4" />} bodyClassName="pt-1">
      {companies.length ? (
        <ul className="space-y-1">
          {companies.map((c) => (
            <li key={c.pointId}>
              <Link href={`/companies/${c.pointId}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-accent">
                <PointLogoAvatar point={{ id: c.pointId, kind: c.kind, hasLogo: c.hasLogo, logoVersion: c.logoVersion }} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{c.title}</span>
                    {c.role === "owner" ? <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label={t("companies.owner")} /> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.role === "owner" ? t("companies.owner") : c.position || t("companies.member")} · {labels.kindShort(c.kind)}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Building2 className="h-7 w-7" />}
          title={t("companies.emptyTitle")}
          text={isMe ? t("companies.emptyMine") : t("companies.emptyText")}
          action={
            isMe ? (
              <Link href="/companies" className="text-sm font-semibold text-primary hover:underline">
                {t("companies.find")}
              </Link>
            ) : undefined
          }
        />
      )}
    </Panel>
  );
}
