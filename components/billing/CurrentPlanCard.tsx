"use client";

import UpgradeButton from "./UpgradeButton";
import type { Plan, Billing } from "@/components/types/billing/plan";
import clsx from "clsx";

// Градиент
const GRADIENT_TEXT =
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";

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
    <div className={clsx(surfaceClass, "p-8 relative overflow-hidden")}>
      {/* Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        Subscription Overview
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/20 dark:border-blue-500/20 dark:text-blue-300">
            {plan.name}
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span
              className={clsx(
                "text-5xl font-extrabold tracking-tight",
                GRADIENT_TEXT
              )}
            >
              ${price}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              / {billing === "monthly" ? "Month" : "Year"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            {plan.tagline}
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <UpgradeButton />
        </div>
      </div>
    </div>
  );
}
