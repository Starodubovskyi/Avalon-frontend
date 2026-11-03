"use client";

import { Check, Loader2, Minus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isItemDone, type ChecklistItemDef } from "@/lib/vessels/status";
import { useVesselLabels, type ChecklistPhase } from "@/lib/vessels/i18n";
import type { VesselView } from "@/lib/vessels/types";
import { useChecklistToggle } from "./useChecklistToggle";

const PHASES: ChecklistPhase[] = ["arrival", "finance", "departure"];

/** Key under vessels.checklistState for the tile's right-hand status word */
function stateKey(item: ChecklistItemDef, done: boolean | null): string {
  if (done === null) return "hidden";
  if (item.key === "prearrivalsIn" || item.key === "prearrivalsOut") return done ? "ok" : "notOk";
  if (item.key === "pdaSent") return done ? "sent" : "notSent";
  if (item.key === "paid") return done ? "paid" : "notPaid";
  return done ? "done" : "pending";
}

/** Checklist as tiles grouped by phase; staff click a tile to switch it (red → green) */
export function ChecklistGrid({ vessel, editable }: { vessel: VesselView; editable: boolean }) {
  const t = useTranslations("vessels.checklistState");
  const labels = useVesselLabels();
  const { toggle, isBusy, items: all } = useChecklistToggle();
  const stateText = (item: ChecklistItemDef, done: boolean | null) => {
    if (done !== null && item.key === "t1") return vessel.t1 ? labels.t1(vessel.t1) : t("notSet");
    return t(stateKey(item, done));
  };
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PHASES.map((phase) => {
        const items = all.filter((c) => c.phase === phase);
        const doneCount = items.filter((c) => isItemDone(vessel, c.key)).length;
        return (
          <div key={phase} className="min-w-0">
            <div className="mb-2 flex items-center justify-between px-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{labels.phase(phase)}</p>
              <span className={cn("tabular text-[11px] font-bold", doneCount === items.length ? "text-ok" : "text-muted-foreground")}>
                {doneCount}/{items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const done = isItemDone(vessel, item.key);
                const busy = isBusy(vessel, item.key);
                const Icon = busy ? Loader2 : done === null ? Minus : done ? Check : X;
                const canClick = editable && done !== null && !busy;
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={!canClick}
                    onClick={() => void toggle(vessel, item.key)}
                    aria-pressed={done === true}
                    title={canClick ? t("clickToChange", { hint: item.hint }) : item.hint}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                      done ? "border-ok/25 bg-ok/[0.06]" : done === false ? "border-bad/25 bg-bad/[0.05]" : "bg-muted",
                      canClick ? "cursor-pointer hover:-translate-y-px hover:shadow-card" : "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                        done ? "bg-ok" : done === false ? "bg-bad" : "bg-muted-foreground/40",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", busy && "animate-spin")} strokeWidth={3} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <span className={cn("shrink-0 text-xs font-bold", done ? "text-ok" : done === false ? "text-bad" : "text-muted-foreground")}>
                      {stateText(item, done)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
