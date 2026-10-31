"use client";

import { useMemo, useState } from "react";
import { Navigation, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClock } from "@/lib/public/useClock";
import { COUNTRY_LABEL, INDICATIVE_NOTE, PORT_GUIDE, SULINA_CHANNEL, type CountryCode } from "@/lib/public/portGuide";
import { IndicativeNote } from "../IndicativeNote";
import { PublicPageIntro } from "../PublicShell";
import { LocalClock, PortCard } from "./PortCard";

type Filter = "all" | CountryCode;

const FILTERS: Filter[] = ["all", "RO", "UA", "MD"];

function SulinaPanel({ now }: { now: number | null }) {
  const c = SULINA_CHANNEL;
  return (
    <section
      id="sulina"
      className="bg-sidebar-gradient relative scroll-mt-24 overflow-hidden rounded-[24px] p-5 text-sidebar-foreground shadow-elevated sm:p-8"
    >
      <div aria-hidden className="noise-overlay" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stage-roads text-white shadow-[0_8px_20px_-8px_hsl(var(--st-roads))]">
              <Navigation className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">{c.name}</h2>
              <p className="text-xs text-sidebar-muted">
                Romania · <span className="font-mono">{c.unlocode}</span> · local <LocalClock timezone={c.timezone} now={now} className="text-white" />
              </p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-sidebar-foreground/85">{c.summary}</p>
          <dl className="mt-6 grid grid-cols-2 gap-2.5">
            {c.facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">{f.label}</dt>
                <dd className="mt-1 text-[15px] font-bold leading-snug text-white">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-stage-roads" aria-hidden /> Transit rules of thumb
          </p>
          <ol className="mt-4 space-y-3.5">
            {c.rules.map((r, i) => (
              <li key={r} className="flex gap-3 text-sm leading-relaxed text-sidebar-foreground/85">
                <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function PortGuideView() {
  const now = useClock();
  const [filter, setFilter] = useState<Filter>("all");
  const ports = useMemo(() => PORT_GUIDE.filter((p) => filter === "all" || p.country === filter), [filter]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: PORT_GUIDE.length, RO: 0, UA: 0, MD: 0 };
    for (const p of PORT_GUIDE) c[p.country] += 1;
    return c;
  }, []);

  return (
    <>
      <PublicPageIntro
        eyebrow="Port guide"
        title="Danube ports and the Sulina channel"
        subtitle="Draught, pilotage, local time and main cargoes for every port Avalon covers — a quick brief before you nominate."
      >
        <IndicativeNote className="mt-6 max-w-3xl">
          <span className="font-semibold">{INDICATIVE_NOTE.title}</span> {INDICATIVE_NOTE.detail}
        </IndicativeNote>
      </PublicPageIntro>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SulinaPanel now={now} />

        <section aria-labelledby="ports-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ports-heading" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                River ports
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">* Draught alongside, indicative; berths differ by terminal.</p>
            </div>
            <div className="no-scrollbar flex w-full min-w-0 gap-1 overflow-x-auto sm:w-auto" role="tablist" aria-label="Filter by country">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold transition",
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary))]"
                      : "border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "all" ? "All ports" : COUNTRY_LABEL[f]}
                  <span className={cn("tabular rounded-full px-1.5 py-0.5 text-[10px] font-bold", filter === f ? "bg-white/20" : "bg-muted text-foreground/70")}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ports.map((p) => (
              <PortCard key={p.id} port={p} now={now} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
