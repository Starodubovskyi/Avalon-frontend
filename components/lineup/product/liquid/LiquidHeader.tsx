"use client";

import { Droplets, Sparkles } from "lucide-react";
import { useLiquidStore } from "./state";

export function LiquidHeader({
  metrics,
  title = "Liquid",
  subtitle = "LNG / LPG / oil products, bitumen. Excludes crude & chemicals.",
}: {
  metrics: { total: number; inPort: number; anch: number; transit: number };
  title?: string;
  subtitle?: string;
}) {
  const totalShown = useLiquidStore((s) => s.filtered.length);

  return (
    <div className="relative isolate pt-2">
      <div className="pointer-events-none absolute -left-10 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-400/15" />
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-300/15" />

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-3 py-1.5 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
          <Droplets className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide">{title}</span>
        </div>
        <span className="hidden text-sm text-neutral-500 dark:text-neutral-400 md:inline">
          Avalol Ship • Products
        </span>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
        <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent dark:from-white dark:via-neutral-200 dark:to-neutral-400">
          Explore {title.toLowerCase()} cargo traffic
        </span>
      </h1>

      <div className="mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-emerald-600/80 to-teal-400/80 dark:from-emerald-400 dark:to-teal-300" />

      <p className="mt-2 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
        {subtitle}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <Hint>
          Press <Kbd>/</Kbd> to search
        </Hint>
        <Hint>Use chips to filter</Hint>
        <Hint>Double-click a row to open</Hint>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Pill>
          {" "}
          Total: <b>{metrics.total}</b>{" "}
        </Pill>
        <PillEm>
          {" "}
          In port: <b>{metrics.inPort}</b>{" "}
        </PillEm>
        <PillWarn>
          {" "}
          Anchorage: <b>{metrics.anch}</b>{" "}
        </PillWarn>
        <Pill>
          {" "}
          Transit: <b>{metrics.transit}</b>{" "}
        </Pill>
        <Pill>
          {" "}
          Shown: <b>{totalShown}</b>{" "}
        </Pill>
      </div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/60 px-2.5 py-1 text-neutral-600 backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
      <Sparkles className="h-3.5 w-3.5 opacity-70" />
      {children}
    </span>
  );
}
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-neutral-300 bg-neutral-50 px-1.5 py-[2px] font-mono text-[11px] leading-none text-neutral-700 shadow-sm dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200">
      {children}
    </span>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 dark:border-neutral-800 dark:bg-neutral-900">
      {children}
    </span>
  );
}
function PillEm({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-300">
      {children}
    </span>
  );
}
function PillWarn({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-300">
      {children}
    </span>
  );
}
