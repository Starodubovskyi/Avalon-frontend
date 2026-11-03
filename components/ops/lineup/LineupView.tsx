"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Anchor, Clock3, Hourglass, Ship } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels, daysSince } from "@/lib/vessels/status";
import { useVesselFormat, useVesselLabels } from "@/lib/vessels/i18n";
import { DESTINATIONS, type Destination, type VesselView } from "@/lib/vessels/types";
import { EmptyState, ErrorBlock, KpiTile, LoadingBlock, PageHeader, Panel } from "../ui/primitives";
import { StageBadge } from "../ui/StageBadge";
import { VesselTypeIcon } from "../vessels/VesselTypeIcon";

/** Days a vessel has been waiting: in port since berthing, at roads since arrival */
function waitingDays(v: VesselView): number | null {
  if (v.stage === "in_port") return daysSince(v.inPortAt);
  if (v.stage === "at_roads") return daysSince(v.arrivedAt);
  return null;
}

/** Phone layout of one line-up row: the table does not fit 390 px */
function LineupCard({ vessel: v, position }: { vessel: VesselView; position: number }) {
  const t = useTranslations("lineup");
  const labels = useVesselLabels();
  const fmt = useVesselFormat();
  const wait = waitingDays(v);
  const times: [string, string | null][] = [
    ["ETA", v.etaSulina],
    [t("col.arrived"), v.arrivedAt],
    [t("col.inPort"), v.inPortAt],
  ];
  return (
    <li>
      <Link href={`/vessels/${v.id}`} className="block px-4 py-3.5 active:bg-accent/50">
        <div className="flex items-center gap-3">
          <span className="tabular w-5 text-xs font-bold text-muted-foreground">{position}</span>
          <VesselTypeIcon vessel={v} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{v.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {labels.type(v.type)}
              {v.condition ? ` · ${labels.condition(v.condition)}` : ""}
            </span>
          </span>
          <StageBadge stage={v.stage} compact />
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-2 pl-8 text-[11px]">
          {times.map(([label, iso]) => (
            <span key={label} className="min-w-0">
              <span className="block truncate text-muted-foreground">{label}</span>
              <span className="tabular block truncate font-semibold">{fmt.date(iso)}</span>
            </span>
          ))}
          <span className="text-right">
            <span className="block truncate text-muted-foreground">{t("col.waiting")}</span>
            <span className="tabular block font-semibold">{wait === null ? "—" : t("days", { days: wait })}</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

function PortTable({ port, rows }: { port: Destination; rows: VesselView[] }) {
  const t = useTranslations("lineup");
  const labels = useVesselLabels();
  const fmt = useVesselFormat();
  const roads = rows.filter((v) => v.stage === "at_roads").length;
  const inPort = rows.filter((v) => v.stage === "in_port").length;
  const expected = rows.filter((v) => v.stage === "expected").length;
  return (
    <Panel
      title={labels.destination(port)}
      description={t("portSummary", { inPort, roads, expected })}
      icon={<Anchor className="h-4 w-4" />}
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-border/70 border-t border-border/70 sm:hidden">
        {rows.map((v, i) => (
          <LineupCard key={v.id} vessel={v} position={i + 1} />
        ))}
      </ul>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <tr className="[&>th]:whitespace-nowrap [&>th]:px-4 [&>th]:py-2.5 [&>th]:font-semibold">
              <th>#</th>
              <th>{t("col.vessel")}</th>
              <th>{t("col.condition")}</th>
              <th>{t("col.status")}</th>
              <th>{t("col.etaSulina")}</th>
              <th>{t("col.arrived")}</th>
              <th>{t("col.inPort")}</th>
              <th className="text-right">{t("col.waiting")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => {
              const wait = waitingDays(v);
              return (
                <tr key={v.id} className="border-t border-border/70 transition hover:bg-accent/40">
                  <td className="tabular px-4 py-3 text-xs font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/vessels/${v.id}`} className="flex items-center gap-3">
                      <VesselTypeIcon vessel={v} size="sm" />
                      <span className="min-w-0">
                        <span className="block whitespace-nowrap font-semibold hover:text-primary">{v.name}</span>
                        <span className="block whitespace-nowrap text-xs text-muted-foreground">{labels.type(v.type)}{v.imo ? ` · IMO ${v.imo}` : ""}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {v.condition ? (
                      <span
                        className={cn(
                          "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          v.condition === "loaded" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {labels.condition(v.condition)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={v.stage} /></td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmt.dateTime(v.etaSulina)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmt.dateTime(v.arrivedAt)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmt.dateTime(v.inPortAt)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-right text-[13px] font-semibold">
                    {wait === null ? <span className="font-normal text-muted-foreground">—</span> : t("days", { days: wait })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** Live line-up: vessels heading to each Danube port, built from the vessels board */
export function LineupView() {
  const t = useTranslations("lineup");
  const labels = useVesselLabels();
  const format = useFormatter();
  const { data, error, isLoading, mutate } = useVessels("active");
  const [port, setPort] = useState<Destination | "">("");

  const byPort = useMemo(() => {
    const active = (data ?? []).filter((v) => v.stage !== "departed").sort(compareVessels);
    return DESTINATIONS.map((d) => ({ d, rows: active.filter((v) => v.destination === d) })).filter((g) => g.rows.length);
  }, [data]);

  const all = byPort.flatMap((g) => g.rows);
  const roadsWaits = all.filter((v) => v.stage === "at_roads").map((v) => daysSince(v.arrivedAt) ?? 0);
  const avgRoads = roadsWaits.length
    ? format.number(roadsWaits.reduce((a, b) => a + b, 0) / roadsWaits.length, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : "—";
  const loaded = all.filter((v) => v.condition === "loaded").length;
  const shown = port ? byPort.filter((g) => g.d === port) : byPort;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label={t("kpi.inLineup")} value={all.length} icon={<Ship className="h-4 w-4" />} hint={t("kpi.ports", { count: byPort.length })} />
        <KpiTile label={t("kpi.atRoads")} value={roadsWaits.length} tone="roads" icon={<Anchor className="h-4 w-4" />} />
        <KpiTile label={t("kpi.avgWait")} value={avgRoads} tone="expected" icon={<Hourglass className="h-4 w-4" />} hint={t("kpi.avgWaitHint")} />
        <KpiTile label={t("kpi.loadedBallast")} value={`${loaded} / ${all.length - loaded}`} tone="port" icon={<Clock3 className="h-4 w-4" />} />
      </div>

      {byPort.length > 1 ? (
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border bg-card p-2 shadow-card" role="tablist" aria-label={t("portTabsAria")}>
          {[{ d: "" as const, rows: all }, ...byPort].map((g) => (
            <button
              key={g.d || "all"}
              type="button"
              role="tab"
              aria-selected={port === g.d}
              onClick={() => setPort(g.d)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition",
                port === g.d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {g.d ? labels.destination(g.d) : t("allPorts")}
              <span className={cn("tabular rounded-full px-1.5 text-[10px] font-bold", port === g.d ? "bg-white/20" : "bg-muted text-foreground/70")}>{g.rows.length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
      {data && !all.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState icon={<Ship className="h-7 w-7" />} title={t("emptyTitle")} text={t("emptyText")} />
        </div>
      ) : null}
      <div className="space-y-6">
        {shown.map((g) => (
          <PortTable key={g.d} port={g.d} rows={g.rows} />
        ))}
      </div>
    </div>
  );
}
