"use client";

import { Step } from "../types";

type Props = {
  step: Step;
  setStep: (updater: (s: Step) => Step) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  handleSubmit: () => void;
};

export default function StickyNav({
  step,
  setStep,
  isSubmitting,
  isEditing,
  handleSubmit,
}: Props) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 mt-6">
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-3 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-neutral-400">
          Step {step} of 7
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
            >
              Back
            </button>
          )}
          {step < 7 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition"
            >
              Next
            </button>
          )}
          {step === 7 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[.98] transition disabled:opacity-60"
            >
              {isEditing ? "Update Company" : "Save Company"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
