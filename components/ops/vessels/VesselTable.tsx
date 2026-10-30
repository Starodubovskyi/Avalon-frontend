"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtDateTime, fmtRelative } from "@/lib/vessels/format";
import {
  CONDITION_LABEL,
  DESTINATION_LABEL,
  TYPE_LABEL,
  userName,
  type VesselView,
} from "@/lib/vessels/types";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "./ChecklistRow";
import { VesselTypeIcon } from "./VesselTypeIcon";

function Progress({ vessel }: { vessel: VesselView }) {
  if (!vessel.checklist) return <span className="text-muted-foreground">—</span>;
  const { done, total } = vessel.checklist;
  const complete = done === total;
  return (
    <div className="flex items-center gap-2" title={`${done} of ${total} items done`}>
      <div className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-3.5 w-1.5 rounded-full", i < done ? "bg-ok" : "bg-bad/25")} />
        ))}
      </div>
      <span className={cn("tabular text-xs font-semibold", complete ? "text-ok" : "text-muted-foreground")}>
        {done}/{total}
      </span>
    </div>
  );
}

const TH = "whitespace-nowrap border-b px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]";
const TD = "border-b border-border/70 px-3 py-3.5";

export function VesselTable({ vessels, editable }: { vessels: VesselView[]; editable: boolean }) {
  const router = useRouter();
  const restricted = vessels.some((v) => v.restricted);

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-muted/60 text-left text-muted-foreground backdrop-blur">
          <tr>
            <th className={cn(TH, "sticky left-0 z-20 bg-muted pl-5")}>Vessel</th>
            <th className={TH}>Status · Destination</th>
            <th className={TH}>ETA Sulina</th>
            <th className={TH}>Arrival</th>
            <th className={TH}>In port</th>
            <th className={TH}>Departure</th>
            {restricted ? null : (
              <>
                <th className={TH}>Checklist</th>
                <th className={TH}>Done</th>
                <th className={cn(TH, "hidden 2xl:table-cell")}>Last change</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {vessels.map((v) => {
            const unpaid = isUnpaidAfterDeparture(v);
            const departed = v.stage === "departed";
            return (
              <tr
                key={v.id}
                onClick={() => router.push(`/vessels/${v.id}`)}
                title={v.updatedBy ? `Last change ${fmtRelative(v.updatedAt)} by ${userName(v.updatedBy)}` : undefined}
                className={cn(
                  "group cursor-pointer transition-colors hover:bg-accent/40",
                  unpaid && "bg-stage-unpaid/[0.05]",
                  departed && !unpaid && "[&_td]:opacity-70",
                )}
              >
                <td className={cn(TD, "sticky left-0 z-[1] bg-card pl-5 group-hover:bg-accent/40", unpaid && "bg-stage-unpaid/[0.05]")}>
                  <div className="flex items-center gap-3">
                    <VesselTypeIcon vessel={v} />
                    <div className="min-w-0">
                      <Link
                        href={`/vessels/${v.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="whitespace-nowrap font-semibold text-foreground transition hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {v.name}
                      </Link>
                      <div className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
                        {v.imo ? `IMO ${v.imo}` : "No IMO"} · {TYPE_LABEL[v.type]}
                        {v.condition ? ` · ${CONDITION_LABEL[v.condition]}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <StageBadge stage={v.stage} />
                    {unpaid ? <UnpaidBadge days={daysSince(v.departedAt)} /> : null}
                  </div>
                  <div className="mt-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground">→ {DESTINATION_LABEL[v.destination]}</div>
                </td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmtDateTime(v.etaSulina)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmtDateTime(v.arrivedAt)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmtDateTime(v.inPortAt)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmtDateTime(v.departedAt)}</td>
                {restricted ? null : (
                  <>
                    <td className={TD}>
                      <ChecklistRow vessel={v} editable={editable} />
                    </td>
                    <td className={TD}>
                      <Progress vessel={v} />
                    </td>
                    <td className={cn(TD, "hidden whitespace-nowrap text-xs text-muted-foreground 2xl:table-cell")}>
                      <div className="font-medium text-foreground/80">{fmtRelative(v.updatedAt)}</div>
                      <div className="truncate">{v.updatedBy ? userName(v.updatedBy) : ""}</div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
