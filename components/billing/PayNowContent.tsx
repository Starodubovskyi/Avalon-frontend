"use client";

import MainLayout from "@/components/layout/MainLayout";
import PayNowSummary from "@/components/paynow/PayNowSummary";
import PayNowMethods from "@/components/paynow/PayNowMethods";
import CardForm from "@/components/billing/CardForm";
import CardPreview from "@/components/billing/CardPreview";
import AddCardSidebar from "@/components/paynow/AddCardSidebar";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getInvoices, setInvoiceStatus } from "@/components/types/billing/invoices";
import { listCards, addCard, type SavedCard } from "@/components/types/billing/cards";
import { type NewCardInput } from "@/components/types/billing/types";
import { getPlanById, type Billing as BillingType } from "@/components/types/billing/plan";

export default function PayNowContent() {
  const surfaceClass =
    "rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]";

  const sp = useSearchParams();
  const router = useRouter();

  const planParam = sp.get("plan");
  const billingParam = (sp.get("billing") as BillingType | null) ?? null;
  const invoiceId = sp.get("invoiceId") || "";
  const flow = sp.get("flow");
  const isAddCardFlow = flow === "add-card";

  const plan = useMemo(() => getPlanById(planParam), [planParam]);

  const planPurchase = useMemo(() => {
    if (!plan || !billingParam) return null;
    const amount = billingParam === "monthly" ? plan.monthly : plan.yearly;
    return {
      id: `plan_${plan.id}_${billingParam}`,
      name: plan.name,
      tagline: plan.tagline,
      Icon: plan.icon,
      amount,
      billing: billingParam,
    };
  }, [plan, billingParam]);

  const invoices = useMemo(() => getInvoices(), []);
  const invoice = useMemo(
    () => (!planPurchase ? invoices.find((i) => i.id === invoiceId) ?? null : null),
    [invoices, invoiceId, planPurchase]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const hasAnyParam = !!planParam || !!invoiceId || isAddCardFlow;
    if (!hasAnyParam) router.replace("/billing");
  }, [mounted, planParam, invoiceId, isAddCardFlow, router]);

  const [saved, setSaved] = useState<SavedCard[]>([]);
  const [mode, setMode] = useState<"saved" | "new" | "other">("new");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<NewCardInput>({ number: "", exp: "", cvc: "", name: "" });
  const [canPay, setCanPay] = useState(false);

  useEffect(() => {
    const cards = listCards();
    setSaved(cards);
    if (cards.length && !isAddCardFlow) {
      setMode("saved");
      setSelectedCardId(cards[0].id);
    } else {
      setMode("new");
    }
  }, [isAddCardFlow]);

  const onSubmit = () => {
    if (isAddCardFlow) {
      if (!canPay) return;
      addCard(newCard);
      router.push("/billing");
      return;
    }

    if (planPurchase && plan) {
      if (mode === "saved" && selectedCardId) {
        router.push(`/paynow/success?plan=${encodeURIComponent(plan.id)}&billing=${planPurchase.billing}`);
        return;
      }
      if (mode === "new" && canPay) {
        addCard(newCard);
        router.push(`/paynow/success?plan=${encodeURIComponent(plan.id)}&billing=${planPurchase.billing}`);
        return;
      }
      return;
    }

    if (invoice) {
      if (mode === "saved" && selectedCardId) {
        setInvoiceStatus(invoice.id, "paid");
        router.push(`/paynow/success?invoiceId=${invoice.id}`);
        return;
      }
      if (mode === "new" && canPay) {
        addCard(newCard);
        setInvoiceStatus(invoice.id, "paid");
        router.push(`/paynow/success?invoiceId=${invoice.id}`);
      }
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div className={`w-full ${surfaceClass}`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {isAddCardFlow ? "Add a new card" : "Checkout"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isAddCardFlow
                  ? "Save a card to use for future payments."
                  : planPurchase
                  ? "Complete your subscription."
                  : "Securely complete your payment."}
              </p>

              {!isAddCardFlow && planPurchase && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 dark:border-emerald-500/30">
                  <planPurchase.Icon className="h-4 w-4" />
                  <span className="text-emerald-100">
                    {planPurchase.name} — {planPurchase.billing === "monthly" ? "Monthly" : "Yearly"}
                  </span>
                  <span className="font-medium text-white">${planPurchase.amount.toFixed(2)}</span>
                </div>
              )}

              {planParam && !plan && !isAddCardFlow && (
                <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  Unknown plan id: <code>{planParam}</code>. Check PLANS ids.
                </div>
              )}

              {isAddCardFlow ? (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className={`${surfaceClass} p-5 sm:p-6`}>
                    <CardForm value={newCard} onChange={setNewCard} onValidChange={setCanPay} />
                    <button
                      disabled={!canPay}
                      onClick={onSubmit}
                      className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-medium ${
                        canPay
                          ? "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                          : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Save Card
                    </button>
                  </div>

                  <AddCardSidebar surfaceClass={surfaceClass} input={newCard} />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <PayNowSummary surfaceClass={surfaceClass} invoice={invoice} planPurchase={planPurchase} />

                  <div className={`${surfaceClass} p-5 sm:p-6`}>
                    <PayNowMethods
                      mode={mode}
                      setMode={setMode}
                      saved={saved}
                      selectedCardId={selectedCardId}
                      onSelect={setSelectedCardId}
                      onChooseOther={(provider) => {
                        if (planPurchase && plan) {
                          router.push(
                            `/paynow/success?plan=${encodeURIComponent(plan.id)}&billing=${planPurchase.billing}&provider=${provider}`
                          );
                        } else if (invoice) {
                          router.push(`/paynow/success?invoiceId=${invoice.id}&provider=${provider}`);
                        } else {
                          router.push("/billing");
                        }
                      }}
                    />

                    {mode === "new" ? (
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="order-2 md:order-1">
                          <CardForm value={newCard} onChange={setNewCard} onValidChange={setCanPay} />
                          <button
                            disabled={!canPay}
                            onClick={onSubmit}
                            className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-medium ${
                              canPay
                                ? "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                                : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Pay Now
                          </button>
                        </div>
                        <div className="order-1 md:order-2">
                          <CardPreview input={newCard} />
                        </div>
                      </div>
                    ) : mode === "saved" ? (
                      <div className="mt-5">
                        <button
                          disabled={!selectedCardId}
                          onClick={onSubmit}
                          className={`w-full rounded-xl px-4 py-2 text-sm font-medium ${
                            selectedCardId
                              ? "bg-gray-900 text-white hover:opacity-90 dark:bg-white dark:text-black"
                              : "bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Pay Now
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <button onClick={() => router.push("/billing")} className="underline underline-offset-4 hover:opacity-80">
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
