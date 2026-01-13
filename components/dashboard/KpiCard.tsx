"use client";

import { ReactNode } from "react";

export default function KpiCard({
  title,
  value,
  delta,
  icon,
}: {
  title: string;
  value: string | number;
  delta?: number;
  icon?: ReactNode;
}) {
  const deltaSign = typeof delta === "number" ? (delta > 0 ? "+" : "") : "";
  const isPositive = typeof delta === "number" && delta > 0;
  const isNegative = typeof delta === "number" && delta < 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {title}
          </span>
          <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {value}
          </span>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/20">
            {icon}
          </div>
        )}
      </div>

      {typeof delta === "number" && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`
            inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold
            ${
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : isNegative
                ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }
          `}
          >
            {deltaSign}
            {delta}%
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}
