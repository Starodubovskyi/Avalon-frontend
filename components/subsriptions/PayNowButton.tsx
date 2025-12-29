"use client";
import type { Billing, Plan } from "@/components/types/billing/plan";
import { useMemo } from "react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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

  const href = useMemo(() => {
    if (!selectedPlan) return "#";
    const pid = encodeURIComponent(String(selectedPlan.id));
    const per = encodeURIComponent(String(billing));
    return `/paynow?plan=${pid}&billing=${per}`;
  }, [selectedPlan, billing]);

  if (!canPayNow) return null;

  return (
    <a
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95",
        GRADIENT_BG
      )}
    >
      Pay Now
    </a>
  );
}
