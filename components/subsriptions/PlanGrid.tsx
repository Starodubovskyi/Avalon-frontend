"use client";

import { type Plan, type Billing, PLANS, getPlanById } from "@/components/types/billing/plan";

import PlanCard from "./PlanCard";

export default function PlanGrid({
  plans,
  billing,
  currentPlanId,
  selectedPlanId,
  onSelect,
}: {
  plans: Plan[];
  billing: Billing;
  currentPlanId: string;
  selectedPlanId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        const isSelected = plan.id === selectedPlanId;

        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            billing={billing}
            isCurrent={isCurrent}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
