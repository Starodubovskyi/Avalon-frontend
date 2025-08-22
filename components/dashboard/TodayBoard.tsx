"use client";

import { useMemo } from "react";
import { useDashboardStore } from "./store";

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
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
      <div className="text-sm opacity-70">Today Board</div>
      <div className="mt-3 space-y-4">
        <div>
          <div className="text-xs uppercase opacity-60">Port Calls Today</div>
          <div className="mt-2 space-y-2">
            {todayCalls.length === 0 && <div className="text-sm opacity-60">No port calls today.</div>}
            {todayCalls.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-white/10">
                <div className="text-sm">{p.port}{p.berth ? `, ${p.berth}` : ""}</div>
                <div className="text-xs opacity-70">{new Date(p.etaIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-60">Overdue Maintenance</div>
          <div className="mt-2 space-y-2">
            {overdueMaint.length === 0 && <div className="text-sm opacity-60">No overdue jobs.</div>}
            {overdueMaint.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-white/10">
                <div className="text-sm">{m.job}</div>
                <div className="text-xs text-rose-600">{m.overdueHours}h</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase opacity-60">Weather Risks</div>
          <div className="mt-2 text-sm opacity-60">No active weather tasks here. See Alerts.</div>
        </div>
      </div>
    </div>
  );
}
