"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLANS,
  getPlanById,
  type Billing as BillingType,
} from "@/components/types/billing/plan";
import {
  setCurrentSubscription,
  clearSubscription,
} from "@/components/types/billing/subscription";
import { appendInvoice } from "@/components/types/billing/invoices";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function DevSubscriptionPanel({
  surfaceClass,
}: {
  surfaceClass: string;
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState(PLANS[0].id);
  const [billing, setBilling] = useState<BillingType>("monthly");
  const plan = useMemo(() => getPlanById(planId)!, [planId]);

  const amount = billing === "monthly" ? plan.monthly : plan.yearly;

  const applyDirect = () => {
    setCurrentSubscription({
      planId,
      billing,
      startedAt: new Date().toISOString(),
    });
    appendInvoice({
      id: `dev_${Date.now()}`,
      date: new Date().toLocaleDateString(),
      description: `${plan.name} — ${billing} (DEV)`,
      amount,
      status: "paid",
      invoiceUrl: null,
    });
    toast.success(`Applied ${plan.name} (${billing})`);
  };

  const openCheckout = () => {
    router.push(
      `/paynow?plan=${encodeURIComponent(plan.id)}&billing=${billing}`
    );
  };

  const cancel = () => {
    if (confirm("Cancel subscription?")) {
      clearSubscription();
      toast.info("Cancelled");
    }
  };

  return (
    <div className={clsx(surfaceClass, "p-6")}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wrench size={16} className="text-amber-500" /> Developer Controls
        </h3>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700 uppercase tracking-wide">
          No Backend
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Plan
          </label>
          <select
            className="w-full rounded-full border-none bg-gray-100 dark:bg-white/5 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Billing
          </label>
          <div className="inline-flex w-full rounded-full bg-gray-100 dark:bg-white/5 p-1">
            {["monthly", "yearly"].map((b) => (
              <button
                key={b}
                className={clsx(
                  "flex-1 rounded-full py-1.5 text-xs font-bold capitalize transition-all",
                  billing === b
                    ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}
                onClick={() => setBilling(b as any)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-right">
            Amount
          </label>
          <div className="text-2xl font-bold text-gray-900 dark:text-white text-right">
            ${amount.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={applyDirect}
          className={clsx(
            "rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform",
            GRADIENT_BG
          )}
        >
          Apply Direct
        </button>
        <button
          onClick={openCheckout}
          className="rounded-full px-5 py-2.5 text-sm font-bold bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
        >
          Go to Checkout
        </button>
        <button
          onClick={cancel}
          className="rounded-full px-5 py-2.5 text-sm font-bold border border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 hover:bg-red-100 transition-colors"
        >
          Cancel Sub
        </button>
      </div>
    </div>
  );
}
