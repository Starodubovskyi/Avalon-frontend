"use client";

import { motion } from "framer-motion";
import { type Plan, type Billing } from "@/components/types/billing/plan";
import PriceBlock from "./PriceBlock";
import FeatureList from "./FeatureList";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
  const Icon = plan.icon;

  return (
    <motion.div
      layout
      className={clsx(
        "group relative flex flex-col h-full rounded-[2.5rem] border p-1 transition-all duration-300",
        isSelected
          ? "border-blue-500/50 bg-blue-50/50 dark:border-blue-500/50 dark:bg-blue-900/10 shadow-2xl shadow-blue-500/10"
          : "border-gray-200 dark:border-white/5 bg-white/60 dark:bg-[#0d1117]/60 hover:border-blue-300 dark:hover:border-white/10 hover:shadow-xl hover:bg-white/80 dark:hover:bg-[#0d1117]/80"
      )}
    >
      {/* Popular Badge */}
      {plan.highlight && (
        <div
          className={clsx(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg z-10",
            GRADIENT_BG
          )}
        >
          Most Popular
        </div>
      )}

      <div className="relative flex h-full flex-col rounded-[2.2rem] p-6 sm:p-8 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm",
              isSelected || plan.highlight
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 min-h-[40px]">
          {plan.tagline}
        </p>

        <PriceBlock plan={plan} billing={billing} />

        <div className="mt-8 flex-1">
          <FeatureList features={plan.features} />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!isCurrent) onSelect(plan.id);
          }}
          disabled={isCurrent}
          className={clsx(
            "mt-8 w-full rounded-full py-3.5 text-sm font-bold shadow-lg transition-all active:scale-95",
            isCurrent
              ? "bg-gray-100 text-gray-400 cursor-default dark:bg-white/5 dark:text-gray-500 shadow-none"
              : isSelected || plan.highlight
              ? `${GRADIENT_BG} text-white hover:shadow-blue-500/30 hover:scale-[1.02]`
              : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:border-white/5 dark:text-white dark:hover:bg-white/20"
          )}
        >
          {isCurrent
            ? "Current Plan"
            : isSelected
            ? "Selected"
            : isFree
            ? "Start Free"
            : "Choose Plan"}
        </motion.button>
      </div>
    </motion.div>
  );
}
