"use client";

import { Usage } from "../types/billing/types";

function Bar({ valuePct }: { valuePct: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gray-900 dark:bg-white"
        style={{ width: `${Math.min(100, Math.max(0, valuePct))}%` }}
      />
    </div>
  );
}

export default function UsageSummaryCard({
  surfaceClass,
  usage,
}: {
  surfaceClass: string;
  usage: Usage;
}) {
  const apiPct = (usage.apiUsed / usage.apiLimit) * 100;
  const storagePct = (usage.storageUsedGb / usage.storageLimitGb) * 100;

  return (
    <div className={`${surfaceClass} p-5 sm:p-6`}>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
        Usage Summary
      </h3>

      <div className="mt-4 space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">API Requests Used</span>
            <span className="text-gray-600 dark:text-gray-300">
              {usage.apiUsed.toLocaleString()} / {usage.apiLimit.toLocaleString()}
            </span>
          </div>
          <div className="mt-2"><Bar valuePct={apiPct} /></div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage Used</span>
            <span className="text-gray-600 dark:text-gray-300">
              {usage.storageUsedGb} GB / {usage.storageLimitGb} GB
            </span>
          </div>
          <div className="mt-2"><Bar valuePct={storagePct} /></div>
        </div>
      </div>
    </div>
  );
}
