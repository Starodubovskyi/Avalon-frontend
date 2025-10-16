"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaAnchor,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCog,
  FaClock,
  FaCheck,
} from "react-icons/fa";

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
  vessel: <FaAnchor className="text-sm" />,
  port: <FaMapMarkerAlt className="text-sm" />,
  billing: <FaCreditCard className="text-sm" />,
  system: <FaCog className="text-sm" />,
};

const sevDot: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  info: "bg-blue-500",
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
    if (raw) {
      setAlerts(JSON.parse(raw));
    } else {
      const seed: AlertItem[] = [
        {
          id: crypto.randomUUID(),
          type: "vessel",
          title: "VESSEL APL NORWAY ETA to Constanța changed by +6h",
          meta: "ETA Aug 26, 14:00 → 20:00",
          severity: "high",
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "port",
          title: "Port of Rotterdam congestion increased",
          meta: "Avg waiting time 9h → 12h",
          severity: "info",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "billing",
          title: "Invoice #INV-1042 is overdue",
          meta: "Amount: €1,240 — 5 days late",
          severity: "critical",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          type: "system",
          title: "New version deployed",
          meta: "Improved search & map layers",
          severity: "info",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
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
      const okType = filter === "all" ? true : a.type === filter;
      return okType && (snoozed === 0 || snoozed <= now);
    });
  }, [alerts, filter]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const persist = (next: AlertItem[]) => {
    setAlerts(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const markAllRead = () => {
    persist(alerts.map((a) => ({ ...a, read: true })));
  };

  const ack = (id: string) => {
    persist(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const snooze = (id: string, minutes = 60 * 24) => {
    const until = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    persist(
      alerts.map((a) => (a.id === id ? { ...a, snoozedUntil: until } : a))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            <FaBell />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Alerts Center
          </h3>
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All"
          />
          <FilterPill
            active={filter === "vessel"}
            onClick={() => setFilter("vessel")}
            label="Vessels"
          />
          <FilterPill
            active={filter === "port"}
            onClick={() => setFilter("port")}
            label="Ports"
          />
          <FilterPill
            active={filter === "billing"}
            onClick={() => setFilter("billing")}
            label="Billing"
          />
          <FilterPill
            active={filter === "system"}
            onClick={() => setFilter("system")}
            label="System"
          />
          {alerts.length > 0 && (
            <button
              onClick={markAllRead}
              className="ml-2 text-xs rounded-full border px-3 py-1 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5"
              type="button"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {visible.length === 0 ? (
          <li className="text-sm text-gray-500 dark:text-gray-400">
            No alerts right now.
          </li>
        ) : (
          visible.map((a) => (
            <li
              key={a.id}
              className={[
                "flex items-center gap-3 rounded-2xl border px-3 py-2",
                "border-gray-200/70 dark:border-white/10",
                a.read ? "opacity-60" : "",
              ].join(" ")}
            >
              <span className={`h-2 w-2 rounded-full ${sevDot[a.severity]}`} />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200">
                {typeIcon[a.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-gray-900 dark:text-gray-100">
                  {a.title}
                </div>
                {a.meta && (
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {a.meta}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo(a.createdAt)}
              </div>
              <div className="flex items-center gap-2 pl-2">
                {!a.read && (
                  <button
                    onClick={() => ack(a.id)}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5"
                    title="Acknowledge"
                    type="button"
                  >
                    <FaCheck /> Ack
                  </button>
                )}
                <button
                  onClick={() => snooze(a.id)}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5"
                  title="Snooze 1 day"
                  type="button"
                >
                  <FaClock /> Snooze
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "rounded-full px-3 py-1 text-xs border",
        active
          ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
          : "text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
