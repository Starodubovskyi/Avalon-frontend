"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useMemo, useState } from "react";
import { PORTS } from "@/components/lineup/ports/mockPorts";
import {
  getPortCallsMock,
  type VesselCall,
} from "@/components/lineup/ports/detail/mockPortCalls";
import DetailHeader from "@/components/lineup/ports/detail/DetailHeader";
import DetailFilters from "@/components/lineup/ports/detail/DetailFilters";
import DetailMap from "@/components/lineup/ports/detail/DetailMap";
import DetailTable from "@/components/lineup/ports/detail/DetailTable";

export default function PortsDetailClient({ id }: { id: string }) {
  const port = PORTS.find((p) => p.id === id);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Set<VesselCall["status"]>>(new Set());
  const [types, setTypes] = useState<Set<VesselCall["vesselType"]>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<
    "name" | "status" | "vesselType" | "eta" | "cargoQty" | "waitingH"
  >("eta");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const calls = useMemo(() => getPortCallsMock(id), [id]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const byQ = !query
      ? calls
      : calls.filter((c) =>
          [
            c.name,
            String(c.imo),
            String(c.mmsi),
            c.cargo.type,
            c.cargo.grade ?? "",
            c.route.origin,
            c.route.dest,
            c.status,
            c.operation ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        );

    const byStatus = status.size
      ? byQ.filter((c) => status.has(c.status))
      : byQ;
    const byTypes = types.size
      ? byStatus.filter((c) => types.has(c.vesselType))
      : byStatus;

    const sorted = [...byTypes].sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "eta") {
        const ta = a.eta ? +new Date(a.eta) : 0;
        const tb = b.eta ? +new Date(b.eta) : 0;
        return (ta - tb) * mul;
      }
      if (sortKey === "cargoQty") {
        return ((a.cargo.qty ?? 0) - (b.cargo.qty ?? 0)) * mul;
      }
      if (sortKey === "waitingH") {
        return ((a.waitingH ?? 0) - (b.waitingH ?? 0)) * mul;
      }
      const va = String((a as any)[sortKey] ?? "");
      const vb = String((b as any)[sortKey] ?? "");
      return va.localeCompare(vb) * mul;
    });

    return sorted;
  }, [q, status, types, sortKey, sortDir, calls]);

  function toggleStatus(s: VesselCall["status"]) {
    setStatus((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }
  function toggleType(t: VesselCall["vesselType"]) {
    setTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  if (!port) {
    return (
      <MainLayout>
        <main className="min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
          <div className="px-4 py-10 md:px-6">
            <h1 className="text-2xl font-bold">Port not found</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Unknown port id: {id}
            </p>
          </div>
        </main>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="w-full px-4 py-6 md:px-6">
          <DetailHeader port={port} calls={calls} />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_560px]">
            <div className="min-w-0">
              <DetailFilters
                q={q}
                setQ={setQ}
                status={status}
                toggleStatus={toggleStatus}
                types={types}
                toggleType={toggleType}
                clearFilters={() => {
                  setQ("");
                  setStatus(new Set());
                  setTypes(new Set());
                }}
              />
              <div className="mt-6">
                <DetailTable
                  rows={filtered}
                  selectedId={selectedId ?? undefined}
                  onSelect={setSelectedId}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={(k) => {
                    if (k === sortKey)
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else {
                      setSortKey(k);
                      setSortDir("asc");
                    }
                  }}
                />
              </div>
            </div>

            <div className="min-w-[300px]">
              <DetailMap
                port={port}
                calls={filtered}
                selectedId={selectedId ?? undefined}
                onSelect={setSelectedId}
              />
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Tip: double-click a vessel in the table to center the map.
              </p>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
