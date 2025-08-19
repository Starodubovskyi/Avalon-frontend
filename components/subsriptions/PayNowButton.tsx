"use client";

import type { Billing, Plan } from "./types";

export default function PayNowButton({
  selectedPlan,
  currentPlanId,
  billing,
}: {
  selectedPlan: Plan | null;
  currentPlanId: string;
  billing: Billing;
}) {
  const canPayNow =
    !!selectedPlan &&
    selectedPlan.id !== currentPlanId &&
    (selectedPlan.monthly > 0 || selectedPlan.yearly > 0);

  if (!canPayNow) return null;

  return (
    <a
      href={`/checkout?plan=${selectedPlan!.id}&billing=${billing}`}
      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
    >
      Pay Now
    </a>
  );
}
