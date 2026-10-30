"use client";

import { Check, Loader2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKLIST, isItemDone, type ChecklistItemDef } from "@/lib/vessels/status";
import { T1_LABEL, type VesselView } from "@/lib/vessels/types";
import { useChecklistToggle } from "./useChecklistToggle";

const PHASES: { id: ChecklistItemDef["phase"]; label: string }[] = [
  { id: "arrival", label: "Arrival" },
  { id: "finance", label: "Finance" },
  { id: "departure", label: "Departure" },
];

function stateText(v: VesselView, item: ChecklistItemDef, done: boolean | null): string {
  if (done === null) return "Hidden";
  if (item.key === "t1") return v.t1 ? T1_LABEL[v.t1] : "Not set";
  if (item.key === "prearrivalsIn" || item.key === "prearrivalsOut") return done ? "OK" : "NOT OK";
  if (item.key === "pdaSent") return done ? "Sent" : "Not sent";
  if (item.key === "paid") return done ? "Paid" : "Not paid";
  return done ? "Done" : "Pending";
}

/** Checklist as tiles grouped by phase; staff click a tile to switch it (red → green) */
export function ChecklistGrid({ vessel, editable }: { vessel: VesselView; editable: boolean }) {
  const { toggle, isBusy } = useChecklistToggle();
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PHASES.map((phase) => {
        const items = CHECKLIST.filter((c) => c.phase === phase.id);
        const doneCount = items.filter((c) => isItemDone(vessel, c.key)).length;
        return (
          <div key={phase.id}>
            <div className="mb-2 flex items-center justify-between px-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{phase.label}</p>
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
                    title={canClick ? `${item.hint} — click to change` : item.hint}
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
                      <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <span className={cn("shrink-0 text-xs font-bold", done ? "text-ok" : done === false ? "text-bad" : "text-muted-foreground")}>
                      {stateText(vessel, item, done)}
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
