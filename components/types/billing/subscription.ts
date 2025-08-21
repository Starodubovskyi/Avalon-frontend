// components/types/billing/subscription.ts
import type { Billing } from "./plan";

export type Subscription = {
  planId: string;
  billing: Billing;       // "monthly" | "yearly"
  startedAt: string;      // ISO
};

const KEY = "app:billing:subscription";

export function getCurrentSubscription(): Subscription | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Subscription) : null;
  } catch {
    return null;
  }
}

export function setCurrentSubscription(sub: Subscription) {
  localStorage.setItem(KEY, JSON.stringify(sub));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function clearSubscription() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}
