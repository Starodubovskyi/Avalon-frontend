"use client";

import { useMemo } from "react";
import { compareVessels, isItemDone, isUnpaidAfterDeparture, pendingCount } from "@/lib/vessels/status";
import { DESTINATIONS, type Destination, type VesselView } from "@/lib/vessels/types";

const DAY = 86_400_000;

export interface OverviewStats {
  active: VesselView[];
  expected: number;
  roads: number;
  port: number;
  sailed30: number;
  unpaid: VesselView[];
  attention: VesselView[];
  arriving: VesselView[];
  byPort: { d: Destination; n: number }[];
  pdaMissing: number;
}

/** Board figures for the overview, derived from the same vessel list the board uses */
export function useOverviewStats(data: VesselView[] | undefined): OverviewStats {
  return useMemo(() => {
    const all = data ?? [];
    const now = Date.now();
    const active = all.filter((v) => v.stage !== "departed").sort(compareVessels);
    return {
      active,
      expected: all.filter((v) => v.stage === "expected").length,
      roads: all.filter((v) => v.stage === "at_roads").length,
      port: all.filter((v) => v.stage === "in_port").length,
      sailed30: all.filter((v) => v.departedAt && now - new Date(v.departedAt).getTime() < 30 * DAY).length,
      unpaid: all.filter(isUnpaidAfterDeparture).sort(compareVessels),
      attention: active
        .filter((v) => pendingCount(v) > 0)
        .sort((a, b) => pendingCount(b) - pendingCount(a))
        .slice(0, 8),
      arriving: all
        .filter((v) => v.stage === "expected" && v.etaSulina && new Date(v.etaSulina).getTime() < now + 3 * DAY)
        .sort((a, b) => new Date(a.etaSulina ?? 0).getTime() - new Date(b.etaSulina ?? 0).getTime()),
      byPort: DESTINATIONS.map((d) => ({ d, n: active.filter((v) => v.destination === d).length }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n),
      pdaMissing: active.filter((v) => isItemDone(v, "pdaSent") === false).length,
    };
  }, [data]);
}
