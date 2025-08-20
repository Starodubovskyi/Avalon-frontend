"use client";

import type { Billing, Plan } from "./types";

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
    return <div className="mt-5 text-3xl font-bold">Free</div>;
  }

  if (billing === "monthly") {
    return (
      <div className="mt-5 flex items-end gap-1">
        <span className="text-3xl font-bold">${plan.monthly}</span>
        <span className="text-sm text-muted-foreground">/mo</span>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-1">
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold">${plan.yearly}</span>
        <span className="text-sm text-muted-foreground">/yr</span>
      </div>
      {plan.monthly > 0 && (
        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
          <span className="line-through opacity-60">${plan.monthly}</span>
          <span className="opacity-60">/mo</span>
          <span className="opacity-60">→</span>
          <span className="font-semibold">${ym}</span>
          <span className="opacity-60">/mo</span>
          {pct > 0 && (
            <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-500">
              -{pct}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
