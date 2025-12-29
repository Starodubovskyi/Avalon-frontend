"use client";

import { useDashboardStore } from "../store";

export default function PortCallsTable() {
  const { portCalls, vessels, searchQuery } = useDashboardStore();
  const rows = portCalls
    .map((p) => ({ ...p, vessel: vessels.find((v) => v.id === p.vesselId) }))
    .filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        r.vessel?.name.toLowerCase().includes(q) ||
        r.port.toLowerCase().includes(q) ||
        (r.agent || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => Date.parse(a.etaIso) - Date.parse(b.etaIso));

  function exportCsv() {
    const head = ["Vessel", "Port", "ETA", "Agent", "Status", "Delay(h)"];
    const data = rows.map((r) => [
      r.vessel?.name || "-",
      `${r.port}${r.berth ? `, ${r.berth}` : ""}`,
      new Date(r.etaIso).toISOString(),
      r.agent || "-",
      r.status,
      r.delayHours || 0,
    ]);
    const csv = [head, ...data]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `port-calls_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Port Calls
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {rows.length} items
          </div>
          <button
            onClick={exportCsv}
            className="h-8 px-4 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white text-xs font-medium shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <Th>Vessel</Th>
              <Th>Port</Th>
              <Th>ETA</Th>
              <Th>Agent</Th>
              <Th>Status</Th>
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
                <Td>
                  {r.port}
                  {r.berth ? `, ${r.berth}` : ""}
                </Td>
                <Td className="text-gray-600 dark:text-gray-300">
                  {new Date(r.etaIso).toLocaleString()}
                </Td>
                <Td className="text-gray-500 dark:text-gray-400">
                  {r.agent || "-"}
                </Td>
                <Td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">
                    {r.status}
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
                  colSpan={6}
                  className="p-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No upcoming port calls found.
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
