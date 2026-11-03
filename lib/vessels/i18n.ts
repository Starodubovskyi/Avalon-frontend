// Translated vessel labels and dates ("vessels" namespace): swap the English *_LABEL maps, CHECKLIST and lib/vessels/format for these hooks (useVesselLabels, useStageLabel, useChecklistLabels, useVesselFormat).
import { useCallback, useMemo } from "react";
import { createFormatter, useLocale, useTimeZone, useTranslations } from "next-intl";
import { CHECKLIST, type ChecklistItemDef } from "./status";
import type { TaskUrgency } from "./tasks";
import {
  DESTINATION_LABEL,
  type Destination,
  type T1Status,
  type VesselCondition,
  type VesselStage,
  type VesselType,
} from "./types";

export type ChecklistPhase = ChecklistItemDef["phase"];

/**
 * Enum → label in the interface language; port names stay as written locally (Galați, Brăila…).
 * Stage and unpaid words come from "common" — the same keys ui/StageBadge renders — so they never drift apart.
 */
export function useVesselLabels() {
  const t = useTranslations("vessels.labels");
  const tc = useTranslations("common");
  return useMemo(
    () => ({
      stage: (s: VesselStage) => tc(`stage.${s}`),
      stageShort: (s: VesselStage) => tc(`stageShort.${s}`),
      type: (v: VesselType) => t(`type.${v}`),
      condition: (c: VesselCondition) => t(`condition.${c}`),
      t1: (v: T1Status) => t(`t1.${v}`),
      destination: (d: Destination) => DESTINATION_LABEL[d],
      phase: (p: ChecklistPhase) => t(`phase.${p}`),
      urgency: (u: TaskUrgency) => t(`urgency.${u}`),
      unpaid: (days: number | null) => (days === null ? tc("unpaid") : tc("unpaidDays", { days })),
    }),
    [t, tc],
  );
}

/** (stage, compact?) → "In port" / "Port" */
export function useStageLabel() {
  const labels = useVesselLabels();
  return useCallback((stage: VesselStage, compact = false) => (compact ? labels.stageShort(stage) : labels.stage(stage)), [labels]);
}

/** CHECKLIST with label / short / hint in the interface language (keys, order and phases unchanged) */
export function useChecklistLabels(): ChecklistItemDef[] {
  const t = useTranslations("vessels.checklist");
  return useMemo(
    () =>
      CHECKLIST.map((item) => ({
        ...item,
        label: t(`${item.key}.label`),
        short: t(`${item.key}.short`),
        hint: t(`${item.key}.hint`),
      })),
    [t],
  );
}

type DateInput = string | null | undefined;

function parse(iso: DateInput): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const DAY_MONTH = { day: "2-digit", month: "short" } as const;
const TIME = { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } as const;

/**
 * Locale-aware twins of lib/vessels/format (fmtDate, fmtDateTime, fmtFull, fmtRelative) in the configured
 * time zone. English keeps the day-first en-GB look the board always had.
 */
export function useVesselFormat() {
  const locale = useLocale();
  const timeZone = useTimeZone();
  const t = useTranslations("vessels.time");
  return useMemo(() => {
    const format = createFormatter({ locale: locale === "en" ? "en-GB" : locale, timeZone });
    return {
      date: (iso: DateInput) => {
        const d = parse(iso);
        return d ? format.dateTime(d, DAY_MONTH) : "—";
      },
      dateTime: (iso: DateInput) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { ...DAY_MONTH, ...TIME }).replace(",", "") : "—";
      },
      full: (iso: DateInput) => {
        const d = parse(iso);
        return d ? format.dateTime(d, { ...DAY_MONTH, year: "numeric", ...TIME }) : "—";
      },
      relative: (iso: DateInput, now = Date.now()) => {
        const d = parse(iso);
        if (!d) return t("never");
        if (Math.abs(now - d.getTime()) < 60_000) return t("justNow");
        return format.relativeTime(d, { now, style: "short" });
      },
    };
  }, [locale, timeZone, t]);
}
