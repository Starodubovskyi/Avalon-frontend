"use client";

import MainLayout from "@/components/layout/MainLayout";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";

import BillingHeader from "@/components/billing/BillingHeader";
import CurrentPlanCard from "@/components/billing/CurrentPlanCard";
import UsageSummaryCard from "@/components/billing/UsageSummaryCard";
import BillingHistoryTable from "@/components/billing/BillingHistoryTable";
import PaymentMethods from "@/components/billing/PaymentMethods";

// 👇 dev-панель (временный режим без бэка)
import DevSubscriptionPanel from "@/components/billing/DevSubscriptionPanel";

import { usage } from "@/components/types/billing/data";
import { getInvoices } from "@/components/types/billing/invoices";
import { useEffect, useState } from "react";
import type { Invoice } from "@/components/types/billing/types";

import { getCurrentSubscription } from "@/components/types/billing/subscription";
import {
  getPlanById,
  PLANS,
  type Plan,
  type Billing as BillingType,
} from "@/components/types/billing/plan";

// карты как SavedCard (с id)
import { listCards, type SavedCard } from "@/components/types/billing/cards";

export default function Page() {
  const surfaceClass =
    "rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentBilling, setCurrentBilling] = useState<BillingType>("monthly");
  const [cards, setCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    // инвойсы
    setInvoices(getInvoices());

    // подписка
    const sub = getCurrentSubscription();
    if (sub) {
      const p = getPlanById(sub.planId);
      if (p) {
        setCurrentPlan(p);
        setCurrentBilling(sub.billing);
      }
    } else {
      setCurrentPlan(getPlanById("basic") || PLANS[0]);
      setCurrentBilling("monthly");
    }

    // карты из localStorage
    const loadCards = () => setCards(listCards());
    loadCards();

    // слушаем изменения (после add/remove/update карты, смены подписки и т.п.)
    const handler = () => {
      const s = getCurrentSubscription();
      if (s) {
        const p = getPlanById(s.planId);
        if (p) {
          setCurrentPlan(p);
          setCurrentBilling(s.billing);
        }
      }
      setInvoices(getInvoices());
      loadCards();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div className={`w-full ${surfaceClass}`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <TopProfileNavbar />
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <BillingHeader />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <CurrentPlanCard
                  surfaceClass={surfaceClass}
                  plan={currentPlan ?? (getPlanById("basic") || PLANS[0])}
                  billing={currentBilling}
                />
                <UsageSummaryCard surfaceClass={surfaceClass} usage={usage} />
              </div>

              <div className="mt-6">
                <BillingHistoryTable surfaceClass={surfaceClass} invoices={invoices} />
              </div>

              <div className="mt-6">
                <PaymentMethods surfaceClass={surfaceClass} cards={cards} />
              </div>

              {process.env.NEXT_PUBLIC_FAKE_BILLING === "1" && (
                <div className="mt-6">
                  <DevSubscriptionPanel surfaceClass={surfaceClass} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
