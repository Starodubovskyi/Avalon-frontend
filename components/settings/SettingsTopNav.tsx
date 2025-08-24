"use client";

import { useMemo } from "react";

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
    <div className="w-full">
      <div
        className="
          flex items-center gap-2 overflow-x-auto
          rounded-full border border-gray-200 bg-white px-2 py-2
          dark:bg-white/5 dark:border-white/10
        "
      >
        {items.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={[
                "whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
