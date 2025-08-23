"use client";

import { IconAnchor, IconFilePlus, IconFlag3, IconMessagePlus, IconRoute } from "@tabler/icons-react";

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton icon={<IconAnchor className="h-5 w-5" />} label="+ New Port Call" />
      <ActionButton icon={<IconRoute className="h-5 w-5" />} label="+ New Voyage" />
      <ActionButton icon={<IconFlag3 className="h-5 w-5" />} label="+ New Task" />
      <ActionButton icon={<IconFilePlus className="h-5 w-5" />} label="+ New Defect" />
      <ActionButton icon={<IconMessagePlus className="h-5 w-5" />} label="+ New Contact" />
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={() => {}}
      className="h-10 px-3 rounded-xl border border-gray-200 bg-white dark:bg-white/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/15 text-sm flex items-center gap-2"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
