import Link from "next/link";
import { ArrowRight, Calculator, Clock3, Gauge, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import { localTime } from "@/components/ops/ports/portUtils";
import { COUNTRY_LABEL, type CountryCode, type PortGuide } from "@/lib/public/portGuide";
import { RequestLink } from "../RequestLink";

const COUNTRY_TINT: Record<CountryCode, string> = {
  RO: "bg-primary/10 text-primary",
  UA: "bg-stage-expected/10 text-stage-expected",
  MD: "bg-stage-roads/10 text-stage-roads",
};

export function LocalClock({ timezone, now, className }: { timezone: string; now: number | null; className?: string }) {
  const t = now === null ? null : localTime(timezone, now);
  return (
    <span className={cn("tabular", className)}>
      {t ? (
        <>
          {t.time} <span className="text-muted-foreground">{t.offset}</span>
        </>
      ) : (
        "--:--"
      )}
    </span>
  );
}

export function PortCard({ port, now }: { port: PortGuide; now: number | null }) {
  const anchor = port.id.toLowerCase();
  return (
    <article
      id={anchor}
      className="group flex min-w-0 scroll-mt-24 flex-col rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated target:ring-2 target:ring-primary"
    >
      <header className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-bold">{port.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{port.position}</span>
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", COUNTRY_TINT[port.country])}>
          {COUNTRY_LABEL[port.country]}
        </span>
      </header>

      <dl className="mx-5 grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-3 text-xs">
        <div className="min-w-0">
          <dt className="text-muted-foreground">UN/LOCODE</dt>
          <dd className="mt-0.5 font-mono text-[13px] font-semibold">{port.unlocode ?? "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Clock3 className="h-3 w-3" aria-hidden /> Local
          </dt>
          <dd className="mt-0.5 truncate text-[13px] font-semibold">
            <LocalClock timezone={port.timezone} now={now} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Gauge className="h-3 w-3" aria-hidden /> Draught*
          </dt>
          <dd className="tabular mt-0.5 text-[13px] font-semibold">≈ {port.draughtM.toFixed(1)} m</dd>
        </div>
      </dl>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <ul className="flex flex-wrap gap-1.5" aria-label="Main cargoes">
          {port.cargoes.map((c) => (
            <li key={c} className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
              {c}
            </li>
          ))}
        </ul>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {port.notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        {port.unlocode ? null : <p className="text-xs text-muted-foreground">LOCODE not confirmed — we use the terminal name in nominations.</p>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Link href={`/estimate?port=${port.id}`} className={cn(btn.secondary, "px-3")}>
            <Calculator className="h-4 w-4" aria-hidden /> Estimate
          </Link>
          <RequestLink query={`destination=${port.id}`} className={cn(btn.primary, "px-3")}>
            Request <ArrowRight className="h-4 w-4" aria-hidden />
          </RequestLink>
        </div>
      </div>
    </article>
  );
}
