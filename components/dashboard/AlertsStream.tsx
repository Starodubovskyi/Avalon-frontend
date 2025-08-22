"use client";

import { Alert } from "./types";

export default function AlertsStream({ alerts }: { alerts: Alert[] }) {
  const sorted = [...alerts].sort((a, b) => Date.parse(b.tsIso) - Date.parse(a.tsIso));
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
      <div className="text-sm opacity-70">Alerts & Exceptions</div>
      <div className="mt-3 space-y-2">
        {sorted.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-white/10">
            <SeverityBadge s={a.severity} />
            <div className="text-sm">{a.message}</div>
            <div className="ml-auto text-xs opacity-60">{new Date(a.tsIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        ))}
        {sorted.length === 0 && <div className="text-sm opacity-60">No alerts.</div>}
      </div>
    </div>
  );
}

function SeverityBadge({ s }: { s: Alert["severity"] }) {
  const cls =
    s === "critical"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
      : s === "warning"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
      : "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
  const label = s === "critical" ? "Critical" : s === "warning" ? "Warning" : "Info";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}
