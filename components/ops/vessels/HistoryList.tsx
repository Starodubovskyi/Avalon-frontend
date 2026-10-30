"use client";

import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtFull, fmtRelative } from "@/lib/vessels/format";
import {
  CONDITION_LABEL,
  DESTINATION_LABEL,
  T1_LABEL,
  TYPE_LABEL,
  userName,
  type VesselEventView,
} from "@/lib/vessels/types";
import { EmptyState } from "../ui/primitives";

const FIELD_LABEL: Record<string, string> = {
  name: "Name",
  imo: "IMO",
  mmsi: "MMSI",
  type: "Type",
  destination: "Destination",
  condition: "Condition",
  etaSulina: "ETA Sulina",
  arrivedAt: "Arrival (Sulina roads)",
  inPortAt: "Entered port",
  departedAt: "Departure",
  prearrivalsIn: "Prearrivals IN",
  prearrivalsOut: "Prearrivals OUT",
  mswIn: "MSW IN",
  mswOut: "MSW OUT",
  pdaSent: "PDA",
  paid: "Payment",
  t1: "T1",
  pilotageArranged: "Sulina pilotage",
  pilot: "Pilot",
  masterName: "Master",
  masterPhone: "Master phone",
  masterEmail: "Master email",
  officeName: "Office",
  officePhone: "Office phone",
  officeEmail: "Office email",
  portAgent: "Port agent",
  notes: "Notes",
  lat: "Latitude",
  lng: "Longitude",
  positionSource: "Position source",
  positionAt: "Position time",
};

const DATE_FIELDS = new Set(["etaSulina", "arrivedAt", "inPortAt", "departedAt", "positionAt"]);
const BOOL_TEXT: Record<string, [string, string]> = {
  pdaSent: ["sent", "not sent"],
  paid: ["paid", "not paid"],
};

function show(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (DATE_FIELDS.has(field) && typeof value === "string") return fmtFull(value);
  if (typeof value === "boolean") {
    const pair = BOOL_TEXT[field];
    return pair ? (value ? pair[0] : pair[1]) : value ? "done" : "not done";
  }
  const s = String(value);
  if (field === "prearrivalsIn" || field === "prearrivalsOut") return s === "ok" ? "OK" : "NOT OK";
  if (field === "t1") return T1_LABEL[s as keyof typeof T1_LABEL] ?? s;
  if (field === "type") return TYPE_LABEL[s as keyof typeof TYPE_LABEL] ?? s;
  if (field === "destination") return DESTINATION_LABEL[s as keyof typeof DESTINATION_LABEL] ?? s;
  if (field === "condition") return CONDITION_LABEL[s as keyof typeof CONDITION_LABEL] ?? s;
  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
}

const CHECK_FIELDS = new Set([
  "prearrivalsIn",
  "prearrivalsOut",
  "mswIn",
  "mswOut",
  "pdaSent",
  "paid",
  "t1",
  "pilotageArranged",
]);

type Tone = "good" | "bad" | "neutral";

/** Colour by meaning (done / not done), not by old/new — un-ticking payment must read red */
function toneOf(field: string, value: unknown): Tone {
  if (!CHECK_FIELDS.has(field)) return "neutral";
  return value === true || value === "ok" || value === "yes" || value === "not_needed" ? "good" : "bad";
}

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-ok/10 text-ok",
  bad: "bg-bad/10 text-bad",
  neutral: "bg-muted text-foreground",
};

const ACTION_TEXT: Record<VesselEventView["action"], string> = {
  created: "added the vessel",
  updated: "changed",
  deleted: "removed the vessel",
};

export function HistoryList({
  events,
  showVessel = false,
}: {
  events: VesselEventView[];
  showVessel?: boolean;
}) {
  if (!events.length) {
    return <EmptyState icon={<History className="h-7 w-7" />} title="No changes yet" />;
  }
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {events.map((ev) => {
        const fields = Object.entries(ev.changes ?? {});
        return (
          <li key={ev.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" aria-hidden />
            <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
              <span className="font-semibold">{userName(ev.user)}</span>
              <span className="text-muted-foreground">{ACTION_TEXT[ev.action]}</span>
              {showVessel ? (
                <Link href={`/vessels/${ev.vesselId}`} className="font-medium text-primary hover:underline">
                  {ev.vesselName}
                </Link>
              ) : null}
              <time className="ml-auto text-xs text-muted-foreground" dateTime={ev.createdAt} title={fmtFull(ev.createdAt)}>
                {fmtRelative(ev.createdAt)}
              </time>
            </div>
            {ev.action === "updated" && fields.length ? (
              <ul className="mt-1.5 space-y-1">
                {fields.map(([field, change]) => (
                  <li key={field} className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-medium text-foreground">{FIELD_LABEL[field] ?? field}:</span>
                    <span className="max-w-full break-words rounded px-1.5 py-0.5 text-muted-foreground line-through decoration-muted-foreground/50">
                      {show(field, change.from)}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                    <span className={cn("max-w-full break-words rounded px-1.5 py-0.5 font-medium", TONE_CLASS[toneOf(field, change.to)])}>
                      {show(field, change.to)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
