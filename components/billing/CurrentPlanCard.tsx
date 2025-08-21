"use client";

import UpgradeButton from "./UpgradeButton";
import type { Plan, Billing } from "@/components/types/billing/plan";

export default function CurrentPlanCard({
  surfaceClass,
  plan,
  billing,
}: {
  surfaceClass: string;
  plan: Plan;
  billing: Billing;
}) {
  const price = billing === "monthly" ? plan.monthly : plan.yearly;

  return (
    <div className={`${surfaceClass} p-5 sm:p-6`}>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Subscription Overview
      </h3>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium dark:bg-emerald-500/10 dark:text-emerald-300">
            {plan.name}
          </div>
          <div className="mt-3 text-3xl font-semibold">
            ${price}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400">
              {" "}
              / {billing === "monthly" ? "Month" : "Year"}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.tagline}</p>
        </div>

        <UpgradeButton />
      </div>
    </div>
  );
}
