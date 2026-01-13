"use client";

export default function BillingHeader() {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Billing
        </h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-2xl">
          Manage your subscription, view payment history, and update your
          billing details — all in one place.
        </p>
      </div>
    </div>
  );
}
