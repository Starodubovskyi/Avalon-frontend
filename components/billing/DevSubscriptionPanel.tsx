"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, getPlanById, type Billing as BillingType } from "@/components/types/billing/plan";
import { setCurrentSubscription, clearSubscription } from "@/components/types/billing/subscription";
import { appendInvoice } from "@/components/types/billing/invoices";
import { toast } from "sonner"; 

export default function DevSubscriptionPanel({
  surfaceClass,
}: { surfaceClass: string }) {
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
      description: `${plan.name} — ${billing === "monthly" ? "Monthly" : "Yearly"} (DEV)`,
      amount,
      status: "paid",
      invoiceUrl: null,
    });
    toast.success(`Applied ${plan.name} (${billing}) without payment`);
  };

  const openCheckout = () => {
    router.push(`/paynow?plan=${encodeURIComponent(plan.id)}&billing=${billing}`);
  };

  const cancel = () => {
    if (confirm("Are you sure you want to cancel subscription?")) {
      clearSubscription();
      toast.info("Subscription cancelled");
    }
  };

  return (
    <div className={`${surfaceClass} p-4 sm:p-5`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Developer Controls</h3>
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          TEMP / NO BACKEND
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-500">Plan</label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-white/5 dark:border-white/10 focus:ring-2 focus:ring-emerald-500"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">Billing</label>
          <div className="mt-1 inline-flex rounded-lg border p-1 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                billing==="monthly"
                  ? "bg-emerald-500 text-white shadow"
                  : "hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                billing==="yearly"
                  ? "bg-emerald-500 text-white shadow"
                  : "hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
              onClick={() => setBilling("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="self-end">
          <div className="text-xs text-gray-500">Amount</div>
          <div className="text-sm font-medium">${amount.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={applyDirect}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-95"
        >
          Apply without payment
        </button>
        <button
          onClick={openCheckout}
          className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10 active:scale-95"
        >
          Go to checkout
        </button>
        <button
          onClick={cancel}
          className="rounded-xl border border-rose-400/40 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/10 active:scale-95"
        >
          Cancel subscription
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        DEV-only helper. Uses localStorage to simulate purchase and invoices.
      </p>
    </div>
  );
}
