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

          // Base styles
          const base =
            "whitespace-nowrap px-5 h-9 inline-flex items-center rounded-full text-sm font-medium transition-all duration-300";

          // Active vs Inactive styles
          const state = active
            ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/10";

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
