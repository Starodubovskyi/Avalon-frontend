"use client";

import { useDashboardStore } from "../store";

export default function VoyagesTable() {
  const { voyages, vessels, searchQuery } = useDashboardStore();
  const rows = voyages
    .map((v) => ({ ...v, vessel: vessels.find((x) => x.id === v.vesselId) }))
    .filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        r.vessel?.name.toLowerCase().includes(q) ||
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        (r.cargo || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => Date.parse(a.etaIso) - Date.parse(b.etaIso));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm opacity-70">Voyages In Progress</div>
        <div className="text-xs opacity-60">{rows.length} items</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr className="text-left">
              <Th>Vessel</Th>
              <Th>Leg</Th>
              <Th>Cargo</Th>
              <Th>ETA</Th>
              <Th>Speed</Th>
              <Th>Risk</Th>
              <Th>Delay</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                <Td>{r.vessel?.name}</Td>
                <Td>{r.from} → {r.to}</Td>
                <Td className="opacity-80">{r.cargo || "-"}</Td>
                <Td>{new Date(r.etaIso).toLocaleString()}</Td>
                <Td>{r.speed.toFixed(1)} kn</Td>
                <Td className={riskColor(r.weatherRisk)}>{r.weatherRisk}</Td>
                <Td className={r.delayHours && r.delayHours > 1 ? "text-rose-600" : ""}>
                  {r.delayHours ? `${r.delayHours}h` : "0h"}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm opacity-60">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className || ""}`}>{children}</td>;
}
function riskColor(r: "Low" | "Medium" | "High") {
  if (r === "High") return "text-rose-600";
  if (r === "Medium") return "text-amber-600";
  return "text-emerald-600";
}
