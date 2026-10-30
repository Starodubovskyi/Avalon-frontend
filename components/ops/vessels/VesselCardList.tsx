"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { STAGE_META, daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtDate } from "@/lib/vessels/format";
import { DESTINATION_LABEL, TYPE_LABEL, type VesselView } from "@/lib/vessels/types";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "./ChecklistRow";

/** Phone layout of the board: one card per vessel, checklist wraps */
export function VesselCardList({ vessels, editable }: { vessels: VesselView[]; editable: boolean }) {
  return (
    <ul className="space-y-3">
      {vessels.map((v) => {
        const unpaid = isUnpaidAfterDeparture(v);
        return (
          <li
            key={v.id}
            className={cn(
              "rounded-xl border border-l-4 bg-card p-4 shadow-sm",
              unpaid ? "border-l-stage-unpaid bg-stage-unpaid/[0.06]" : STAGE_META[v.stage].border,
            )}
          >
            <Link href={`/vessels/${v.id}`} className="block">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.imo ? `IMO ${v.imo}` : "IMO —"} · {TYPE_LABEL[v.type]} → {DESTINATION_LABEL[v.destination]}
                  </p>
                </div>
                <StageBadge stage={v.stage} compact />
              </div>
              <dl className="tabular mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">ETA</dt>
                  <dd>{fmtDate(v.etaSulina)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Arrival</dt>
                  <dd>{fmtDate(v.arrivedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Departure</dt>
                  <dd>{fmtDate(v.departedAt)}</dd>
                </div>
              </dl>
            </Link>
            {unpaid ? <UnpaidBadge className="mt-3" days={daysSince(v.departedAt)} /> : null}
            {v.restricted ? null : (
              <div className="mt-3">
                <ChecklistRow vessel={v} editable={editable} wrap />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
