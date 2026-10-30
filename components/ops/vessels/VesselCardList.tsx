"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtDate } from "@/lib/vessels/format";
import { DESTINATION_LABEL, TYPE_LABEL, type VesselView } from "@/lib/vessels/types";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "./ChecklistRow";
import { VesselTypeIcon } from "./VesselTypeIcon";

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
              "rounded-2xl border bg-card p-4 shadow-card",
              unpaid && "border-stage-unpaid/30 bg-stage-unpaid/[0.04]",
              v.stage === "departed" && !unpaid && "opacity-80",
            )}
          >
            <Link href={`/vessels/${v.id}`} className="block">
              <div className="flex items-start gap-3">
                <VesselTypeIcon vessel={v} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold">{v.name}</p>
                    <StageBadge stage={v.stage} compact />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {v.imo ? `IMO ${v.imo}` : "No IMO"} · {TYPE_LABEL[v.type]} → {DESTINATION_LABEL[v.destination]}
                  </p>
                </div>
              </div>
              <dl className="tabular mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-2.5 text-xs">
                <div>
                  <dt className="text-muted-foreground">ETA</dt>
                  <dd className="font-semibold">{fmtDate(v.etaSulina)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Arrival</dt>
                  <dd className="font-semibold">{fmtDate(v.arrivedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Departure</dt>
                  <dd className="font-semibold">{fmtDate(v.departedAt)}</dd>
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
