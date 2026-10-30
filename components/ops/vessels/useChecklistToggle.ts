"use client";

import { useCallback, useState } from "react";
import { useVesselMutations } from "@/lib/vessels/hooks";
import { CHECKLIST } from "@/lib/vessels/status";
import type { ChecklistKey, T1Status, VesselInput, VesselView } from "@/lib/vessels/types";

const T1_CYCLE: Record<string, T1Status> = {
  null: "yes",
  no: "yes",
  yes: "not_needed",
  not_needed: "no",
};

export function nextChecklistInput(v: VesselView, key: ChecklistKey): VesselInput {
  switch (key) {
    case "prearrivalsIn":
      return { prearrivalsIn: v.prearrivalsIn === "ok" ? "not_ok" : "ok" };
    case "prearrivalsOut":
      return { prearrivalsOut: v.prearrivalsOut === "ok" ? "not_ok" : "ok" };
    case "t1":
      return { t1: T1_CYCLE[String(v.t1)] };
    default:
      return { [key]: v[key] !== true } as VesselInput;
  }
}

/** One toggle in flight per vessel+item; failures surface as a toast from the mutation hook */
export function useChecklistToggle() {
  const { update } = useVesselMutations();
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const toggle = useCallback(
    async (v: VesselView, key: ChecklistKey) => {
      const id = `${v.id}:${key}`;
      setBusy((b) => ({ ...b, [id]: true }));
      try {
        await update(v.id, nextChecklistInput(v, key));
      } catch {
        /* toast already shown */
      } finally {
        setBusy((b) => {
          const next = { ...b };
          delete next[id];
          return next;
        });
      }
    },
    [update],
  );

  const isBusy = useCallback((v: VesselView, key: ChecklistKey) => !!busy[`${v.id}:${key}`], [busy]);

  return { toggle, isBusy, items: CHECKLIST };
}
