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
import {
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  Users,
  Zap,
  Briefcase,
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";

import "../globals.css";

import { mockData } from "@/components/shared/mockData";

const SummaryCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {mockData.summary.map((card, index) => (
      <div
        key={index}
        className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700"
      >
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {card.title}
        </div>
        <div className="text-3xl font-bold mt-2" style={{ color: card.color }}>
          {card.value}
        </div>
      </div>
    ))}
  </div>
);

const DealsWonChart: React.FC = () => (
  <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
      Won deals (last 12 months)
    </h3>
    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#1d4ed8] mr-2"></span>
          <span>Closed value</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></span>
          <span>Won deals</span>
        </div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={mockData.dealsWonLast12Months}
        margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "gray" }}
          axisLine={{ stroke: "#e5e7eb", className: "dark:stroke-gray-700" }}
        />
        <YAxis
          tick={{ fill: "gray" }}
          axisLine={{ stroke: "#e5e7eb", className: "dark:stroke-gray-700" }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="won"
          stroke="#10b981"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="closed" stroke="#1d4ed8" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const DealsProjectionChart: React.FC = () => (
  <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
      Deals projection (future 12 months)
    </h3>
    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#1d4ed8] mr-2"></span>
          <span>Projected value</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></span>
          <span>Deals due</span>
        </div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={mockData.dealsProjection}
        margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "gray" }}
          axisLine={{ stroke: "#e5e7eb", className: "dark:stroke-gray-700" }}
        />
        <YAxis
          tick={{ fill: "gray" }}
          axisLine={{ stroke: "#e5e7eb", className: "dark:stroke-gray-700" }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#1d4ed8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="dealsDue" stroke="#10b981" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Компонент для круговой диаграммы воронки продаж
const SalesPipelineChart: React.FC = () => {
  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#ef4444",
    "#f59e0b",
    "#06b6d4",
    "#4f46e5",
  ];
  return (
    <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Sales pipeline
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={mockData.salesPipeline}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {mockData.salesPipeline.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
        {mockData.salesPipeline.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="text-gray-700 dark:text-gray-300">
              {item.name} {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент для круговой диаграммы причин проигрыша сделок
const DealLossReasonsChart: React.FC = () => {
  const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];
  return (
    <div className="bg-white dark:bg-[#1a233b] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Deal loss reasons
      </h3>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={mockData.dealLossReasons}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {mockData.dealLossReasons.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
        {mockData.dealLossReasons.map((item, index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="text-gray-700 dark:text-gray-300">
              {item.name} {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент для панели фильтров
const FilterPanel: React.FC = () => {
  return (
    <div className="w-64 p-6 bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Report date
        </span>
        <button className="text-gray-500 dark:text-gray-400 p-1">
          <ChevronDown />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <input
          type="date"
          className="p-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value="2024-01-01"
        />
        <input
          type="date"
          className="p-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value="2025-05-31"
        />
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Owner
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Owner 1</option>
            <option>Owner 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Stage
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Stage 1</option>
            <option>Stage 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Pipeline
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Pipeline 1</option>
            <option>Pipeline 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Label
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Label 1</option>
            <option>Label 2</option>
          </select>
        </div>
      </div>
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Have questions?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Dashboard setup guide
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          Book a demo
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          Contact support
        </p>
      </div>
    </div>
  );
};

// Главный компонент для страницы дашборда
const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white flex">
        <div className="flex-1 p-4 space-y-4">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <main className="flex-1 space-y-4">
              <SummaryCards />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DealsWonChart />
                <div className="flex flex-col space-y-4">
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
    </MainLayout>
  );
};

export default DashboardPage;
