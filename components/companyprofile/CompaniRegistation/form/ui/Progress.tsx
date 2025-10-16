"use client";

import { Step } from "../types";

type Props = {
  step: Step;
};

export default function Progress({ step }: Props) {
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: "Company" },
    { id: 2, label: "Team" },
    { id: 3, label: "Line-Up" },
    { id: 4, label: "Branding" },
    { id: 5, label: "Location" },
    { id: 6, label: "Contacts" },
    { id: 7, label: "About" },
  ];
  const percent =
    (steps.findIndex((s) => s.id === step) / (steps.length - 1)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-neutral-400">
        {steps.map((s) => (
          <div key={s.id} className="flex-1 flex items-center gap-2">
            <div
              className={`rounded-full h-7 px-3 flex items-center justify-center ${
                step === s.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
              }`}
            >
              {s.label}
            </div>
            {s.id !== 7 && (
              <div className="h-[2px] flex-1 bg-gray-200 dark:bg-neutral-700" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
