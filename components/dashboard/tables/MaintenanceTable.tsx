"use client";

import { useDashboardStore } from "../store";

export default function MaintenanceTable() {
  const { maintenance, vessels, searchQuery } = useDashboardStore();
  const rows = maintenance
    .map((m) => ({ ...m, vessel: vessels.find((v) => v.id === m.vesselId) }))
    .filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        r.vessel?.name.toLowerCase().includes(q) ||
        r.job.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => Date.parse(a.dueIso) - Date.parse(b.dueIso));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm opacity-70">Maintenance</div>
        <div className="text-xs opacity-60">{rows.length} items</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr className="text-left">
              <Th>Vessel</Th>
              <Th>Job</Th>
              <Th>Type</Th>
              <Th>Due</Th>
              <Th>Status</Th>
              <Th>Overdue</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                <Td>{r.vessel?.name}</Td>
                <Td>{r.job}</Td>
                <Td>{r.type}</Td>
                <Td>{new Date(r.dueIso).toLocaleString()}</Td>
                <Td>{r.status}</Td>
                <Td className={r.overdueHours && r.overdueHours > 0 ? "text-rose-600" : ""}>
                  {r.overdueHours ? `${r.overdueHours}h` : "-"}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm opacity-60">
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
