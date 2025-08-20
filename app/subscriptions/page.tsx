"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";

import BillingToggle from "@/components/subsriptions/BillingToggle";
import CurrentPlanBar from "@/components/subsriptions/CurrentPlanBar";
import PlanGrid from "@/components/subsriptions/PlanGrid";

import {
  PLANS,
  type Billing as BillingType,
} from "@/components/types/billing/plan";
import { getCurrentSubscription } from "@/components/types/billing/subscription";

export default function Page() {
  const [billing, setBilling] = useState<BillingType>("yearly");

  const [currentPlanId, setCurrentPlanId] = useState<string>("basic");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const sub = getCurrentSubscription();
      if (sub) {
        setCurrentPlanId(sub.planId);
        setBilling(sub.billing);
        setSelectedPlanId((prev) => (prev === sub.planId ? null : prev));
      } else {
        setCurrentPlanId("basic");
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

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
            <div className="p-4 sm:p-6 lg:p-8">
              <TopProfileNavbar />
            </div>

            <div className="p-4 sm:p-6 lg:px-8 pt-0">
              <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">My Subscribes</h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a plan to unlock advanced vessel tracking and analytics.
                  </p>
                </div>

                <BillingToggle billing={billing} onChange={setBilling} />
              </div>

              <CurrentPlanBar
                plans={PLANS}
                currentPlanId={currentPlanId}
                selectedPlanId={selectedPlanId}
                billing={billing}
              />

              <PlanGrid
                plans={PLANS}
                billing={billing}
                currentPlanId={currentPlanId}
                selectedPlanId={selectedPlanId}
                onSelect={(id) => {
                  if (id !== currentPlanId) setSelectedPlanId(id);
                  else setSelectedPlanId(null);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
