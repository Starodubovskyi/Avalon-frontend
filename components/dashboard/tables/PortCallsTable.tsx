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
    const csv = [head, ...data].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `port-calls_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm opacity-70">Upcoming Port Calls</div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs dark:bg-white/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15"
          >
            Export CSV
          </button>
          <div className="text-xs opacity-60">{rows.length} items</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr className="text-left">
              <Th>Vessel</Th>
              <Th>Port</Th>
              <Th>ETA</Th>
              <Th>Agent</Th>
              <Th>Status</Th>
              <Th>Delay</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                <Td>{r.vessel?.name}</Td>
                <Td>{r.port}{r.berth ? `, ${r.berth}` : ""}</Td>
                <Td>{new Date(r.etaIso).toLocaleString()}</Td>
                <Td className="opacity-80">{r.agent || "-"}</Td>
                <Td>{r.status}</Td>
                <Td className={r.delayHours && r.delayHours > 1 ? "text-rose-600" : ""}>
                  {r.delayHours ? `${r.delayHours}h` : "0h"}
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
