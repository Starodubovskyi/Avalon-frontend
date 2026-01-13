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
  Search,
  Plus,
} from "lucide-react";
import clsx from "clsx";

// --- СТИЛИ ---
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";
const CARD_CLASS =
  "rounded-[2rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300";

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
    icon: <Ship size={24} />,
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
    icon: <Calendar size={24} />,
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
    icon: <Package size={24} />,
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
    icon: <CloudSun size={24} />,
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
    icon: <Users size={24} />,
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
    icon: <FileText size={24} />,
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
    icon: <MessageCircle size={24} />,
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
    icon: <Wrench size={24} />,
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
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    paused:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const planBadge: Record<Plan, string> = {
    Basic: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
    Pro: `text-white ${GRADIENT_BG}`,
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
    <div className="w-full min-h-screen bg-[#f8f9fa] dark:bg-black px-2 py-2">
      <div
        className="
          w-full min-h-[calc(100vh-1rem)]
          rounded-[2.5rem] 
          bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl
          border border-gray-200 dark:border-white/5 
          shadow-xl shadow-black/5 dark:shadow-black/20
          p-6 sm:p-8 overflow-hidden
      "
      >
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
          My Online Services
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Active services" value={kpiActive} />
          <KpiCard
            title="Automations"
            value={kpiAutomations}
            icon={<Gauge size={18} />}
          />
          <KpiCard
            title="Muted alerts"
            value={kpiMuted}
            icon={<Bell size={18} />}
          />
          <KpiCard title="Monthly cost" value={`$${kpiMonthlyCost}`} />
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 mb-8">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="
                w-full pl-12 pr-4 py-3 rounded-full 
                bg-gray-100/50 dark:bg-white/5 border-transparent 
                focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 
                transition-all text-sm shadow-sm outline-none
                text-gray-900 dark:text-white
              "
            />
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar pb-1 w-full">
            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "rounded-full px-4 py-2 text-xs font-bold transition-all whitespace-nowrap",
                    category === c
                      ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                  )}
                  type="button"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-auto w-full xl:w-auto">
            <div className="flex p-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
              <button
                onClick={() => setView("grid")}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                  view === "grid"
                    ? "bg-white dark:bg-[#1e2329] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                  view === "list"
                    ? "bg-white dark:bg-[#1e2329] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <ListIcon size={14} /> List
              </button>
            </div>

            <button
              onClick={() => router.push("/services/add")}
              className={clsx(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-transform hover:shadow-blue-500/25",
                GRADIENT_BG
              )}
              type="button"
            >
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <div
                key={s.id}
                className={clsx(
                  CARD_CLASS,
                  "relative group overflow-hidden p-6"
                )}
              >
                {/* Background Gradient */}
                <div
                  className={clsx(
                    "absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    categoryColors[s.category]
                  )}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {s.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">
                          {s.name}
                        </h2>
                        <div className="flex gap-2">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              badgeByStatus[s.status]
                            )}
                          >
                            {s.status}
                          </span>
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              planBadge[s.plan]
                            )}
                          >
                            {s.plan}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 h-10">
                    {s.description}
                  </p>

                  {/* Usage Bar */}
                  {(s.usageUsed ?? 0) > 0 && (s.usageLimit ?? 0) > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        <span>Usage</span>
                        <span>
                          {Math.round((s.usageUsed! / s.usageLimit!) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            GRADIENT_BG
                          )}
                          style={{ width: `${percent(s)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Settings Toggles */}
                  <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-white/5 mb-4">
                    <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {s.category}
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group/toggle">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover/toggle:text-blue-500 transition-colors">
                          Notify
                        </span>
                        <div
                          className={clsx(
                            "w-8 h-4 rounded-full relative transition-colors",
                            s.notifications
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          )}
                        >
                          <div
                            className={clsx(
                              "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                              s.notifications ? "translate-x-4" : ""
                            )}
                          />
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!s.notifications}
                          onChange={() => toggle(s.id, "notifications")}
                        />
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group/toggle">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover/toggle:text-blue-500 transition-colors">
                          Sync
                        </span>
                        <div
                          className={clsx(
                            "w-8 h-4 rounded-full relative transition-colors",
                            s.autoSync
                              ? "bg-blue-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          )}
                        >
                          <div
                            className={clsx(
                              "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                              s.autoSync ? "translate-x-4" : ""
                            )}
                          />
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!s.autoSync}
                          onChange={() => toggle(s.id, "autoSync")}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => go(s)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold shadow-lg hover:opacity-90 active:scale-[.98] transition-transform"
                    >
                      {s.action} <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/services/settings?service=${s.id}`)
                      }
                      className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    {s.plan === "Basic" && (
                      <button
                        onClick={() => router.push("/subscriptions")}
                        className={clsx(
                          "px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg hover:opacity-90 transition-opacity",
                          GRADIENT_BG
                        )}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-gray-200 dark:border-white/5 overflow-hidden bg-white/50 dark:bg-[#161b22]/50 backdrop-blur-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-4">Service</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Usage</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white dark:hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                      {s.icon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {s.description}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-2 items-center">
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300">
                      {s.category}
                    </span>
                  </div>

                  <div className="hidden md:flex col-span-2 items-center gap-2">
                    <span
                      className={clsx(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        badgeByStatus[s.status]
                      )}
                    >
                      {s.status}
                    </span>
                    <span
                      className={clsx(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        planBadge[s.plan]
                      )}
                    >
                      {s.plan}
                    </span>
                  </div>

                  <div className="hidden md:flex col-span-2 flex-col justify-center gap-1">
                    <div className="text-xs font-medium text-gray-500">
                      {(s.usageUsed ?? 0).toLocaleString()} /{" "}
                      {(s.usageLimit ?? 0).toLocaleString()}
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={clsx("h-full", GRADIENT_BG)}
                        style={{ width: `${percent(s)}%` }}
                      />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => go(s)}
                      className="px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition"
                    >
                      {s.action}
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/services/settings?service=${s.id}`)
                      }
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
      className={clsx(
        "p-5 rounded-[2rem] border border-gray-200/60 dark:border-white/5",
        "bg-white/60 dark:bg-[#161b22]/60 backdrop-blur-md shadow-sm"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-full">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}
