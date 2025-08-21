"use client";

import { type Plan, type Billing, PLANS, getPlanById } from "@/components/types/billing/plan";


export default function BillingToggle({
  billing,
  onChange,
}: {
  billing: Billing;
  onChange: (b: Billing) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex rounded-xl bg-muted dark:bg-neutral-800 p-1">
        <button
          onClick={() => onChange("monthly")}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            billing === "monthly"
              ? "bg-background shadow-sm font-semibold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange("yearly")}
          className={`px-3 py-1.5 text-sm rounded-lg transition ${
            billing === "yearly"
              ? "bg-background shadow-sm font-semibold"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          Yearly
        </button>
      </div>
    </div>
  );
}
