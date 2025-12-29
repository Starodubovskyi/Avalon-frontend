"use client";

import { type Billing } from "@/components/types/billing/plan";
import clsx from "clsx";

export default function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center rounded-full bg-gray-100/80 dark:bg-white/5 p-1.5 border border-gray-200 dark:border-white/5 shadow-inner">
        <button
          onClick={() => onChange("monthly")}
          className={clsx(
            "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300",
            billing === "monthly"
              ? "bg-white dark:bg-[#1e2329] text-gray-900 dark:text-white shadow-md"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange("yearly")}
          className={clsx(
            "px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300",
            billing === "yearly"
              ? "bg-white dark:bg-[#1e2329] text-gray-900 dark:text-white shadow-md"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          Yearly
        </button>
      </div>
    </div>
  );
}
