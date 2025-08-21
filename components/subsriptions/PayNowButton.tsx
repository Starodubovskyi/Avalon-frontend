"use client";
import type { Billing, Plan } from "@/components/types/billing/plan";
import { useMemo } from "react";

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
    ((billing === "monthly" && selectedPlan.monthly > 0) ||
      (billing === "yearly" && selectedPlan.yearly > 0));

  if (!canPayNow) return null;

  const href = useMemo(() => {
    const pid = encodeURIComponent(String(selectedPlan!.id));
    const per = encodeURIComponent(String(billing));
    return `/paynow?plan=${pid}&billing=${per}`;
  }, [selectedPlan, billing]);

  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
    >
      Pay Now
    </a>
  );
}
