"use client";

import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";
import BillingToggle from "@/components/subsriptions/BillingToggle";
import CurrentPlanBar from "@/components/subsriptions/CurrentPlanBar";
import PlanGrid from "@/components/subsriptions/PlanGrid";
import type { Billing, Plan } from "@/components/subsriptions/types";
import { Crown, Compass, Ship, Radar } from "lucide-react";

export default function Page() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [currentPlanId] = useState<string>("basic");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "basic",
        name: "Basic",
        tagline: "Start tracking vessels with essentials",
        icon: <Ship className="h-5 w-5" />,
        monthly: 0,
        yearly: 0,
        features: [
          { label: "Live vessel map (5 min delay)", included: true },
          { label: "Search by IMO/MMSI/Name", included: true },
          { label: "10 vessel watchlist", included: true },
          { label: "Port arrivals & departures (last 24h)", included: true },
          { label: "Basic route history (24h)", included: true },
          { label: "Email alerts (up to 3 rules)", included: true },
          { label: "Weather overlay (basic wind)", included: false },
          { label: "CSV export", included: false },
          { label: "Geofencing zones", included: false },
          { label: "Satellite AIS positions", included: false },
          { label: "Multi-user seats", included: false },
        ],
      },
      {
        id: "navigator",
        name: "Navigator",
        tagline: "Deeper visibility for individuals",
        icon: <Compass className="h-5 w-5" />,
        monthly: 19,
        yearly: 190,
        features: [
          { label: "Live vessel map (near real-time)", included: true },
          { label: "Advanced filters & saved searches", included: true },
          { label: "100 vessel watchlist", included: true },
          { label: "Port calls & schedule insights", included: true },
          { label: "Route history (7 days)", included: true },
          { label: "Email & push alerts (20 rules)", included: true },
          { label: "Weather overlay (wind, waves)", included: true },
          { label: "CSV export", included: true },
          { label: "Geofencing zones", included: false },
          { label: "Satellite AIS positions", included: false },
          { label: "Multi-user seats", included: false },
        ],
      },
      {
        id: "fleet-pro",
        name: "Fleet Pro",
        tagline: "Operational tools for teams",
        icon: <Radar className="h-5 w-5" />,
        monthly: 49,
        yearly: 490,
        highlight: true,
        features: [
          { label: "Live vessel map (near real-time)", included: true },
          { label: "Advanced filters & saved searches", included: true },
          { label: "Unlimited vessel watchlist", included: true },
          { label: "Port calls, ETAs, turnaround analytics", included: true },
          { label: "Route history (90 days)", included: true },
          { label: "Email & push alerts (100 rules)", included: true },
          { label: "Weather overlays (wind, waves, currents)", included: true },
          { label: "CSV/Excel export & scheduled reports", included: true },
          { label: "Geofencing zones & breach alerts", included: true },
          { label: "Satellite AIS add-on (pay-as-you-go)", included: true },
          { label: "Multi-user seats (up to 5)", included: true },
        ],
      },
      {
        id: "enterprise",
        name: "Maritime Enterprise",
        tagline: "Full-scale maritime monitoring",
        icon: <Crown className="h-5 w-5" />,
        monthly: 129,
        yearly: 1290,
        features: [
          { label: "Live vessel map (priority updates)", included: true },
          { label: "Custom dashboards & analytics", included: true },
          { label: "Unlimited watchlists & geofences", included: true },
          { label: "Full route history (365 days+)", included: true },
          { label: "Enterprise alerts & notifications", included: true },
          { label: "Premium weather layers", included: true },
          { label: "Bulk exports & scheduled reports", included: true },
          { label: "Satellite AIS included", included: true },
          { label: "Multi-user seats (unlimited)", included: true },
          { label: "Dedicated account manager", included: true },
        ],
      },
    ],
    []
  );

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div
            className="
              w-full
              rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
              dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            "
          >
            {/* Header (как в примере) */}
            <div className="p-4 sm:p-6 lg:p-8">
              <TopProfileNavbar />
            </div>

            {/* Контент подписок */}
            <div className="p-4 sm:p-6 lg:p-8 pt-0">
              <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">My Subscribes</h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a plan to unlock advanced vessel tracking and
                    analytics.
                  </p>
                </div>

                <BillingToggle billing={billing} onChange={setBilling} />
              </div>

              <CurrentPlanBar
                plans={plans}
                currentPlanId={currentPlanId}
                selectedPlanId={selectedPlanId}
                billing={billing}
              />

              <PlanGrid
                plans={plans}
                billing={billing}
                currentPlanId={currentPlanId}
                selectedPlanId={selectedPlanId}
                onSelect={(id) => {
                  if (id !== currentPlanId) setSelectedPlanId(id);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
