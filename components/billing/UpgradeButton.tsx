"use client";

import { IconArrowUpRight } from "@tabler/icons-react";

export default function UpgradeButton() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 active:scale-[0.99] dark:bg-white/5 dark:border-white/10"
      onClick={() => alert("Upgrade flow TBD")}
    >
      Upgrade
      <IconArrowUpRight size={16} />
    </button>
  );
}
