"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ship,
  Calendar,
  Package,
  CloudSun,
  Users,
  FileText,
  MessageCircle,
  Wrench,
  Settings,
  Bell,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Gauge,
} from "lucide-react";

type Status = "active" | "paused" | "expired";
type Plan = "Basic" | "Pro";
type Category =
  | "Tracking"
  | "Ports"
  | "Cargo"
  | "Weather"
  | "Crew"
  | "Documents"
  | "Comms"
  | "Operations";

type Service = {
  id: number;
  name: string;
  description: string;
  icon: JSX.Element;
  action: "Open" | "Manage" | "Chat" | "Request";
  category: Category;
  status: Status;
  plan: Plan;
  usageUsed?: number;
  usageLimit?: number;
  lastSyncMin?: number;
  notifications?: boolean;
  autoSync?: boolean;
  route?: string;
};

const initialServices: Service[] = [
  {
    id: 1,
    name: "Ship Tracking",
    description: "Track vessel positions in real time",
    icon: <Ship size={20} />,
    action: "Open",
    category: "Tracking",
    status: "active",
    plan: "Pro",
    usageUsed: 57_500,
    usageLimit: 500_000,
    lastSyncMin: 14,
    notifications: true,
    autoSync: true,
    route: "/vessels",
  },
  {
    id: 2,
    name: "Port Schedule",
    description: "View upcoming port arrivals and departures",
    icon: <Calendar size={20} />,
    action: "Open",
    category: "Ports",
    status: "active",
    plan: "Basic",
    usageUsed: 320,
    usageLimit: 10_000,
    lastSyncMin: 42,
    notifications: true,
    autoSync: false,
    route: "/ports",
  },
  {
    id: 3,
    name: "Cargo Details",
    description: "See cargo manifest, photos, and descriptions",
    icon: <Package size={20} />,
    action: "Open",
    category: "Cargo",
    status: "paused",
    plan: "Basic",
    usageUsed: 120,
    usageLimit: 5_000,
    lastSyncMin: 180,
    notifications: false,
    autoSync: false,
    route: "/cargo",
  },
  {
    id: 4,
    name: "Weather at Sea",
    description: "Check route weather forecast",
    icon: <CloudSun size={20} />,
    action: "Open",
    category: "Weather",
    status: "active",
    plan: "Pro",
    usageUsed: 2_400,
    usageLimit: 50_000,
    lastSyncMin: 7,
    notifications: true,
    autoSync: true,
    route: "/weather",
  },
  {
    id: 5,
    name: "Crew Management",
    description: "Manage crew members and schedules",
    icon: <Users size={20} />,
    action: "Manage",
    category: "Crew",
    status: "active",
    plan: "Basic",
    usageUsed: 60,
    usageLimit: 2_000,
    lastSyncMin: 55,
    notifications: false,
    autoSync: false,
    route: "/crew",
  },
  {
    id: 6,
    name: "Online Documents",
    description: "Access and upload vessel documents",
    icon: <FileText size={20} />,
    action: "Open",
    category: "Documents",
    status: "active",
    plan: "Pro",
    usageUsed: 7_800,
    usageLimit: 100_000,
    lastSyncMin: 29,
    notifications: true,
    autoSync: true,
    route: "/documents",
  },
  {
    id: 7,
    name: "Messaging & Chat",
    description: "Communicate with partners and ports",
    icon: <MessageCircle size={20} />,
    action: "Chat",
    category: "Comms",
    status: "active",
    plan: "Pro",
    usageUsed: 940,
    usageLimit: 25_000,
    lastSyncMin: 2,
    notifications: true,
    autoSync: true,
    route: "/chat",
  },
  {
    id: 8,
    name: "Service Requests",
    description: "Order towing, refueling, or repairs",
    icon: <Wrench size={20} />,
    action: "Request",
    category: "Operations",
    status: "expired",
    plan: "Basic",
    usageUsed: 0,
    usageLimit: 1_000,
    lastSyncMin: 1440,
    notifications: false,
    autoSync: false,
    route: "/services/requests",
  },
];

