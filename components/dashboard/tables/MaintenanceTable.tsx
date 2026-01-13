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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Maintenance
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
              <Th>Job</Th>
              <Th>Type</Th>
              <Th>Due</Th>
              <Th>Status</Th>
              <Th>Overdue</Th>
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
                <Td className="text-gray-700 dark:text-gray-200">{r.job}</Td>
                <Td className="text-gray-500 dark:text-gray-400">{r.type}</Td>
                <Td className="text-gray-600 dark:text-gray-300">
                  {new Date(r.dueIso).toLocaleString()}
                </Td>
                <Td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                    {r.status}
                  </span>
                </Td>
                <Td
                  className={
                    r.overdueHours && r.overdueHours > 0
                      ? "text-rose-600 font-bold"
                      : "text-gray-400"
                  }
                >
                  {r.overdueHours ? `${r.overdueHours}h` : "-"}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No maintenance tasks found.
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
