"use client";

import Link from "next/link";
import { ChevronRight, GitBranch, Network } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePointLabels } from "@/lib/points/labels";
import { pointTitle, type TeamPoint } from "@/lib/points/team-points";
import type { CompanyProfile } from "@/lib/companies/types";
import { Panel } from "../ui/primitives";
import { PointLogoAvatar } from "../map/PointKindIcon";

function PointLink({ point, caption }: { point: TeamPoint; caption: string }) {
  return (
    <li>
      <Link href={`/companies/${point.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-accent">
        <PointLogoAvatar point={point} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{pointTitle(point)}</span>
          <span className="block truncate text-xs text-muted-foreground">{caption}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}

/** Head office of a branch and the branches of a head office; hidden when there are neither */
export function CompanyRelations({ profile }: { profile: CompanyProfile }) {
  const t = useTranslations("companies");
  const labels = usePointLabels();
  const { parent, branches } = profile;
  if (!parent && !branches.length) return null;
  return (
    <Panel title={t("relations.title")} icon={<Network className="h-4 w-4" />} bodyClassName="space-y-3 pt-1">
      {parent ? (
        <div>
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{t("relations.parent")}</p>
          <ul>
            <PointLink point={parent} caption={labels.kind(parent.kind)} />
          </ul>
        </div>
      ) : null}
      {branches.length ? (
        <div>
          <p className="flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5" aria-hidden /> {t("relations.branches", { count: branches.length })}
          </p>
          <ul>
            {branches.map((b) => (
              <PointLink key={b.id} point={b} caption={b.address ?? labels.kind(b.kind)} />
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
