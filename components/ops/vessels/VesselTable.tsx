"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { STAGE_META, daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
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

function Progress({ vessel }: { vessel: VesselView }) {
  if (!vessel.checklist) return <span className="text-muted-foreground">—</span>;
  const { done, total } = vessel.checklist;
  return (
    <div className="flex items-center gap-2" title={`${done} of ${total} items done`}>
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < done ? "bg-ok" : "bg-bad/30")} />
        ))}
      </div>
      <span className="tabular text-xs text-muted-foreground">
        {done}/{total}
      </span>
    </div>
  );
}

export function VesselTable({ vessels, editable }: { vessels: VesselView[]; editable: boolean }) {
  const router = useRouter();
  const restricted = vessels.some((v) => v.restricted);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-muted/80 text-left text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
          <tr className="[&>th]:whitespace-nowrap">
            <th className="sticky left-0 z-20 border-b bg-muted px-4 py-2.5 font-medium">Vessel</th>
            <th className="border-b px-3 py-2.5 font-medium">Status · Destination</th>
            <th className="border-b px-3 py-2.5 font-medium">ETA Sulina</th>
            <th className="border-b px-3 py-2.5 font-medium">Arrival</th>
            <th className="border-b px-3 py-2.5 font-medium">In port</th>
            <th className="border-b px-3 py-2.5 font-medium">Departure</th>
            {restricted ? null : (
              <>
                <th className="border-b px-3 py-2.5 font-medium">Checklist</th>
                <th className="border-b px-3 py-2.5 font-medium">Done</th>
                <th className="hidden border-b px-3 py-2.5 font-medium 2xl:table-cell">Last change</th>
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
                  "group cursor-pointer transition-colors hover:bg-accent/50",
                  unpaid && "bg-stage-unpaid/[0.07]",
                  departed && !unpaid && "text-muted-foreground",
                )}
              >
                <td
                  className={cn(
                    "sticky left-0 z-[1] border-b border-l-4 bg-card px-4 py-3 group-hover:bg-accent/50",
                    unpaid ? "border-l-stage-unpaid" : STAGE_META[v.stage].border,
                  )}
                >
                  <Link
                    href={`/vessels/${v.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="whitespace-nowrap font-semibold text-foreground hover:text-primary focus-visible:underline focus-visible:outline-none"
                  >
                    {v.name}
                  </Link>
                  <div className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
                    {v.imo ? `IMO ${v.imo}` : "IMO —"} · {TYPE_LABEL[v.type]}
                    {v.condition ? ` · ${CONDITION_LABEL[v.condition]}` : ""}
                  </div>
                </td>
                <td className="border-b px-3 py-3">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <StageBadge stage={v.stage} />
                    {unpaid ? <UnpaidBadge days={daysSince(v.departedAt)} /> : null}
                  </div>
                  <div className="mt-1 whitespace-nowrap text-xs text-muted-foreground">→ {DESTINATION_LABEL[v.destination]}</div>
                </td>
                <td className="tabular whitespace-nowrap border-b px-3 py-3 text-xs">{fmtDateTime(v.etaSulina)}</td>
                <td className="tabular whitespace-nowrap border-b px-3 py-3 text-xs">{fmtDateTime(v.arrivedAt)}</td>
                <td className="tabular whitespace-nowrap border-b px-3 py-3 text-xs">{fmtDateTime(v.inPortAt)}</td>
                <td className="tabular whitespace-nowrap border-b px-3 py-3 text-xs">{fmtDateTime(v.departedAt)}</td>
                {restricted ? null : (
                  <>
                    <td className="border-b px-3 py-3">
                      <ChecklistRow vessel={v} editable={editable} />
                    </td>
                    <td className="border-b px-3 py-3">
                      <Progress vessel={v} />
                    </td>
                    <td className="hidden whitespace-nowrap border-b px-3 py-3 text-xs text-muted-foreground 2xl:table-cell">
                      <div>{fmtRelative(v.updatedAt)}</div>
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
