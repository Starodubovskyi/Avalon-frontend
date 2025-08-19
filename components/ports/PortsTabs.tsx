"use client";

import React from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useToast } from "@/components/ui/use-toast";

const TABS = [
  { key: "ports", label: "Ports", locked: false },
  { key: "expected", label: "Expected arrivals", locked: true },
  { key: "ad", label: "Arrivals & Departures", locked: true },
  { key: "berth", label: "Berth Calls", locked: true },
  { key: "congestion", label: "Port congestion", locked: true },
] as const;

export type PortsTabKey = (typeof TABS)[number]["key"];

export default function PortsTabs({
  value,
  onChange,
}: {
  value: PortsTabKey;
  onChange: (key: PortsTabKey) => void;
}) {
  const { toast } = useToast();

  return (
    <div className="w-full">
      <div
        className="
          flex items-center gap-2 overflow-x-auto no-scrollbar
          rounded-full border border-gray-200 bg-white px-2 py-2
          dark:bg-white/5 dark:border-white/10
        "
      >
        {TABS.map((t) => {
          const active = value === t.key;
          const locked = t.locked;

          const base =
            "whitespace-nowrap px-4 h-9 inline-flex items-center gap-1 rounded-full text-sm transition-all";
          const state = active
            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100";

          return (
            <button
              key={t.key}
              type="button"
              aria-current={active ? "page" : undefined}
              aria-disabled={locked}
              onClick={() => {
                if (locked) {
                  toast({
                    title: t.label,
                    description: "This section is locked in the demo.",
                  });
                  return;
                }
                onChange(t.key);
              }}
              className={[base, state, locked ? "opacity-70" : ""].join(" ")}
            >
              {locked && (
                <LockClosedIcon className="w-4 h-4 -ml-1" aria-hidden="true" />
              )}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
