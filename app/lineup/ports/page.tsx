"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo } from "react";
import StandardPortsHeader from "@/components/lineup/ports/StandardPortsHeader";
import StandardPortsSearch from "@/components/lineup/ports/StandardPortsSearch";
const StandardPortsMapLeaflet = dynamic(
  () => import("@/components/lineup/ports/StandardPortsMapLeaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full rounded-2xl border border-neutral-200/70 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60" />
    ),
  }
);

import StandardPortsTable from "@/components/lineup/ports/StandardPortsTable";
import MapControls from "@/components/lineup/ports/MapControls";
import StatsBar from "@/components/lineup/ports/StatsBar";
import { PORTS } from "@/components/lineup/ports/mockPorts";
import { usePortsStore } from "@/components/lineup/ports/state";
import { filterByAll } from "@/components/lineup/ports/utils";
import dynamic from "next/dynamic";

export default function PortsClient() {
  const {
    q,
    setQ,
    selectedId,
    setSelectedId,
    sortKey,
    sortDir,
    setSort,
    status,
    radius,
    density,
    setTableFocusIndex,
  } = usePortsStore();

  const filtered = useMemo(
    () => filterByAll(PORTS, q, status, radius),
    [q, status, radius]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const ev = new CustomEvent("focus-ports-search");
        window.dispatchEvent(ev);
      }
      if (e.key === "ArrowDown") setTableFocusIndex("next");
      if (e.key === "ArrowUp") setTableFocusIndex("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTableFocusIndex]);

  function handleSelect(id: string) {
    setSelectedId(id);
    const p = PORTS.find((x) => x.id === id);
    if (p) setQ(p.name);
  }

  return (
    <MainLayout>
      <main className="min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="w-full px-4 py-6 md:px-6">
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_600px]">
            <div className="min-w-0">
              <div className="flex items-start justify-between">
                <StandardPortsHeader />
              </div>
              <StatsBar ports={PORTS} />
            </div>
            <div className="min-w-[300px]">
              <StandardPortsMapLeaflet
                ports={PORTS}
                selectedId={selectedId ?? undefined}
                onSelect={handleSelect}
              />
              <div className="mt-3">
                <MapControls />
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full justify-center">
            <div className="w-full max-w-3xl">
              <StandardPortsSearch />
            </div>
          </div>

          <div className="mt-6">
            <StandardPortsTable rows={filtered} />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
