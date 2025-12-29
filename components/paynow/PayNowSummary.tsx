"use client";

import type { Invoice } from "@/components/types/billing/types";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

// Градиент текста
const GRADIENT_TEXT =
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";

export default function PayNowSummary({
  surfaceClass,
  invoice,
  planPurchase,
}: {
  surfaceClass: string;
  invoice: Invoice | null;
  planPurchase: {
    id: string;
    name: string;
    tagline?: string;
    Icon: LucideIcon;
    amount: number;
    billing: "monthly" | "yearly";
  } | null;
}) {
  // Контейнер с закруглением
  const containerClass = clsx(
    surfaceClass,
    "p-8 rounded-[2.5rem] border border-gray-200/50 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm"
  );

  if (planPurchase) {
    const { Icon } = planPurchase;
    return (
      <div className={containerClass}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Subscription Summary
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 dark:text-white">
                  {planPurchase.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {planPurchase.billing} billing
                </span>
              </div>
            </div>
            <span className="font-bold text-lg">
              ${planPurchase.amount.toFixed(2)}
            </span>
          </div>

          {planPurchase.tagline && (
            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-gray-500 dark:text-gray-400">Details</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {planPurchase.tagline}
              </span>
            </div>
          )}

          <div className="pt-6 mt-2 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Total due today
            </span>
            <span className={clsx("text-2xl font-extrabold", GRADIENT_TEXT)}>
              ${planPurchase.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (invoice) {
    return (
      <div className={containerClass}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Order Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm px-2">
            <span className="text-gray-500 dark:text-gray-400">
              Description
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {invoice.description}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm px-2">
            <span className="text-gray-500 dark:text-gray-400">Date</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {invoice.date}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm px-2">
            <span className="text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${invoice.amount.toFixed(2)}
            </span>
          </div>

          <div className="pt-6 mt-2 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              Total
            </span>
            <span className={clsx("text-2xl font-extrabold", GRADIENT_TEXT)}>
              ${invoice.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
