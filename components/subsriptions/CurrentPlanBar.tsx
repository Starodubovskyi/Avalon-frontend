"use client";

import PayNowButton from "./PayNowButton";
import { type Plan, type Billing } from "@/components/types/billing/plan";
import clsx from "clsx";

export default function CurrentPlanBar({
  plans,
  currentPlanId,
  selectedPlanId,
  billing,
}: {
  plans: Plan[];
  currentPlanId: string;
  selectedPlanId: string | null;
  billing: Billing;
}) {
  const currentPlan = plans.find((p) => p.id === currentPlanId) || null;
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;

  const selectedAmount =
    selectedPlan &&
    (billing === "monthly" ? selectedPlan.monthly : selectedPlan.yearly);

  return (
    <div
      className="
        mt-8 flex flex-col gap-4 rounded-[2rem] 
        border border-gray-200 dark:border-white/5 
        bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl 
        p-5 sm:px-8 sm:py-6 shadow-xl shadow-black/5
        md:flex-row md:items-center md:justify-between
      "
    >
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Current plan:
          </span>
          <span className="font-bold text-gray-900 dark:text-white px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10">
            {currentPlan?.name ?? "—"}
          </span>
        </div>

        <span className="hidden md:inline text-gray-300 dark:text-gray-700">
          |
        </span>

        <span className="font-medium text-gray-500 dark:text-gray-400">
          Billing:{" "}
          <span className="text-gray-900 dark:text-white capitalize">
            {billing}
          </span>
        </span>

        {selectedPlan && selectedPlan.id !== currentPlanId && (
          <>
            <span className="hidden md:inline text-gray-300 dark:text-gray-700">
              |
            </span>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="font-bold">Selected: {selectedPlan.name}</span>
              {typeof selectedAmount === "number" && selectedAmount > 0 && (
                <span className="opacity-80 font-medium">
                  ${selectedAmount.toFixed(2)}/
                  {billing === "monthly" ? "mo" : "yr"}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <PayNowButton
        selectedPlan={
          selectedPlan && selectedPlan.id !== currentPlanId
            ? selectedPlan
            : null
        }
        currentPlanId={currentPlanId}
        billing={billing}
      />
    </div>
  );
}
