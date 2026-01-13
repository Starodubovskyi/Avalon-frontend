"use client";

import { type Plan, type Billing } from "@/components/types/billing/plan";
import clsx from "clsx";

function yearlyMonthly(plan: Plan) {
  return plan.yearly > 0 ? Number((plan.yearly / 12).toFixed(2)) : 0;
}

function discountPercent(plan: Plan) {
  if (!plan.monthly || !plan.yearly) return 0;
  const fullYear = plan.monthly * 12;
  const pct = Math.max(0, 1 - plan.yearly / fullYear);
  return Math.round(pct * 100);
}

export default function PriceBlock({
  plan,
  billing,
}: {
  plan: Plan;
  billing: Billing;
}) {
  const isFree = plan.monthly === 0 && plan.yearly === 0;
  const pct = discountPercent(plan);
  const ym = yearlyMonthly(plan);

  if (isFree) {
    return (
      <div className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
        Free
      </div>
    );
  }

  if (billing === "monthly") {
    return (
      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          ${plan.monthly}
        </span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          /mo
        </span>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          ${plan.yearly}
        </span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          /yr
        </span>
      </div>
      {plan.monthly > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span className="line-through decoration-gray-400">
            ${plan.monthly}/mo
          </span>
          <span>→</span>
          <span className="text-gray-900 dark:text-white font-bold">
            ${ym}/mo
          </span>
          {pct > 0 && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
              SAVE {pct}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
