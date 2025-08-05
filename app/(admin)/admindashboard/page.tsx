"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout"
import FilterPanel from "@/components/dashboard/FilterPanel";
import SummaryCards from "@/components/dashboard/SummaryCards";
import DealsProjectionChart from "@/components/dashboard/DealsProjectionsChart";
import DealsWonChart from "@/components/dashboard/DealsWonChart";
import DealLossReasonsChart from "@/components/dashboard/DealLossReasonsChart";

export default function AdminDashboardPage() {
  return (
    <MainLayout>

    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Admin Dashboard Overview 👋
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Welcome back! Here's a summary of your key metrics and
            administrative tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1">
              <FilterPanel />
            </div>
            <div className="md:col-span-3">
              <SummaryCards />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DealsProjectionChart />
            <DealsWonChart />
          </div>

          <div className="grid grid-cols-1">
            <DealLossReasonsChart />
          </div>
        </div>
      </main>
    </div>
    </MainLayout>
  );
}
