"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, CalendarClock, CheckCircle2, ListChecks, MapPinned, ShipWheel } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META, daysSince, isItemDone, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { DESTINATION_LABEL, type VesselView } from "@/lib/vessels/types";
import { useChecklistLabels } from "@/lib/vessels/i18n";
import { EmptyState, Panel } from "../ui/primitives";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import type { OverviewStats } from "./useOverviewStats";

function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {children} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

function VesselLine({ v, right }: { v: VesselView; right: ReactNode }) {
  const tc = useTranslations("common");
  return (
    <li>
      <Link
        href={`/vessels/${v.id}`}
        className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <span
          className={cn(
            "h-2.5 w-2.5 shrink-0 rounded-full ring-4",
            isUnpaidAfterDeparture(v) ? "bg-stage-unpaid ring-stage-unpaid/15" : cn(STAGE_META[v.stage].dot, "ring-muted"),
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{v.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {tc(`stage.${v.stage}`)} → {DESTINATION_LABEL[v.destination]}
          </span>
        </span>
        <span className="shrink-0 text-right text-xs">{right}</span>
      </Link>
    </li>
  );
}

/** Done / total checklist as a thin meter with the first open items in red */
function OpenItems({ v }: { v: VesselView }) {
  const t = useTranslations("dashboard");
  // same translated chips and names as the board's checklist
  const checklist = useChecklistLabels();
  const open = checklist.filter((c) => isItemDone(v, c.key) === false);
  const applicable = checklist.filter((c) => isItemDone(v, c.key) !== null).length;
  const done = applicable - open.length;
  return (
    <span className="flex flex-col items-end gap-1.5" title={open.map((c) => c.label).join(", ")}>
      <span className="flex items-center gap-1">
        {open.slice(0, 2).map((c) => (
          <span key={c.key} className="chip-bad whitespace-nowrap rounded-full border px-1.5 py-px text-[10px] font-bold tracking-wide">
            {c.short}
          </span>
        ))}
        {open.length > 2 ? <span className="tabular text-[11px] font-semibold text-bad">+{open.length - 2}</span> : null}
      </span>
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="tabular">{t("attention.progress", { done, total: applicable })}</span>
        <span className="flex gap-[2px]" aria-hidden>
          {Array.from({ length: applicable }, (_, i) => (
            <span key={i} className={cn("h-1.5 w-1.5 rounded-[2px]", i < done ? "bg-ok" : "bg-bad/35")} />
          ))}
        </span>
      </span>
    </span>
  );
}

export function AttentionPanel({ stats, className }: { stats: OverviewStats; className?: string }) {
  const t = useTranslations("dashboard");
  const total = stats.unpaid.length + stats.attention.length;
  return (
    <Panel
      title={t("attention.title")}
      description={total ? t("attention.description", { count: total }) : undefined}
      icon={<ListChecks />}
      className={className}
      action={<PanelLink href="/vessels?view=attention">{t("attention.openBoard")}</PanelLink>}
    >
      {total === 0 ? (
        <EmptyState icon={<CheckCircle2 />} title={t("attention.emptyTitle")} text={t("attention.emptyText")} />
      ) : (
        <ul className="-mx-2.5 divide-y divide-border/60">
          {stats.unpaid.map((v) => (
            <VesselLine key={v.id} v={v} right={<UnpaidBadge days={daysSince(v.departedAt)} />} />
          ))}
          {stats.attention.map((v) => (
            <VesselLine key={v.id} v={v} right={<OpenItems v={v} />} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function ArrivalsPanel({ stats }: { stats: OverviewStats }) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const now = new Date();
  return (
    <Panel title={t("arrivals.title")} icon={<CalendarClock />} action={<PanelLink href="/lineup">{t("arrivals.lineup")}</PanelLink>}>
      {stats.arriving.length === 0 ? (
        <EmptyState icon={<CalendarClock />} title={t("arrivals.emptyTitle")} text={t("arrivals.emptyText")} />
      ) : (
        <ul className="-mx-2.5 divide-y divide-border/60">
          {stats.arriving.map((v) => {
            const eta = v.etaSulina ? new Date(v.etaSulina) : null;
            return (
              <VesselLine
                key={v.id}
                v={v}
                right={
                  eta ? (
                    <span className="tabular block leading-tight">
                      <span className="block font-semibold text-foreground/85">
                        {format.dateTime(eta, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
                      </span>
                      <span className="block text-muted-foreground">{format.relativeTime(eta, now)}</span>
                    </span>
                  ) : null
                }
              />
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export function ByPortPanel({ stats, className }: { stats: OverviewStats; className?: string }) {
  const t = useTranslations("dashboard");
  const max = Math.max(1, ...stats.byPort.map((p) => p.n));
  return (
    <Panel title={t("byPort.title")} icon={<MapPinned />} className={className}>
      {stats.byPort.length === 0 ? (
        <EmptyState icon={<MapPinned />} title={t("byPort.emptyTitle")} />
      ) : (
        <ul className="space-y-3">
          {stats.byPort.map(({ d, n }) => (
            <li key={d} className="grid grid-cols-[96px_minmax(0,1fr)_28px] items-center gap-3 text-sm">
              <span className="truncate font-medium">{DESTINATION_LABEL[d]}</span>
              <span className="flex h-2 gap-[3px]" aria-hidden>
                {Array.from({ length: max }, (_, i) => (
                  <span key={i} className={cn("h-full flex-1 rounded-[3px]", i < n ? "bg-gradient-to-r from-primary/80 to-primary" : "bg-muted")} />
                ))}
              </span>
              <span className="tabular text-right font-semibold">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Clients see the vessels in work instead of the staff activity log */
export function ActiveVesselsPanel({ stats, className }: { stats: OverviewStats; className?: string }) {
  const t = useTranslations("dashboard");
  return (
    <Panel title={t("inWork.title")} icon={<ShipWheel />} className={className} action={<PanelLink href="/vessels">{t("inWork.open")}</PanelLink>}>
      {stats.active.length === 0 ? (
        <EmptyState icon={<ShipWheel />} title={t("inWork.emptyTitle")} />
      ) : (
        <ul className="-mx-2.5 divide-y divide-border/60">
          {stats.active.map((v) => (
            <VesselLine key={v.id} v={v} right={<StageBadge stage={v.stage} compact />} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

