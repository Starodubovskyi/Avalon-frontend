import React from "react";

const TABS = [
  "Vessels",
  "Position history",
  "Voyage timeline",
  "Events",
  "Position history & Weather",
  "My Notes",
  "Areas of Interest",
];

const VesselsTabs: React.FC = () => {
  const activeTab = "Vessels";

  return (
    <div className="w-full">
      <div
        className="
          flex items-center gap-2 overflow-x-auto no-scrollbar
          rounded-full border border-gray-200 bg-white px-2 py-2
          dark:bg-white/5 dark:border-white/10
        "
      >
        {TABS.map((tab) => {
          const active = tab === activeTab;
          const base =
            "whitespace-nowrap px-4 h-9 inline-flex items-center rounded-full text-sm transition-all";
          const state = active
            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100";

          return (
            <button key={tab} type="button" className={[base, state].join(" ")}>
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VesselsTabs;
