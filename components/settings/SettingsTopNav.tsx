"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";

// Градиент текста
const GRADIENT_TEXT =
  "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent";

export type SettingsTabKey =
  | "account-security"
  | "notifications"
  | "appearance"
  | "privacy"
  | "integrations"
  | "support"
  | "danger";

export const TABS: { key: SettingsTabKey; label: string }[] = [
  { key: "account-security", label: "Account & Security" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "privacy", label: "Privacy" },
  { key: "integrations", label: "Integrations" },
  { key: "danger", label: "Danger Zone" },
];

export default function SettingsTopNav({
  active,
  onChange,
}: {
  active: SettingsTabKey;
  onChange: (key: SettingsTabKey) => void;
}) {
  const items = useMemo(() => TABS, []);

  return (
    <div className="w-full mb-8">
      <div
        className="
          relative flex items-center gap-1 overflow-x-auto
          rounded-full border border-gray-200 bg-white/80 backdrop-blur-xl p-1.5
          dark:bg-[#0d1117]/80 dark:border-white/5 shadow-sm no-scrollbar
        "
      >
        {items.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={clsx(
                "relative isolate whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all z-10",
                isActive
                  ? "text-blue-600 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="settingsTabsHighlight"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="
                    absolute inset-0 -z-10 rounded-full
                    bg-white dark:bg-[#1e2329] shadow-md
                    border border-gray-100 dark:border-white/5
                  "
                />
              )}
              <span className={isActive ? GRADIENT_TEXT : ""}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
