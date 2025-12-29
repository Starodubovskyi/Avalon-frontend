"use client";

import { Alert } from "./types";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconClock,
} from "@tabler/icons-react";

export default function AlertsStream({ alerts }: { alerts: Alert[] }) {
  const sorted = [...alerts].sort(
    (a, b) => Date.parse(b.tsIso) - Date.parse(a.tsIso)
  );

  return (
    <div className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
          Alerts & Exceptions
        </h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          {alerts.length}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {sorted.length === 0 && (
          <div className="flex h-20 items-center justify-center text-sm text-zinc-400">
            All systems normal.
          </div>
        )}
        {sorted.map((a) => (
          <AlertItem key={a.id} alert={a} />
        ))}
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const isCrit = alert.severity === "critical";
  const isWarn = alert.severity === "warning";

  return (
    <div className="group relative flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 transition-all hover:bg-zinc-100 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900">
      {/* Icon Indicator */}
      <div
        className={`
        mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border
        ${
          isCrit
            ? "border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400"
            : isWarn
            ? "border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
            : "border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-400"
        }
      `}
      >
        {isCrit ? (
          <IconAlertTriangle size={18} />
        ) : isWarn ? (
          <IconClock size={18} />
        ) : (
          <IconInfoCircle size={18} />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <p className="text-xs font-semibold leading-snug text-zinc-800 dark:text-zinc-200">
          {alert.message}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="uppercase tracking-wider font-bold opacity-70">
            {alert.type}
          </span>
          <span>•</span>
          <span>
            {new Date(alert.tsIso).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
