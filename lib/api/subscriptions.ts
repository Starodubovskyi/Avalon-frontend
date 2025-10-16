"use client";

import api from "./client";

export type BillingCycle = "monthly" | "yearly";

export interface MySubscription {
  planId: string | null;
  billing: BillingCycle | null;
  status?: string | null;
  currentPeriodEnd?: string | null;
  [key: string]: any;
}

export const SubscriptionsApi = {
  async getMine(): Promise<MySubscription> {
    const { data } = await api.get("/users/me/subscription");
    return data ?? { planId: null, billing: null };
  },

  async updateMine(payload: { planId: string; billing: BillingCycle }) {
    const { data } = await api.patch("/users/me/subscription", payload);
    return data as MySubscription;
  },
};
