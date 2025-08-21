"use client";

export default function BillingHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription, view payment history, and update your billing details — all in one place.
        </p>
      </div>
    </div>
  );
}
