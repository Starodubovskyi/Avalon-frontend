import { useFormatter, useTranslations } from "next-intl";
import { Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { StageBadge } from "@/components/ops/ui/StageBadge";
import type { VesselStage } from "@/lib/vessels/types";
import { ChecklistChip } from "../../brand/ChecklistChip";
import { MockMap, PointCard } from "../shot/MockMap";

const CHECKS = ["PRE IN", "MSW IN", "T1", "PILOT", "PDA", "PAID"];

const BOARD_ROWS: { name: string; route: "seaGlory" | "keremcan" | "bmi"; stage: VesselStage; done: boolean[]; live?: boolean }[] = [
  { name: "SEA GLORY", route: "seaGlory", stage: "expected", done: [true, true, true, true, true, true], live: true },
  { name: "KEREMCAN", route: "keremcan", stage: "at_roads", done: [true, true, true, false, false, false] },
  { name: "BMI EMPEROR", route: "bmi", stage: "in_port", done: [true, true, true, true, true, false] },
];

/** Board rows with the full checklist; the first row turns green item by item */
export function BoardVisual() {
  const t = useTranslations("home");
  return (
    <ul className="space-y-2">
      {BOARD_ROWS.map((r) => (
        <li key={r.name} className={cn("rounded-xl border bg-background/60 p-3", r.live && "border-primary/25 bg-primary/[0.03]")}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold">{r.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{t(`visuals.board.${r.route}`)}</p>
            </div>
            <StageBadge stage={r.stage} className="shrink-0 px-2 py-0.5 text-[10px]" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1">
            {CHECKS.map((c, i) => (
              <ChecklistChip key={c} label={c} done={r.done[i]} flip={r.live} index={i} />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

const POINT_TYPES = [
  { key: "headOffice", cls: "from-violet-400 to-violet-700" },
  { key: "branch", cls: "from-indigo-400 to-indigo-700" },
  { key: "selfEmployed", cls: "from-teal-300 to-teal-700" },
  { key: "forSale", cls: "from-rose-300 to-rose-600" },
  { key: "authority", cls: "from-amber-300 to-amber-700" },
  { key: "private", cls: "from-emerald-300 to-emerald-700" },
] as const;

/** Fleet map tile: the map plus the six geopoint types */
export function MapVisual() {
  const t = useTranslations("home");
  return (
    <div className="flex h-full flex-col gap-3">
      {/* zoomed to the delta: Orlivka, Izmail, Tulcea and the Sulina roads */}
      <MockMap idPrefix="bento-map" viewBox="290 110 700 270" card={false} className="min-h-[220px] flex-1" />
      <ul className="flex flex-wrap gap-1.5">
        {POINT_TYPES.map((p) => (
          <li key={p.key} className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
            <span className={cn("h-2.5 w-2.5 rounded-[4px] bg-gradient-to-br", p.cls)} aria-hidden />
            {t(`visuals.pointTypes.${p.key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

const SAVED = [
  { key: "izmail", rank: 640, cls: "from-teal-300 to-teal-700" },
  { key: "reni", rank: 410, cls: "from-amber-300 to-amber-700" },
] as const;

/** Geopoint card tile: the open card plus personal favourites */
export function PointVisual() {
  const t = useTranslations("home");
  return (
    <div className="space-y-2.5">
      <PointCard large className="bg-background/60" />
      <ul className="divide-y rounded-xl border bg-background/60">
        {SAVED.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 px-3 py-2.5">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white", s.cls)}>
              <Building2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold">{t(`visuals.saved.${s.key}.name`)}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{t(`visuals.saved.${s.key}.meta`)}</span>
            </span>
            <span className="tabular shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground/80">RANK {s.rank}</span>
            <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" aria-label={t("visuals.inFavourites")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Monday to Friday of a fixed week: weekday names come from the locale */
const WEEK = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"].map((d) => new Date(`${d}T12:00:00Z`));

/** Bars on a 10-column week grid: two columns per day */
const LINEUP: { name: string; port: string; bar: string; tone: string }[] = [
  { name: "SEA GLORY", port: "Reni", bar: "col-start-3 col-span-4", tone: "bg-stage-expected" },
  { name: "KARANFIL", port: "Brăila", bar: "col-start-4 col-span-5", tone: "bg-stage-expected/70" },
  { name: "KEREMCAN", port: "Reni", bar: "col-start-1 col-span-4", tone: "bg-stage-roads" },
  { name: "BMI EMPEROR", port: "Izmail", bar: "col-start-1 col-span-7", tone: "bg-stage-port" },
];

const LEGEND: { stage: VesselStage; dot: string }[] = [
  { stage: "expected", dot: "bg-stage-expected" },
  { stage: "at_roads", dot: "bg-stage-roads" },
  { stage: "in_port", dot: "bg-stage-port" },
];

/** Line-up tile: arrivals and berth windows across the week */
export function LineupVisual() {
  const tc = useTranslations("common");
  const format = useFormatter();
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-2">
        <span />
        <div className="grid grid-cols-5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {WEEK.map((d) => (
            <span key={d.toISOString()}>{format.dateTime(d, { weekday: "short" })}</span>
          ))}
        </div>
      </div>
      <ul className="mt-2 space-y-2">
        {LINEUP.map((l) => (
          <li key={l.name} className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-2">
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-bold">{l.name}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{l.port}</span>
            </span>
            <span className="relative grid h-6 grid-cols-10 rounded-md bg-muted">
              <span className={cn("rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]", l.bar, l.tone)} />
            </span>
          </li>
        ))}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-[10px] font-medium text-muted-foreground">
        {LEGEND.map((l) => (
          <li key={l.stage} className="flex items-center gap-1.5">
            <span className={cn("h-2 w-2 rounded-full", l.dot)} aria-hidden />
            {tc(`stage.${l.stage}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
