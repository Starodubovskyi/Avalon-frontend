"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Anchor, CircleDot, Clock3, Map as MapIcon, Ship, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, displayName } from "@/lib/auth/roles";
import { useEventFeed, useVessels } from "@/lib/vessels/hooks";
import { CHECKLIST, STAGE_META, compareVessels, daysSince, isItemDone, isUnpaidAfterDeparture, pendingCount } from "@/lib/vessels/status";
import { fmtDateTime, fmtRelative } from "@/lib/vessels/format";
import { DESTINATIONS, DESTINATION_LABEL, type VesselView } from "@/lib/vessels/types";
import { EmptyState, ErrorBlock, KpiTile, LoadingBlock, Panel } from "../ui/primitives";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { HistoryList } from "../vessels/HistoryList";

const DAY = 86_400_000;

function VesselLine({ v, right }: { v: VesselView; right: React.ReactNode }) {
  return (
    <li>
      <Link href={`/vessels/${v.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", isUnpaidAfterDeparture(v) ? "bg-stage-unpaid" : STAGE_META[v.stage].dot)} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{v.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {STAGE_META[v.stage].label} → {DESTINATION_LABEL[v.destination]}
          </span>
        </span>
        <span className="shrink-0 text-right text-xs">{right}</span>
      </Link>
    </li>
  );
}

export function OverviewView() {
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, isLoading, mutate } = useVessels("all");
  const { data: feed } = useEventFeed(12);

  const stats = useMemo(() => {
    const all = data ?? [];
    const now = Date.now();
    const active = all.filter((v) => v.stage !== "departed");
    return {
      active,
      expected: all.filter((v) => v.stage === "expected").length,
      roads: all.filter((v) => v.stage === "at_roads").length,
      port: all.filter((v) => v.stage === "in_port").length,
      sailed30: all.filter((v) => v.departedAt && now - new Date(v.departedAt).getTime() < 30 * DAY).length,
      unpaid: all.filter(isUnpaidAfterDeparture).sort(compareVessels),
      attention: active.filter((v) => pendingCount(v) > 0).sort((a, b) => pendingCount(b) - pendingCount(a)).slice(0, 8),
      arriving: all
        .filter((v) => v.stage === "expected" && v.etaSulina && new Date(v.etaSulina).getTime() < now + 3 * DAY)
        .sort((a, b) => new Date(a.etaSulina ?? 0).getTime() - new Date(b.etaSulina ?? 0).getTime()),
      byPort: DESTINATIONS.map((d) => ({ d, n: active.filter((v) => v.destination === d).length })).filter((x) => x.n > 0),
      pdaMissing: active.filter((v) => isItemDone(v, "pdaSent") === false).length,
    };
  }, [data]);

  if (error && !data) return <ErrorBlock error={error} onRetry={() => void mutate()} />;
  if (isLoading && !data) return <LoadingBlock label="Loading overview…" />;

  const firstName = user?.firstName || displayName(user);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl text-white shadow-elevated">
        <Image src="/brand/hero-sea.webp" alt="" fill priority sizes="(min-width: 1280px) 1400px, 100vw" className="object-cover object-[50%_45%]" />
        <div aria-hidden className="hero-overlay absolute inset-0" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 px-6 py-8 sm:px-10 sm:py-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Avalon Shipping · Operations</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">Good day, {firstName}</h1>
            <p className="mt-2 text-sm text-white/80">
              {stats.active.length} vessels in work · {stats.arriving.length} arriving in 72 h
              {staff && stats.unpaid.length ? ` · ${stats.unpaid.length} sailed without payment` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/maps" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 shadow transition hover:bg-white/90">
              <MapIcon className="h-4 w-4" /> Fleet map
            </Link>
            <Link href="/vessels" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
              <Ship className="h-4 w-4" /> Vessels board
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile label="Expected" value={stats.expected} tone="expected" icon={<Clock3 className="h-4 w-4" />} hint={`${stats.arriving.length} within 72 h`} />
        <KpiTile label="At Sulina roads" value={stats.roads} tone="roads" icon={<Anchor className="h-4 w-4" />} />
        <KpiTile label="In port" value={stats.port} tone="port" icon={<CircleDot className="h-4 w-4" />} />
        <KpiTile label="Sailed (30 days)" value={stats.sailed30} tone="departed" icon={<Ship className="h-4 w-4" />} />
        {staff ? (
          <KpiTile label="Sailed unpaid" value={stats.unpaid.length} tone={stats.unpaid.length ? "unpaid" : "default"} icon={<TriangleAlert className="h-4 w-4" />} hint={`PDA not sent: ${stats.pdaMissing}`} />
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {staff ? (
          <Panel title="Needs attention" className="xl:col-span-2" action={<Link href="/vessels?view=attention" className="text-xs text-primary hover:underline">Open board</Link>}>
            {stats.unpaid.length === 0 && stats.attention.length === 0 ? (
              <EmptyState title="All clear" text="Every vessel in work has its checklist done and nothing sailed unpaid." />
            ) : (
              <ul className="space-y-0.5">
                {stats.unpaid.map((v) => (
                  <VesselLine key={v.id} v={v} right={<UnpaidBadge days={daysSince(v.departedAt)} />} />
                ))}
                {stats.attention.map((v) => (
                  <VesselLine
                    key={v.id}
                    v={v}
                    right={
                      <span className="text-bad" title={CHECKLIST.filter((c) => isItemDone(v, c.key) === false).map((c) => c.label).join(", ")}>
                        {pendingCount(v)} open: {CHECKLIST.filter((c) => isItemDone(v, c.key) === false).slice(0, 2).map((c) => c.short).join(", ")}
                        {pendingCount(v) > 2 ? "…" : ""}
                      </span>
                    }
                  />
                ))}
              </ul>
            )}
          </Panel>
        ) : null}

        <Panel title="Arriving in 72 h">
          {stats.arriving.length === 0 ? (
            <EmptyState title="No arrivals expected" />
          ) : (
            <ul className="space-y-0.5">
              {stats.arriving.map((v) => (
                <VesselLine key={v.id} v={v} right={<span className="tabular text-muted-foreground">{fmtDateTime(v.etaSulina)}<br />{fmtRelative(v.etaSulina)}</span>} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Vessels in work by port">
          {stats.byPort.length === 0 ? (
            <EmptyState title="No vessels in work" />
          ) : (
            <ul className="space-y-2">
              {stats.byPort.map(({ d, n }) => (
                <li key={d} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0">{DESTINATION_LABEL[d]}</span>
                  <span className="flex flex-1 flex-wrap gap-1" aria-hidden>
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className="h-3 w-3 rounded-sm bg-primary/70" />
                    ))}
                  </span>
                  <span className="tabular w-6 text-right font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {!staff ? (
          <Panel title="Vessels in work" className="xl:col-span-2">
            <ul className="space-y-0.5">
              {stats.active.sort(compareVessels).map((v) => (
                <VesselLine key={v.id} v={v} right={<StageBadge stage={v.stage} compact />} />
              ))}
            </ul>
          </Panel>
        ) : (
          <Panel title="Recent activity" className="xl:col-span-2" action={<Link href="/activity" className="text-xs text-primary hover:underline">Full log</Link>}>
            {feed ? <HistoryList events={feed} showVessel /> : <LoadingBlock />}
          </Panel>
        )}
      </div>
    </div>
  );
}
