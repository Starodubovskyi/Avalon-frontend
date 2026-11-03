"use client";

import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useVesselFormat, useVesselLabels } from "@/lib/vessels/i18n";
import {
  CONDITIONS,
  DESTINATIONS,
  T1_VALUES,
  VESSEL_TYPES,
  userName,
  type VesselEventView,
} from "@/lib/vessels/types";
import { EmptyState } from "../ui/primitives";

/** Field names with a label under vessels.history.fields; anything else reads as fields.other */
const FIELDS = new Set([
  "name", "imo", "mmsi", "type", "destination", "condition", "etaSulina", "arrivedAt", "inPortAt", "departedAt",
  "prearrivalsIn", "prearrivalsOut", "mswIn", "mswOut", "pdaSent", "paid", "t1", "pilotageArranged", "pilot",
  "masterName", "masterPhone", "masterEmail", "officeName", "officePhone", "officeEmail", "portAgent", "notes",
  "lat", "lng", "positionSource", "positionAt",
]);

const DATE_FIELDS = new Set(["etaSulina", "arrivedAt", "inPortAt", "departedAt", "positionAt"]);
/** Boolean fields with their own words (vessels.history.values.<field>True / <field>False) */
const BOOL_WORDS = new Set(["pdaSent", "paid"]);

function isOneOf<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
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

export function HistoryList({
  events,
  showVessel = false,
}: {
  events: VesselEventView[];
  showVessel?: boolean;
}) {
  const t = useTranslations("vessels.history");
  const labels = useVesselLabels();
  const fmt = useVesselFormat();

  function show(field: string, value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (DATE_FIELDS.has(field) && typeof value === "string") return fmt.full(value);
    if (typeof value === "boolean") {
      const word = BOOL_WORDS.has(field) ? field : "check";
      return t(`values.${word}${value ? "True" : "False"}`);
    }
    const s = String(value);
    if (field === "prearrivalsIn" || field === "prearrivalsOut") return s === "ok" ? t("values.ok") : t("values.notOk");
    if (field === "t1" && isOneOf(T1_VALUES, s)) return labels.t1(s);
    if (field === "type" && isOneOf(VESSEL_TYPES, s)) return labels.type(s);
    if (field === "destination" && isOneOf(DESTINATIONS, s)) return labels.destination(s);
    if (field === "condition" && isOneOf(CONDITIONS, s)) return labels.condition(s);
    if (field === "positionSource") return s === "ais" ? "AIS" : t("values.sourceManual");
    return s.length > 80 ? `${s.slice(0, 80)}…` : s;
  }

  if (!events.length) {
    return <EmptyState icon={<History className="h-7 w-7" />} title={t("empty")} />;
  }
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {events.map((ev) => {
        const fields = Object.entries(ev.changes ?? {});
        return (
          <li key={ev.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" aria-hidden />
            <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
              <span className="font-semibold">{ev.user ? userName(ev.user) : t("system")}</span>
              <span className="text-muted-foreground">{t(`actions.${ev.action}`)}</span>
              {showVessel ? (
                <Link href={`/vessels/${ev.vesselId}`} className="font-medium text-primary hover:underline">
                  {ev.vesselName}
                </Link>
              ) : null}
              <time className="ml-auto text-xs text-muted-foreground" dateTime={ev.createdAt} title={fmt.full(ev.createdAt)}>
                {fmt.relative(ev.createdAt)}
              </time>
            </div>
            {ev.action === "updated" && fields.length ? (
              <ul className="mt-1.5 space-y-1">
                {fields.map(([field, change]) => (
                  <li key={field} className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-medium text-foreground">{FIELDS.has(field) ? t(`fields.${field}`) : t("fields.other")}:</span>
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
