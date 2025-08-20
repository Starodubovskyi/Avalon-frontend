"use client";

import PayNowButton from "./PayNowButton";
import type { Billing, Plan } from "./types";

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

  return (
    <div
      className="
        mt-4 flex flex-col gap-3 rounded-xl 
        border border-border dark:border-neutral-700/80 
        bg-white dark:bg-neutral-900 
        text-card-foreground 
        p-3 text-sm 
        shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]
        md:flex-row md:items-center md:justify-between
      "
    >
      <div className="flex flex-wrap items-center gap-2">
        <span>
          Current plan:{" "}
          <span className="font-semibold">{currentPlan?.name}</span>
        </span>

        {selectedPlan && selectedPlan.id !== currentPlanId && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
            Selected: {selectedPlan.name}
          </span>
        )}
      </div>

      <PayNowButton
        selectedPlan={selectedPlan}
        currentPlanId={currentPlanId}
        billing={billing}
      />
    </div>
  );
}
