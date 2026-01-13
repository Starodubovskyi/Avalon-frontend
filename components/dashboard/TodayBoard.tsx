"use client";

import { useMemo } from "react";
import { useDashboardStore } from "./store";
import { IconAnchor, IconTool, IconClock } from "@tabler/icons-react";

export default function TodayBoard() {
  const { portCalls, maintenance } = useDashboardStore();

  const todayCalls = useMemo(() => {
    const now = Date.now();
    const end = now + 24 * 3600 * 1000;
    return portCalls
      .filter((p) => {
        const t = Date.parse(p.etaIso);
        return t >= now && t <= end;
      })
      .sort((a, b) => Date.parse(a.etaIso) - Date.parse(b.etaIso));
  }, [portCalls]);

  const overdueMaint = maintenance.filter((m) => (m.overdueHours || 0) > 0);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-6 text-base font-bold text-zinc-900 dark:text-white">
        Today's Agenda
      </h3>

      <div className="flex flex-col gap-6">
        {/* Port Calls Section */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80">
            <IconAnchor size={14} />
            <span>Port Calls</span>
          </div>
          <div className="space-y-2">
            {todayCalls.length === 0 && (
              <EmptyState text="No port calls scheduled" />
            )}
            {todayCalls.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {p.port}
                  </span>
                  {p.berth && (
                    <span className="text-xs text-zinc-500">
                      Berth: {p.berth}
                    </span>
                  )}
                </div>
                <div className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-zinc-600 shadow-sm border border-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                  {new Date(p.etaIso).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />

        {/* Maintenance Section */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500/80 dark:text-rose-400/80">
            <IconTool size={14} />
            <span>Urgent Maintenance</span>
          </div>
          <div className="space-y-2">
            {overdueMaint.length === 0 && (
              <EmptyState text="All clear. Great job!" />
            )}
            {overdueMaint.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 dark:border-rose-900/20 dark:bg-rose-900/10"
              >
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[70%]">
                  {m.job}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <IconClock size={12} />
                  {m.overdueHours}h
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
      {text}
    </div>
  );
}
