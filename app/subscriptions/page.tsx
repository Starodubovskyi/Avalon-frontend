"use client";

import { useMemo, useState } from "react";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";
import { Check, X, Crown, Compass, Ship, Radar } from "lucide-react";
import { motion } from "framer-motion";

type Billing = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  icon: JSX.Element;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
};

export default function SubscriptionsPage() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [currentPlanId, setCurrentPlanId] = useState<string>("basic");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "basic",
        name: "Basic",
        tagline: "Start tracking vessels with essentials",
        icon: <Ship className="h-5 w-5" />,
        monthly: 0,
        yearly: 0,
        features: [
          { label: "Live vessel map (5 min delay)", included: true },
          { label: "Search by IMO/MMSI/Name", included: true },
          { label: "10 vessel watchlist", included: true },
          { label: "Port arrivals & departures (last 24h)", included: true },
          { label: "Basic route history (24h)", included: true },
          { label: "Email alerts (up to 3 rules)", included: true },
          { label: "Weather overlay (basic wind)", included: false },
          { label: "CSV export", included: false },
          { label: "Geofencing zones", included: false },
          { label: "Satellite AIS positions", included: false },
          { label: "Multi-user seats", included: false },
        ],
      },
      {
        id: "navigator",
        name: "Navigator",
        tagline: "Deeper visibility for individuals",
        icon: <Compass className="h-5 w-5" />,
        monthly: 19,
        yearly: 190,
        features: [
          { label: "Live vessel map (near real-time)", included: true },
          { label: "Advanced filters & saved searches", included: true },
          { label: "100 vessel watchlist", included: true },
          { label: "Port calls & schedule insights", included: true },
          { label: "Route history (7 days)", included: true },
          { label: "Email & push alerts (20 rules)", included: true },
          { label: "Weather overlay (wind, waves)", included: true },
          { label: "CSV export", included: true },
          { label: "Geofencing zones", included: false },
          { label: "Satellite AIS positions", included: false },
          { label: "Multi-user seats", included: false },
        ],
      },
      {
        id: "fleet-pro",
        name: "Fleet Pro",
        tagline: "Operational tools for teams",
        icon: <Radar className="h-5 w-5" />,
        monthly: 49,
        yearly: 490,
        highlight: true,
        features: [
          { label: "Live vessel map (near real-time)", included: true },
          { label: "Advanced filters & saved searches", included: true },
          { label: "Unlimited vessel watchlist", included: true },
          { label: "Port calls, ETAs, turnaround analytics", included: true },
          { label: "Route history (90 days)", included: true },
          { label: "Email & push alerts (100 rules)", included: true },
          { label: "Weather overlays (wind, waves, currents)", included: true },
          { label: "CSV/Excel export & scheduled reports", included: true },
          { label: "Geofencing zones & breach alerts", included: true },
          { label: "Satellite AIS add-on (pay-as-you-go)", included: true },
          { label: "Multi-user seats (up to 5)", included: true },
        ],
      },
      {
        id: "enterprise",
        name: "Maritime Enterprise",
        tagline: "Full-scale maritime monitoring",
        icon: <Crown className="h-5 w-5" />,
        monthly: 129,
        yearly: 1290,
        features: [
          { label: "Live vessel map (priority updates)", included: true },
          { label: "Custom dashboards & analytics", included: true },
          { label: "Unlimited watchlists & geofences", included: true },
          { label: "Full route history (365 days+)", included: true },
          { label: "Enterprise alerts & notifications", included: true },
          { label: "Premium weather layers", included: true },
          { label: "Bulk exports & scheduled reports", included: true },
          { label: "Satellite AIS included", included: true },
          { label: "Multi-user seats (unlimited)", included: true },
          { label: "Dedicated account manager", included: true },
        ],
      },
    ],
    []
  );

  const yearlyMonthly = (plan: Plan) =>
    plan.yearly > 0 ? Number((plan.yearly / 12).toFixed(2)) : 0;

  const discountPercent = (plan: Plan) => {
    if (!plan.monthly || !plan.yearly) return 0;
    const fullYear = plan.monthly * 12;
    const pct = Math.max(0, 1 - plan.yearly / fullYear);
    return Math.round(pct * 100);
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;
  const canPayNow =
    !!selectedPlan &&
    selectedPlan.id !== currentPlanId &&
    (selectedPlan.monthly > 0 || selectedPlan.yearly > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
      <TopProfileNavbar />

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Subscribes</h1>
          <p className="text-sm text-muted-foreground">
            Choose a plan to unlock advanced vessel tracking and analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-muted p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                billing === "monthly"
                  ? "bg-background shadow-sm font-semibold"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                billing === "yearly"
                  ? "bg-background shadow-sm font-semibold"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card text-card-foreground p-3 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Current plan:{" "}
            <span className="font-semibold">
              {plans.find((p) => p.id === currentPlanId)?.name}
            </span>
          </span>

          {selectedPlan && selectedPlan.id !== currentPlanId && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
              Selected: {selectedPlan.name}
            </span>
          )}
        </div>

        {canPayNow && (
          <a
            href={`/checkout?plan=${selectedPlan!.id}&billing=${billing}`}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition"
          >
            Pay Now
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isFree = plan.monthly === 0 && plan.yearly === 0;
          const pct = discountPercent(plan);
          const ym = yearlyMonthly(plan);
          const isCurrent = plan.id === currentPlanId;
          const isSelected = plan.id === selectedPlanId;

          return (
            <motion.div
              key={plan.id}
              layout
              className={`group relative rounded-2xl border bg-card text-card-foreground shadow-sm transition hover:shadow-md ${
                plan.highlight
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl"
                initial={false}
                animate={
                  isSelected && !isCurrent
                    ? { boxShadow: "0 0 0 2px rgba(16,185,129,1), 0 0 0 8px rgba(16,185,129,0.20)", backgroundColor: "rgba(16,185,129,0.06)" }
                    : { boxShadow: "0 0 0 0 rgba(0,0,0,0)", backgroundColor: "rgba(0,0,0,0)" }
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
                  <div className="rounded-xl bg-muted p-2">{plan.icon}</div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>

                <div className="mt-5">
                  {isFree ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : billing === "monthly" ? (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold">${plan.monthly}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">${plan.yearly}</span>
                        <span className="text-sm text-muted-foreground">/yr</span>
                      </div>
                      {plan.monthly > 0 && (
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <span className="line-through opacity-60">
                            ${plan.monthly}
                          </span>
                          <span className="opacity-60">/mo</span>
                          <span className="opacity-60">→</span>
                          <span className="font-semibold">${ym}</span>
                          <span className="opacity-60">/mo</span>
                          {pct > 0 && (
                            <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                              -{pct}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isCurrent) setSelectedPlanId(plan.id);
                  }}
                  disabled={isCurrent}
                  className={`mt-5 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-muted text-foreground"
                      : isSelected
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : plan.highlight
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : isSelected
                    ? "Selected"
                    : isFree
                    ? "Start Free"
                    : "Choose Plan"}
                </motion.button>

                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      {f.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 opacity-40" />
                      )}
                      <span className={f.included ? "" : "opacity-60"}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
