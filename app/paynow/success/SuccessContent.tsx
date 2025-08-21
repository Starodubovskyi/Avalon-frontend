"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getPlanById, type Billing as BillingType } from "@/components/types/billing/plan";
import { setCurrentSubscription } from "@/components/types/billing/subscription";
import { setInvoiceStatus } from "@/components/types/billing/invoices";

export default function SuccessContent() {
  const surfaceClass =
    "rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]";

  const sp = useSearchParams();
  const router = useRouter();

  const planId = sp.get("plan");
  const billing = (sp.get("billing") as BillingType | null) ?? null;
  const invoiceId = sp.get("invoiceId");
  const provider = sp.get("provider");

  const plan = useMemo(() => (planId ? getPlanById(planId) : null), [planId]);

  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!planId && !invoiceId) {
        router.replace("/billing");
        return;
      }

      if (plan && billing && !applied) {
        setCurrentSubscription({
          planId: plan.id,
          billing,
          startedAt: new Date().toISOString(),
        });
        setApplied(true);
      }

      if (invoiceId) {
        try {
          setInvoiceStatus(invoiceId, "paid");
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      console.error(e);
      setError("Something went wrong applying the result.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, billing, invoiceId, planId, applied]);

  const title = plan
    ? "Subscription activated"
    : invoiceId
    ? "Payment successful"
    : "Success";

  const amount =
    plan && billing
      ? (billing === "monthly" ? plan.monthly : plan.yearly).toFixed(2)
      : null;

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div className={`w-full ${surfaceClass}`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {title}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan && billing
                      ? `You’re now on ${plan.name} — ${
                          billing === "monthly" ? "Monthly" : "Yearly"
                        } plan.`
                      : "Your payment has been processed successfully."}
                  </p>
                  {provider && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Provider:{" "}
                      {provider === "googlepay"
                        ? "Google Pay"
                        : provider === "applepay"
                        ? "Apple Pay"
                        : "PayPal"}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className={`${surfaceClass} p-5 sm:p-6`}>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Summary
                  </h3>

                  <div className="mt-4 space-y-2 text-sm">
                    {plan && billing ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-200">
                            {plan.name} — {billing === "monthly" ? "Monthly" : "Yearly"}
                          </span>
                          <span>${amount}</span>
                        </div>
                        {plan.tagline && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              Details
                            </span>
                            <span className="text-right">{plan.tagline}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Invoice
                        </span>
                        <span>#{invoiceId}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between font-medium">
                      <span>Total</span>
                      <span>${amount ?? "0.00"}</span>
                    </div>
                  </div>
                </div>

                <div className={`${surfaceClass} p-5 sm:p-6`}>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Next steps
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {plan ? (
                      <>
                        <li>• Membership is synced to your profile.</li>
                        <li>• Manage or change plan in Billing.</li>
                        <li>• Payment is added to your billing history.</li>
                      </>
                    ) : (
                      <>
                        <li>• The invoice has been marked as paid.</li>
                        <li>• You can download the receipt from Billing.</li>
                      </>
                    )}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => router.push("/billing")}
                      className="rounded-xl px-4 py-2 text-sm font-medium bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                    >
                      Go to Billing
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="rounded-xl px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      Go to Profile
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="rounded-xl px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => router.push("/billing")}
                  className="underline underline-offset-4 hover:opacity-80"
                >
                  Back to Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
