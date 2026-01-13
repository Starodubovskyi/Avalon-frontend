"use client";

import { Check, X } from "lucide-react";
import type { Feature } from "./types";
import clsx from "clsx";

export default function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="mt-6 space-y-3 text-sm">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-3">
          <div
            className={clsx(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              f.included
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600"
            )}
          >
            {f.included ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <X size={12} strokeWidth={3} />
            )}
          </div>
          <span
            className={clsx(
              "font-medium",
              f.included
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-400 dark:text-gray-600 line-through decoration-gray-300/50"
            )}
          >
            {f.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
