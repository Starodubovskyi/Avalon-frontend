"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_TIME_ZONE } from "@/i18n/config";
import { useClock } from "@/lib/public/useClock";
import { DanubeArt } from "@/components/public/brand/DanubeArt";
import type { OverviewStats } from "./useOverviewStats";

type DayPart = "morning" | "afternoon" | "evening" | "night";

const HOUR_FMT = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: APP_TIME_ZONE });
const OFFSET_FMT = new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, timeZoneName: "shortOffset" });

/** Greeting by the hour on the Danube, not the viewer's own clock */
function dayPart(now: number): DayPart {
  const h = Number(HOUR_FMT.format(now));
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  if (h >= 18 && h < 23) return "evening";
  return "night";
}

function offsetLabel(now: number): string {
  return OFFSET_FMT.formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** Share of vessels in work by stage, as one stacked bar */
function FleetBar({ stats, staff }: { stats: OverviewStats; staff: boolean }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const parts = [
    { key: "expected", n: stats.expected, cls: "bg-stage-expected", label: tc("stage.expected") },
    { key: "roads", n: stats.roads, cls: "bg-stage-roads", label: tc("stage.at_roads") },
    { key: "port", n: stats.port, cls: "bg-stage-port", label: tc("stage.in_port") },
    ...(staff ? [{ key: "unpaid", n: stats.unpaid.length, cls: "bg-stage-unpaid", label: t("kpi.unpaid") }] : []),
  ];
  const total = parts.reduce((s, p) => s + p.n, 0);
  return (
    <div className="max-w-xl">
      {/* one segment per vessel: proportions without inline widths, and it reads as a fleet */}
      <div className="flex h-2.5 gap-[3px]" role="img" aria-label={t("hero.fleetBar", { count: total })}>
        {total ? (
          parts.flatMap((p) => Array.from({ length: p.n }, (_, i) => <span key={`${p.key}-${i}`} className={cn("h-full flex-1 rounded-[3px]", p.cls)} />))
        ) : (
          <span className="h-full flex-1 rounded-full bg-white/10" />
        )}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", p.cls)} aria-hidden />
            {p.label}
            <span className="tabular font-semibold text-white">{p.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OverviewHero({ firstName, stats, staff }: { firstName: string; stats: OverviewStats; staff: boolean }) {
  const t = useTranslations("dashboard");
  const format = useFormatter();
  const now = useClock(15_000);

  return (
    <section className="brand-surface relative isolate overflow-hidden rounded-[28px] text-white shadow-elevated">
      <div className="brand-aurora" aria-hidden />
      <div className="brand-grid" aria-hidden />
      <div className="noise-overlay" aria-hidden />
      <DanubeArt
        id="overview-hero"
        className="pointer-events-none absolute -bottom-16 right-[-10%] w-[85%] max-w-none opacity-50 sm:-bottom-24 lg:-bottom-10 lg:right-[-4%] lg:w-[62%] lg:opacity-70"
      />

      <div className="relative grid gap-8 px-5 py-7 sm:px-9 sm:py-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--brand-accent))]">{t("hero.eyebrow")}</p>
          <h1 className="mt-3 text-balance font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[40px]">
            {now === null ? t("hero.greetingDay", { name: firstName }) : t(`hero.greeting.${dayPart(now)}`, { name: firstName })}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            {t("hero.summary", { active: stats.active.length, arriving: stats.arriving.length })}
            {staff && stats.unpaid.length ? <> · <span className="font-semibold text-[hsl(326_90%_76%)]">{t("hero.unpaid", { count: stats.unpaid.length })}</span></> : null}
          </p>
          <div className="mt-6">
            <FleetBar stats={stats} staff={staff} />
          </div>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md sm:w-auto sm:min-w-[260px] sm:p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            <Clock3 className="h-3.5 w-3.5" aria-hidden /> {t("hero.danubeTime")}
          </p>
          <p className="tabular mt-2 font-display text-[44px] font-extrabold leading-none tracking-[-0.04em]">
            {now === null ? "--:--" : format.dateTime(now, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
            <span className="ml-2 align-middle text-xs font-semibold tracking-normal text-white/55">{now === null ? "" : offsetLabel(now)}</span>
          </p>
          <p className="mt-2 text-sm text-white/75 first-letter:uppercase">
            {now === null ? " " : format.dateTime(now, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/50">{t("hero.ports")}</p>
        </div>
      </div>
    </section>
  );
}
