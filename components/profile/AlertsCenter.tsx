"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Anchor,
  MapPin,
  CreditCard,
  Settings,
  Clock,
  Check,
} from "lucide-react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type AlertType = "vessel" | "port" | "billing" | "system";
type Severity = "critical" | "high" | "info";

export type AlertItem = {
  id: string;
  type: AlertType;
  title: string;
  meta?: string;
  severity: Severity;
  createdAt: string;
  read?: boolean;
  snoozedUntil?: string;
};

const typeIcon: Record<AlertType, JSX.Element> = {
  vessel: <Anchor size={14} />,
  port: <MapPin size={14} />,
  billing: <CreditCard size={14} />,
  system: <Settings size={14} />,
};

const sevDot: Record<Severity, string> = {
  critical: "bg-red-500 shadow-red-500/50",
  high: "bg-amber-500 shadow-amber-500/50",
  info: "bg-blue-500 shadow-blue-500/50",
};

function timeAgo(iso: string) {
  const sec = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return `${sec}s ago`;
}

export default function AlertsCenter({ userEmail }: { userEmail?: string }) {
  const storageKey = useMemo(
    () => `profileAlerts:${userEmail || "anon"}`,
    [userEmail]
  );
  const [filter, setFilter] = useState<AlertType | "all">("all");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) setAlerts(JSON.parse(raw));
    else {
      const seed: AlertItem[] = [
        {
          id: crypto.randomUUID(),
          type: "vessel",
          title: "VESSEL APL NORWAY ETA changed",
          meta: "+6h delay expected",
          severity: "high",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "billing",
          title: "Invoice #INV-1042 overdue",
          meta: "Amount: €1,240",
          severity: "critical",
          createdAt: new Date().toISOString(),
        },
      ];
      setAlerts(seed);
      localStorage.setItem(storageKey, JSON.stringify(seed));
    }
  }, [storageKey]);

  const visible = useMemo(() => {
    const now = Date.now();
    return alerts.filter((a) => {
      const snoozed = a.snoozedUntil ? new Date(a.snoozedUntil).getTime() : 0;
      return (
        (filter === "all" ? true : a.type === filter) &&
        (snoozed === 0 || snoozed <= now)
      );
    });
  }, [alerts, filter]);

  const persist = (next: AlertItem[]) => {
    setAlerts(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const markAllRead = () => persist(alerts.map((a) => ({ ...a, read: true })));
  const ack = (id: string) =>
    persist(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  const snooze = (id: string) =>
    persist(
      alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              snoozedUntil: new Date(Date.now() + 86400000).toISOString(),
            }
          : a
      )
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg",
              GRADIENT_BG
            )}
          >
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Alerts Center
            </h3>
            <p className="text-xs text-gray-500">
              {alerts.filter((a) => !a.read).length} unread
            </p>
          </div>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {["all", "vessel", "port", "billing", "system"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap",
              filter === t
                ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-md"
                : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {visible.length === 0 ? (
          <li className="text-center py-8 text-sm text-gray-400">
            No alerts right now.
          </li>
        ) : (
          visible.map((a) => (
            <li
              key={a.id}
              className={clsx(
                "group relative flex items-start gap-4 p-4 rounded-2xl border transition-all",
                a.read
                  ? "bg-gray-50/50 dark:bg-white/5 border-transparent opacity-60"
                  : "bg-white dark:bg-[#161b22] border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md"
              )}
            >
              <div className="relative shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  {typeIcon[a.type]}
                </div>
                <span
                  className={clsx(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-sm border-2 border-white dark:border-[#161b22]",
                    sevDot[a.severity]
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4
                    className={clsx(
                      "text-sm font-bold truncate pr-2",
                      a.read
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {a.title}
                  </h4>
                  <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
                {a.meta && (
                  <p className="text-xs text-gray-500 mt-0.5">{a.meta}</p>
                )}

                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!a.read && (
                    <button
                      onClick={() => ack(a.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-xs font-bold hover:bg-green-100 transition"
                    >
                      <Check size={12} /> Ack
                    </button>
                  )}
                  <button
                    onClick={() => snooze(a.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition"
                  >
                    <Clock size={12} /> Snooze
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
