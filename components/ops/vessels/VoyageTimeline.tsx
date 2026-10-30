"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVesselMutations } from "@/lib/vessels/hooks";
import { fmtFull, fmtRelative, fromLocalInput, toLocalInput } from "@/lib/vessels/format";
import type { VesselView } from "@/lib/vessels/types";
import { TextInput } from "../ui/primitives";

type DateKey = "etaSulina" | "arrivedAt" | "inPortAt" | "departedAt";

const STEPS: { key: DateKey; label: string; hint: string }[] = [
  { key: "etaSulina", label: "ETA Sulina", hint: "Expected at Sulina" },
  { key: "arrivedAt", label: "Arrived Sulina roads", hint: "Anchored at the roads" },
  { key: "inPortAt", label: "In port", hint: "Entered the destination port" },
  { key: "departedAt", label: "Departed", hint: "Left the channel to open sea" },
];

function Step({
  vessel,
  step,
  editable,
  isLast,
}: {
  vessel: VesselView;
  step: (typeof STEPS)[number];
  editable: boolean;
  isLast: boolean;
}) {
  const { update } = useVesselMutations();
  const value = vessel[step.key];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(next: string | null) {
    setBusy(true);
    try {
      await update(vessel.id, { [step.key]: next }, `${step.label} saved`);
      setEditing(false);
    } catch {
      /* toast shown */
    } finally {
      setBusy(false);
    }
  }

  const done = !!value;
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast ? <span className={cn("absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5", done ? "bg-ok/50" : "bg-border")} aria-hidden /> : null}
      <span
        className={cn(
          "relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
          done ? "border-ok bg-ok text-white" : "border-border bg-card",
        )}
        aria-hidden
      >
        {done ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{step.label}</p>
          {editable && !editing ? (
            <button
              type="button"
              onClick={() => {
                setDraft(toLocalInput(value) || toLocalInput(new Date().toISOString()));
                setEditing(true);
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Pencil className="h-3 w-3" /> {value ? "Edit" : "Set"}
            </button>
          ) : null}
        </div>
        {editing ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TextInput type="datetime-local" value={draft} onChange={(e) => setDraft(e.target.value)} className="h-9 w-auto" />
            <button type="button" disabled={busy} onClick={() => void save(fromLocalInput(draft))} className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">
              Save
            </button>
            <button type="button" disabled={busy} onClick={() => void save(new Date().toISOString())} className="h-9 rounded-lg border px-3 text-xs font-medium hover:bg-accent">
              Now
            </button>
            {value ? (
              <button type="button" disabled={busy} onClick={() => void save(null)} className="h-9 rounded-lg border px-3 text-xs font-medium text-bad hover:bg-bad/5">
                Clear
              </button>
            ) : null}
            <button type="button" onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="tabular text-xs text-muted-foreground">
            {value ? (
              <>
                {fmtFull(value)} <span className="opacity-70">· {fmtRelative(value)}</span>
              </>
            ) : (
              step.hint
            )}
          </p>
        )}
      </div>
    </li>
  );
}

export function VoyageTimeline({ vessel, editable }: { vessel: VesselView; editable: boolean }) {
  return (
    <ol>
      {STEPS.map((step, i) => (
        <Step key={step.key} vessel={vessel} step={step} editable={editable} isLast={i === STEPS.length - 1} />
      ))}
    </ol>
  );
}
