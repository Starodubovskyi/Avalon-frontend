"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { mockData } from "@/components/shared/mockData";
import MainLayout from "@/components/layout/MainLayout";

// ==== Карточки-виджеты ====
const SummaryCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {mockData.summary.map((card, i) => (
      <div
        key={i}
        className="
          rounded-2xl border bg-white p-6 shadow-md
          dark:bg-[#18181b] dark:border-white/10 dark:shadow-[0_6px_20px_rgba(0,0,0,0.35)]
        "
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">{card.title}</div>
        <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {card.value}
        </div>
      </div>
    ))}
  </div>
);

const DealsWonChart: React.FC = () => (
  <div className="
      rounded-2xl border bg-white p-6 shadow-md
      dark:bg-[#18181b] dark:border-white/10
    ">
    <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
      Won deals (last 12 months)
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mockData.dealsWonLast12Months} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e2e33" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} stroke="#2e2e33" />
        <YAxis tick={{ fill: "#9ca3af" }} stroke="#2e2e33" />
        <Tooltip />
        <Line type="monotone" dataKey="won" stroke="#9ca3af" activeDot={{ r: 7 }} />
        <Line type="monotone" dataKey="closed" stroke="#d1d5db" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const DealsProjectionChart: React.FC = () => (
  <div className="
      rounded-2xl border bg-white p-6 shadow-md
      dark:bg-[#18181b] dark:border-white/10
    ">
    <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
      Deals projection (future 12 months)
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mockData.dealsProjection} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2e2e33" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} stroke="#2e2e33" />
        <YAxis tick={{ fill: "#9ca3af" }} stroke="#2e2e33" />
        <Tooltip />
        <Line type="monotone" dataKey="projected" stroke="#d1d5db" activeDot={{ r: 7 }} />
        <Line type="monotone" dataKey="dealsDue" stroke="#9ca3af" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const SalesPipelineChart: React.FC = () => {
  const COLORS = ["#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#e5e7eb"];
  return (
    <div className="
        rounded-2xl border bg-white p-6 shadow-md h-full flex flex-col
        dark:bg-[#18181b] dark:border-white/10
      ">
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Sales pipeline</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={mockData.salesPipeline} cx="50%" cy="50%" outerRadius={84} dataKey="value">
              {mockData.salesPipeline.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DealLossReasonsChart: React.FC = () => {
  const COLORS = ["#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151"];
  return (
    <div className="
        rounded-2xl border bg-white p-6 shadow-md h-full flex flex-col
        dark:bg-[#18181b] dark:border-white/10
      ">
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Deal loss reasons</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={mockData.dealLossReasons} cx="50%" cy="50%" innerRadius={58} outerRadius={84} dataKey="value">
              {mockData.dealLossReasons.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const FilterPanel: React.FC = () => (
  <div className="
      w-64 rounded-2xl border p-6 shadow-md
      bg-white dark:bg-[#161618] dark:border-white/10
    ">
    <div className="mb-4 flex items-center justify-between">
      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report date</span>
      <button className="p-1 text-gray-500 dark:text-gray-400">
        <ChevronDown />
      </button>
    </div>

    <div className="mb-4 grid grid-cols-2 gap-2">
      <input
        type="date"
        className="
          rounded-lg border px-2 py-2
          bg-white border-gray-300 text-gray-800
          dark:bg-[#232327] dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500
          focus:outline-none focus:border-gray-400
        "
        defaultValue="2024-01-01"
      />
      <input
        type="date"
        className="
          rounded-lg border px-2 py-2
          bg-white border-gray-300 text-gray-800
          dark:bg-[#232327] dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500
          focus:outline-none focus:border-gray-400
        "
        defaultValue="2025-05-31"
      />
    </div>

    {[
      "Deal Owner",
      "Deal Stage",
      "Pipeline",
      "Deal Label",
    ].map((label) => (
      <div key={label} className="mb-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</span>
        <select
          className="
            mt-1 w-full rounded-lg border px-2 py-2
            bg-white border-gray-300 text-gray-800
            dark:bg-[#232327] dark:border-gray-600 dark:text-gray-200
            focus:outline-none focus:border-gray-400
          "
        >
          <option>All</option>
          <option>{label} 1</option>
          <option>{label} 2</option>
        </select>
      </div>
    ))}

    <div className="mt-6 rounded-xl bg-gray-100 p-4 text-center dark:bg-[#202024]">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Have questions?</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">Dashboard setup guide</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Book a demo</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Contact support</p>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-[#0f0f12]">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div
            className="
              w-full rounded-3xl border bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
              dark:bg-[#0f0f12] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            "
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row">
                <main className="flex-1 space-y-6">
                  <SummaryCards />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DealsWonChart />
                    <div className="flex flex-col gap-6">
                      <SalesPipelineChart />
                      <DealLossReasonsChart />
                    </div>
                  </div>
                  <DealsProjectionChart />
                </main>
                <aside className="w-full lg:w-auto">
                  <FilterPanel />
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
