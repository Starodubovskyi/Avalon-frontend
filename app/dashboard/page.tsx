"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useDashboardStore } from "@/components/dashboard/store";
import KpiCard from "@/components/dashboard/KpiCard";
import QuickActions from "@/components/dashboard/QuickActions";
const FleetMap = dynamic(
  ()=> import ("@/components/dashboard/FleetMap"), 
  {ssr: false})
import TodayBoard from "@/components/dashboard/TodayBoard";
import AlertsStream from "@/components/dashboard/AlertsStream";
import PortCallsTable from "@/components/dashboard/tables/PortCallsTable";
import VoyagesTable from "@/components/dashboard/tables/VoyagesTable";
import MaintenanceTable from "@/components/dashboard/tables/MaintenanceTable";
import PortCallsKanban from "@/components/dashboard/kanban/PortCallsKanban";
import CertificatesTable from "@/components/dashboard/tables/CertificatesTable";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import dynamic from "next/dynamic";

export default function Page() {
  const {
    vessels,
    portCalls,
    voyages,
    maintenance,
    alerts,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
  } = useDashboardStore();

  const onTimePct = useMemo(() => {
    const total = portCalls.length || 1;
    const onTime = portCalls.filter((p) => (p.delayHours || 0) <= 1).length;
    return Math.round((onTime / total) * 100);
  }, [portCalls]);

  const inPort = vessels.filter((v) => v.status === "In Port").length;
  const underway = vessels.filter((v) => v.status === "Underway").length;
  const anchorage = vessels.filter((v) => v.status === "Anchorage").length;
  const delaysToday = portCalls.filter((p) => (p.delayHours || 0) > 1).length;

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-2 sm:px-4 lg:px-6 py-2">
          <div className="w-full rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
                <div className="flex-1" />
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-96">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-60" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search vessels, port calls, voyages..."
                      className="w-full pl-10 pr-3 h-10 rounded-xl border border-gray-200 bg-white/80 dark:bg-white/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setFiltersOpen((s) => !s)}
                    className={clsx(
                      "h-10 px-3 rounded-xl border text-sm flex items-center gap-2",
                      "border-gray-200 bg-white dark:bg-white/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15"
                    )}
                  >
                    <IconFilter className="h-5 w-5" />
                    Filters
                  </button>
                </div>
              </div>

              {filtersOpen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <SelectChip
                    label="Status"
                    options={["All", "Underway", "In Port", "Anchorage", "Off-hire"]}
                    storeKey="status"
                  />
                  <SelectChip label="Type" options={["All", "Bulk", "Tanker", "Container", "General"]} storeKey="type" />
                  <SelectChip label="Region" options={["All", "EU", "MED", "APAC", "AMER"]} storeKey="region" />
                  <SelectChip label="Risk" options={["All", "Low", "Medium", "High"]} storeKey="risk" />
                </div>
              )}

              <QuickActions />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard title="Active Vessels" value={vessels.length} />
                <KpiCard title="Underway / In Port / Anchorage" value={`${underway} / ${inPort} / ${anchorage}`} />
                <KpiCard title="On-time ETA (7d)" value={`${onTimePct}%`} delta={onTimePct - 84} />
                <KpiCard title="Delays Today" value={delaysToday} delta={-1} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FleetMap />
                </div>
                <div className="lg:col-span-1">
                  <TodayBoard />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TabButton active={activeTab === "operations"} onClick={() => setActiveTab("operations")}>
                  Operations
                </TabButton>
                <TabButton active={activeTab === "technical"} onClick={() => setActiveTab("technical")}>
                  Technical
                </TabButton>
                <TabButton active={activeTab === "commercial"} onClick={() => setActiveTab("commercial")}>
                  Commercial
                </TabButton>
                <div className="flex-1" />
              </div>

              {activeTab === "operations" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <PortCallsKanban/>
                  <PortCallsTable />
                  <VoyagesTable />
                </div>
              )}

              {activeTab === "technical" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <MaintenanceTable />
                  <CertificatesTable/>
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="text-sm opacity-70">Certificates expiring soon</div>
                    <div className="mt-3 text-sm opacity-60">No data. Add certificates to see expiring items.</div>
                  </div>
                </div>
              )}

              {activeTab === "commercial" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="text-sm opacity-70">Charters</div>
                    <div className="mt-3 text-sm opacity-60">No active charters.</div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="text-sm opacity-70">Invoices Due</div>
                    <div className="mt-3 text-sm opacity-60">No invoices due.</div>
                  </div>
                </div>
              )}

              <AlertsStream alerts={alerts} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 h-9 rounded-lg text-sm",
        active
          ? "bg-emerald-600 text-white"
          : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15"
      )}
    >
      {children}
    </button>
  );
}

function SelectChip({
  label,
  options,
  storeKey,
}: {
  label: string;
  options: string[];
  storeKey: "status" | "type" | "region" | "risk";
}) {
  const value = useDashboardStore((s) => s.filters[storeKey]);
  const setFilters = useDashboardStore((s) => s.setFilters);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="text-sm opacity-70 min-w-16">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilters({ [storeKey]: opt })}
            className={clsx(
              "px-3 h-8 rounded-full text-xs border",
              value === opt
                ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400"
                : "border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