const categoryColors: Record<Category, string> = {
  Tracking: "from-blue-500/10 to-blue-500/0",
  Ports: "from-amber-500/10 to-amber-500/0",
  Cargo: "from-emerald-500/10 to-emerald-500/0",
  Weather: "from-cyan-500/10 to-cyan-500/0",
  Crew: "from-violet-500/10 to-violet-500/0",
  Documents: "from-pink-500/10 to-pink-500/0",
  Comms: "from-indigo-500/10 to-indigo-500/0",
  Operations: "from-teal-500/10 to-teal-500/0",
};

export default function MyOnlineServices() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>(() => {
    const raw = localStorage.getItem("services:state");
    if (!raw) return initialServices;
    try {
      const saved = JSON.parse(raw) as Record<
        number,
        Pick<Service, "notifications" | "autoSync" | "status" | "plan">
      >;
      return initialServices.map((s) => ({ ...s, ...saved[s.id] }));
    } catch {
      return initialServices;
    }
  });

  const [view, setView] = useState<"grid" | "list">(
    () => (localStorage.getItem("services:view") as "grid" | "list") || "grid"
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");

  useEffect(() => {
    localStorage.setItem("services:view", view);
  }, [view]);

  useEffect(() => {
    const compact = services.reduce((acc, s) => {
      acc[s.id] = {
        notifications: s.notifications,
        autoSync: s.autoSync,
        status: s.status,
        plan: s.plan,
      };
      return acc;
    }, {} as Record<number, any>);
    localStorage.setItem("services:state", JSON.stringify(compact));
  }, [services]);

  const categories: (Category | "All")[] = [
    "All",
    "Tracking",
    "Ports",
    "Cargo",
    "Weather",
    "Crew",
    "Documents",
    "Comms",
    "Operations",
  ];

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const byCat = category === "All" ? true : s.category === category;
      const q = query.trim().toLowerCase();
      const byQ =
        q.length === 0 ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      return byCat && byQ;
    });
  }, [services, category, query]);

  const kpiActive = services.filter((s) => s.status === "active").length;
  const kpiAutomations = services.filter((s) => s.autoSync).length;
  const kpiMuted = services.filter((s) => s.notifications === false).length;
  const kpiMonthlyCost = services.reduce(
    (acc, s) => acc + (s.plan === "Pro" ? 0 : 0),
    0
  );

  const badgeByStatus: Record<Status, string> = {
    active:
      "bg-green-100 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-900/40",
    paused:
      "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-900/40",
    expired:
      "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-900/40",
  };

  const planBadge: Record<Plan, string> = {
    Basic:
      "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-white/10 dark:text-gray-200 dark:ring-white/15",
    Pro: "bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900/40",
  };

  const go = (s: Service) => {
    if (s.route) router.push(s.route);
  };

  const toggle = (id: number, key: "notifications" | "autoSync") => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: !s[key] } : s))
    );
  };

  const percent = (s: Service) =>
    s.usageUsed && s.usageLimit
      ? Math.min(100, Math.round((s.usageUsed / s.usageLimit) * 100))
      : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        My Online Services
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard title="Active services" value={kpiActive} />
        <KpiCard
          title="Automations running"
          value={kpiAutomations}
          icon={<Gauge size={16} />}
        />
        <KpiCard
          title="Muted alerts"
          value={kpiMuted}
          icon={<Bell size={16} />}
        />
        <KpiCard title="Monthly cost" value={`$${kpiMonthlyCost}`} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            className="
              w-full rounded-xl border px-3 py-2 text-sm
              bg-white border-gray-200 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-blue-500/30
              dark:bg-neutral-900/60 dark:border-white/10 dark:text-gray-100
            "
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={[
                "rounded-full px-3 py-1 text-xs border transition",
                category === c
                  ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
                  : "text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5",
              ].join(" ")}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="rounded-full border border-gray-200 p-1 dark:border-white/10">
            <button
              onClick={() => setView("grid")}
              className={[
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs",
                view === "grid"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-900/40"
                  : "text-gray-700 dark:text-gray-200",
              ].join(" ")}
              type="button"
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={[
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs",
                view === "list"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-900/40"
                  : "text-gray-700 dark:text-gray-200",
              ].join(" ")}
              type="button"
            >
              <ListIcon size={14} /> List
            </button>
          </div>

          <button
            onClick={() => router.push("/services/add")}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 text-sm font-medium shadow hover:opacity-90 active:scale-[.98] transition"
            type="button"
          >
            Add Service
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={[
                "group relative overflow-hidden rounded-2xl border p-5",
                "border-gray-200 bg-white/70 shadow transition-all hover:shadow-md hover:-translate-y-0.5",
                "dark:bg-neutral-900/60 dark:border-white/10",
              ].join(" ")}
            >
              <div
                className={[
                  "pointer-events-none absolute inset-0 bg-gradient-to-b",
                  categoryColors[s.category],
                ].join(" ")}
              />
              <div className="relative z-10 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:ring-white/15">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                      {s.name}
                    </h2>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        badgeByStatus[s.status],
                      ].join(" ")}
                    >
                      {s.status.toUpperCase()}
                    </span>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        planBadge[s.plan],
                      ].join(" ")}
                    >
                      {s.plan}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {s.description}
                  </p>
                </div>
              </div>

              {(s.usageUsed ?? 0) > 0 && (s.usageLimit ?? 0) > 0 && (
                <div className="relative z-10 mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>Usage</span>
                    <span>
                      {s.usageUsed?.toLocaleString()} /{" "}
                      {s.usageLimit?.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200/60 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                      style={{ width: `${percent(s)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="relative z-10 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-full bg-white/60 px-2 py-0.5 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                    {s.category}
                  </span>
                  <span>
                    Last sync:{" "}
                    {s.lastSyncMin && s.lastSyncMin < 60
                      ? `${s.lastSyncMin}m ago`
                      : s.lastSyncMin
                      ? `${Math.floor((s.lastSyncMin || 0) / 60)}h ago`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={!!s.notifications}
                      onChange={() => toggle(s.id, "notifications")}
                      className="peer sr-only"
                    />
                    <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 peer-checked:bg-blue-600 transition">
                      <span className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                    </span>
                    Notifications
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={!!s.autoSync}
                      onChange={() => toggle(s.id, "autoSync")}
                      className="peer sr-only"
                    />
                    <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200 peer-checked:bg-blue-600 transition">
                      <span className="absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                    </span>
                    Auto-Sync
                  </label>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex items-center gap-2">
                <button
                  onClick={() => go(s)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow hover:opacity-90 active:scale-[.98] transition dark:bg-white dark:text-black"
                  type="button"
                >
                  {s.action} <ChevronRight size={16} />
                </button>
                <button
                  onClick={() =>
                    router.push(`/services/settings?service=${s.id}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 transition dark:text-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                  type="button"
                >
                  <Settings size={16} /> Settings
                </button>
                {s.plan === "Basic" && (
                  <button
                    onClick={() => router.push("/subscriptions")}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-[.98] transition"
                    type="button"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5">
            <div className="col-span-4">Service</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status / Plan</div>
            <div className="col-span-2">Usage</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-white/10">
            {filtered.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 bg-white/70 dark:bg-neutral-900/60"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200 dark:bg-white/10 dark:ring-white/15">
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {s.name}
                      </span>
                      <span className="hidden md:inline text-xs text-gray-500 dark:text-gray-400">
                        · {s.description}
                      </span>
                    </div>
                    <div className="md:hidden mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {s.category} • {s.status} • {s.plan}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex col-span-2 items-center text-sm text-gray-700 dark:text-gray-300">
                  {s.category}
                </div>

                <div className="hidden md:flex col-span-2 items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      badgeByStatus[s.status]
                    }`}
                  >
                    {s.status}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${planBadge[s.plan]}`}
                  >
                    {s.plan}
                  </span>
                </div>

                <div className="hidden md:flex col-span-2 items-center text-sm text-gray-700 dark:text-gray-300">
                  {(s.usageUsed ?? 0).toLocaleString()} /{" "}
                  {(s.usageLimit ?? 0).toLocaleString()}
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => go(s)}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 active:scale-[.98] transition dark:bg-white dark:text-black"
                  >
                    {s.action}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/services/settings?service=${s.id}`)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-50 transition dark:text-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                  >
                    <Settings size={14} /> Settings
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon?: JSX.Element;
}) {
  return (
    <div
      className="
        rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm
        dark:bg-neutral-900/60 dark:border-white/10
      "
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
