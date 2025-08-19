"use client";

import { motion } from "framer-motion";
import type { Billing, Plan } from "./types";
import PriceBlock from "./PriceBlock";
import FeatureList from "./FeatureList";

export default function PlanCard({
  plan,
  billing,
  isCurrent,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  billing: Billing;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const isFree = plan.monthly === 0 && plan.yearly === 0;

  return (
    <motion.div
      layout
      className={`group relative rounded-2xl 
        border border-border dark:border-neutral-700/80 
        bg-white dark:bg-neutral-900 
        text-card-foreground 
        shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]
        transition hover:shadow-md dark:hover:border-neutral-500/70
        ${plan.highlight ? "border-primary/50 ring-1 ring-primary/20" : ""}
      `}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={false}
        animate={
          isSelected && !isCurrent
            ? {
                boxShadow:
                  "0 0 0 2px rgba(16,185,129,1), 0 0 0 8px rgba(16,185,129,0.20)",
                backgroundColor: "rgba(16,185,129,0.06)",
              }
            : {
                boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                backgroundColor: "rgba(0,0,0,0)",
              }
        }
        transition={{ duration: 0.25, ease: "easeOut" }}
      />

      {plan.highlight && (
        <div className="absolute -top-3 right-4 rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Most Popular
        </div>
      )}

      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-muted dark:bg-neutral-800 p-2">
            {plan.icon}
          </div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

        <PriceBlock plan={plan} billing={billing} />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!isCurrent) onSelect(plan.id);
          }}
          disabled={isCurrent}
          className={`mt-5 w-full rounded-xl px-4 py-2 text-sm font-semibold transition
            ${
              isCurrent
                ? "bg-muted text-foreground"
                : isSelected
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : plan.highlight
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-foreground text-background hover:opacity-90"
            }
          `}
        >
          {isCurrent
            ? "Current Plan"
            : isSelected
            ? "Selected"
            : isFree
            ? "Start Free"
            : "Choose Plan"}
        </motion.button>

        <FeatureList features={plan.features} />
      </div>
    </motion.div>
  );
}
