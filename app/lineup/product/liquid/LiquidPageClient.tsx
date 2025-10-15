"use client";

import { useEffect } from "react";
import { LiquidHeader } from "@/components/lineup/product/liquid/LiquidHeader";
import { LiquidMap } from "@/components/lineup/product/liquid/LiquidMap";
import { LiquidSearch } from "@/components/lineup/product/liquid/LiquidSearch";
import { LiquidTable } from "@/components/lineup/product/liquid/LiquidTable";
import { LiquidPreviewDrawer } from "@/components/lineup/product/liquid/LiquidPreviewDrawer";
import { useLiquidStore } from "@/components/lineup/product/liquid/state";
import {
  filterByQueryAndSubTypes,
  withApproxPositions,
} from "@/components/lineup/product/liquid/utils";

type Chip = {
  key: string;
  label: string;
  color: "emerald" | "amber" | "rose" | "sky";
};

export default function LiquidPageClient({
  initialVessels,
  initialQuery,
  initialSubTypes,
  metrics,
  title,
  subtitle,
  chips,
}: {
  initialVessels: any[];
  initialQuery: string;
  initialSubTypes: string[];
  metrics: { total: number; inPort: number; anch: number; transit: number };
  title?: string;
  subtitle?: string;
  chips?: Chip[];
}) {
  const {
    setAll,
    vessels,
    filters,
    setFilters,
    filtered,
    setFiltered,
    hydrate,
    watchlist,
  } = useLiquidStore();

  useEffect(() => {
    const withPos = withApproxPositions(initialVessels);
    setAll(withPos);
    setFilters({ q: initialQuery, subTypes: initialSubTypes });
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let rows = filterByQueryAndSubTypes(vessels, filters.q, filters.subTypes);
    if (filters.onlyWatchlist && watchlist.size) {
      rows = rows.filter((v) => watchlist.has(String(v.id)));
    } else if (filters.onlyWatchlist) {
      rows = [];
    }
    setFiltered(rows);
  }, [filters, vessels, setFiltered, watchlist]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_520px]">
        <LiquidHeader metrics={metrics} title={title} subtitle={subtitle} />
        <LiquidMap />
      </div>

      <div className="mt-6">
        <LiquidSearch chips={chips} />
      </div>

      <div className="mt-6">
        <LiquidTable />
      </div>

      <LiquidPreviewDrawer />
    </>
  );
}
