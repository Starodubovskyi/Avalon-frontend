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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Voyages In Progress
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {rows.length} items
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <Th>Vessel</Th>
              <Th>Leg</Th>
              <Th>Cargo</Th>
              <Th>ETA</Th>
              <Th>Speed</Th>
              <Th>Risk</Th>
              <Th>Delay</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <Td className="font-medium text-gray-900 dark:text-gray-100">
                  {r.vessel?.name}
                </Td>
                <Td className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {r.from}
                  </span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {r.to}
                  </span>
                </Td>
                <Td className="text-gray-500 dark:text-gray-400">
                  {r.cargo || "-"}
                </Td>
                <Td className="text-gray-600 dark:text-gray-300">
                  {new Date(r.etaIso).toLocaleString()}
                </Td>
                <Td>{r.speed.toFixed(1)} kn</Td>
                <Td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskBadge(
                      r.weatherRisk
                    )}`}
                  >
                    {r.weatherRisk}
                  </span>
                </Td>
                <Td
                  className={
                    r.delayHours && r.delayHours > 1
                      ? "text-rose-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  {r.delayHours ? `${r.delayHours}h` : "0h"}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="p-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No active voyages found.
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
  return (
    <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-5 py-3 whitespace-nowrap ${className || ""}`}>
      {children}
    </td>
  );
}
function riskBadge(r: "Low" | "Medium" | "High") {
  if (r === "High")
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
  if (r === "Medium")
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
}
