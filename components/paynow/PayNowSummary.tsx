"use client";

import type { Invoice } from "@/components/types/billing/types";
import type { LucideIcon } from "lucide-react";

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
  if (planPurchase) {
    const { Icon } = planPurchase;
    return (
      <div className={`${surfaceClass} p-5 sm:p-6`}>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Subscription Summary
        </h3>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Icon className="h-4 w-4" />
              {planPurchase.name} – {planPurchase.billing === "monthly" ? "Monthly" : "Yearly"}
            </span>
            <span>${planPurchase.amount.toFixed(2)}</span>
          </div>

          {planPurchase.tagline && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Details</span>
              <span className="text-right">{planPurchase.tagline}</span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between font-medium">
            <span>Total</span>
            <span>${planPurchase.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (invoice) {
    return (
      <div className={`${surfaceClass} p-5 sm:p-6`}>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Order Summary</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{invoice.description}</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Invoice</span>
            <span>{invoice.date}</span>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between font-medium">
            <span>Total</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
