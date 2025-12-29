"use client";

import {
  IconAnchor,
  IconFilePlus,
  IconFlag3,
  IconMessagePlus,
  IconRoute,
} from "@tabler/icons-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ActionButton icon={<IconAnchor size={18} />} label="Port Call" />
      <ActionButton icon={<IconRoute size={18} />} label="Voyage" />
      <div className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
      <ActionButton icon={<IconFlag3 size={18} />} label="Task" />
      <ActionButton icon={<IconFilePlus size={18} />} label="Defect" />
      <ActionButton icon={<IconMessagePlus size={18} />} label="Contact" />
    </div>
  );
}

function ActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="
        group flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white pl-4 pr-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-300
        hover:border-transparent hover:bg-gradient-to-br hover:from-blue-500 hover:via-indigo-500 hover:to-sky-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95
        dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300
      "
    >
      <span className="text-zinc-400 transition-colors group-hover:text-white dark:text-zinc-500">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
