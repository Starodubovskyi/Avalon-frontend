import { useFormatter, useTranslations } from "next-intl";
import { Container, Fuel, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_META } from "@/lib/vessels/status";
import { StageBadge, UnpaidBadge } from "@/components/ops/ui/StageBadge";
import { ChecklistChip } from "@/components/public/brand/ChecklistChip";
import { BOARD_TABS, CHECK_LABELS, MOCK_VESSELS, type MockVessel } from "./mockData";

function VesselTile({ v }: { v: MockVessel }) {
  const Icon = v.type === "tanker" ? Fuel : Container;
  const tone = v.unpaidDays ? "bg-stage-unpaid/10 text-stage-unpaid" : cn(STAGE_META[v.stage].soft, STAGE_META[v.stage].text);
  return (
    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone)}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

/** The vessels board, rebuilt from the real badges and checklist pills */
export function MockBoard({ rows = MOCK_VESSELS.length, className }: { rows?: number; className?: string }) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const format = useFormatter();
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border bg-card shadow-card", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
          {BOARD_TABS.map((tab, i) => (
            <li
              key={tab.key}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold",
                "active" in tab ? "bg-primary text-primary-foreground" : "alert" in tab ? "text-stage-unpaid" : "text-muted-foreground",
                i > 1 && "hidden sm:flex",
                i > 3 && "sm:hidden xl:flex",
              )}
            >
              {t(`shot.tabs.${tab.key}`)}
              <span
                className={cn(
                  "tabular rounded-full px-1.5 text-[10px]",
                  "active" in tab ? "bg-white/20" : "alert" in tab ? "bg-stage-unpaid text-white" : "bg-muted",
                )}
              >
                {tab.count}
              </span>
            </li>
          ))}
        </ul>
        <span className="hidden h-7 w-36 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-2 text-[11px] text-muted-foreground md:flex">
          <Search className="h-3 w-3" aria-hidden /> <span className="truncate">{t("shot.searchBoard")}</span>
        </span>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-3 border-b bg-surface px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:grid">
        <span>{t("shot.colVessel")}</span>
        <span>{t("shot.colStatus")}</span>
        <span>{t("shot.colEta")}</span>
        <span className="w-[178px]">{t("shot.colChecklist")}</span>
      </div>

      <ul className="divide-y">
        {MOCK_VESSELS.slice(0, rows).map((v, i) => (
          <li
            key={v.name}
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto]",
              v.unpaidDays && "bg-stage-unpaid/[0.06]",
              // phones get a shorter board so the map still shows in the hero
              i > 2 && "hidden sm:grid",
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <VesselTile v={v} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{v.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {tc(`vesselType.${v.type}`)} · {tc(`condition.${v.condition}`)}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col items-end gap-1 sm:items-start">
              <div className="flex flex-wrap items-center gap-1">
                <StageBadge stage={v.stage} compact className="px-2 py-0.5 text-[10px]" />
                {v.unpaidDays ? <UnpaidBadge days={v.unpaidDays} className="hidden px-2 py-0.5 text-[10px] lg:inline-flex" /> : null}
              </div>
              <span className="hidden text-[11px] text-muted-foreground sm:block">→ {v.dest}</span>
            </div>
            <span className="tabular hidden text-[12px] text-foreground/80 sm:block">
              {format.dateTime(new Date(v.eta), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
            </span>
            <div className="hidden w-[178px] gap-1 sm:flex">
              {CHECK_LABELS.map((c, j) => (
                <ChecklistChip key={c} label={c} done={v.checks[j]} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
