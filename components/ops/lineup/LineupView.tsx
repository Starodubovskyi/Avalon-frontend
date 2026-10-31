"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Anchor, Clock3, Hourglass, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels, daysSince } from "@/lib/vessels/status";
import { fmtDate, fmtDateTime } from "@/lib/vessels/format";
import { CONDITION_LABEL, DESTINATIONS, DESTINATION_LABEL, TYPE_LABEL, type Destination, type VesselView } from "@/lib/vessels/types";
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
  const wait = waitingDays(v);
  const times: [string, string | null][] = [
    ["ETA", v.etaSulina],
    ["Arrived", v.arrivedAt],
    ["In port", v.inPortAt],
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
              {TYPE_LABEL[v.type]}
              {v.condition ? ` · ${CONDITION_LABEL[v.condition]}` : ""}
            </span>
          </span>
          <StageBadge stage={v.stage} compact />
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-2 pl-8 text-[11px]">
          {times.map(([label, iso]) => (
            <span key={label} className="min-w-0">
              <span className="block text-muted-foreground">{label}</span>
              <span className="tabular block truncate font-semibold">{iso ? fmtDate(iso) : "—"}</span>
            </span>
          ))}
          <span className="text-right">
            <span className="block text-muted-foreground">Waiting</span>
            <span className="tabular block font-semibold">{wait === null ? "—" : `${wait} d`}</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

function PortTable({ port, rows }: { port: Destination; rows: VesselView[] }) {
  const roads = rows.filter((v) => v.stage === "at_roads").length;
  const inPort = rows.filter((v) => v.stage === "in_port").length;
  const expected = rows.filter((v) => v.stage === "expected").length;
  return (
    <Panel
      title={DESTINATION_LABEL[port]}
      description={`${inPort} in port · ${roads} at Sulina roads · ${expected} expected`}
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
              <th>Vessel</th>
              <th>Condition</th>
              <th>Status</th>
              <th>ETA Sulina</th>
              <th>Arrived</th>
              <th>In port</th>
              <th className="text-right">Waiting</th>
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
                        <span className="block whitespace-nowrap text-xs text-muted-foreground">{TYPE_LABEL[v.type]}{v.imo ? ` · IMO ${v.imo}` : ""}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {v.condition ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          v.condition === "loaded" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {CONDITION_LABEL[v.condition]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={v.stage} /></td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmtDateTime(v.etaSulina)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmtDateTime(v.arrivedAt)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-[13px]">{fmtDateTime(v.inPortAt)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-3 text-right text-[13px] font-semibold">
                    {wait === null ? <span className="font-normal text-muted-foreground">—</span> : `${wait} d`}
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
  const { data, error, isLoading, mutate } = useVessels("active");
  const [port, setPort] = useState<Destination | "">("");

  const byPort = useMemo(() => {
    const active = (data ?? []).filter((v) => v.stage !== "departed").sort(compareVessels);
    return DESTINATIONS.map((d) => ({ d, rows: active.filter((v) => v.destination === d) })).filter((g) => g.rows.length);
  }, [data]);

  const all = byPort.flatMap((g) => g.rows);
  const roadsWaits = all.filter((v) => v.stage === "at_roads").map((v) => daysSince(v.arrivedAt) ?? 0);
  const avgRoads = roadsWaits.length ? (roadsWaits.reduce((a, b) => a + b, 0) / roadsWaits.length).toFixed(1) : "—";
  const loaded = all.filter((v) => v.condition === "loaded").length;
  const shown = port ? byPort.filter((g) => g.d === port) : byPort;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Line-up" subtitle="Vessels in the Sulina channel queue for each Danube port, from the live vessels board." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="In line-up" value={all.length} icon={<Ship className="h-4 w-4" />} hint={`${byPort.length} ports`} />
        <KpiTile label="At Sulina roads" value={roadsWaits.length} tone="roads" icon={<Anchor className="h-4 w-4" />} />
        <KpiTile label="Avg wait at roads" value={avgRoads} tone="expected" icon={<Hourglass className="h-4 w-4" />} hint="days since arrival" />
        <KpiTile label="Loaded / ballast" value={`${loaded} / ${all.length - loaded}`} tone="port" icon={<Clock3 className="h-4 w-4" />} />
      </div>

      {byPort.length > 1 ? (
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border bg-card p-2 shadow-card" role="tablist" aria-label="Port">
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
              {g.d ? DESTINATION_LABEL[g.d] : "All ports"}
              <span className={cn("tabular rounded-full px-1.5 text-[10px] font-bold", port === g.d ? "bg-white/20" : "bg-muted text-foreground/70")}>{g.rows.length}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading line-up…" /> : null}
      {data && !all.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState icon={<Ship className="h-7 w-7" />} title="No vessels in the line-up" text="Vessels appear here as soon as they are added to the board with a destination." />
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
