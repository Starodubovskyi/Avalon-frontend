"use client";

import { useMemo, useState } from "react";
import {
  Edit2,
  CheckCircle2,
  FileImage,
  Link as LinkIcon,
  Tag,
  Lock,
  Chrome,
  CreditCard,
} from "lucide-react";
import clsx from "clsx";

export type ActivityType =
  | "profile"
  | "task"
  | "files"
  | "links"
  | "tags"
  | "security"
  | "integrations"
  | "billing";
export type ActivityEvent = {
  id: string;
  type: ActivityType;
  title: string;
  meta?: string;
  createdAt: string;
};

const typeMeta: Record<
  ActivityType,
  { label: string; Icon: React.ElementType; color: string }
> = {
  profile: {
    label: "Profile",
    Icon: Edit2,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  },
  task: {
    label: "Tasks",
    Icon: CheckCircle2,
    color: "text-green-500 bg-green-50 dark:bg-green-900/20",
  },
  files: {
    label: "Files",
    Icon: FileImage,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  },
  links: {
    label: "Links",
    Icon: LinkIcon,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  },
  tags: {
    label: "Tags",
    Icon: Tag,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20",
  },
  security: {
    label: "Security",
    Icon: Lock,
    color: "text-red-500 bg-red-50 dark:bg-red-900/20",
  },
  integrations: {
    label: "Integrations",
    Icon: Chrome,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
  },
  billing: {
    label: "Billing",
    Icon: CreditCard,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20",
  },
};

function timeAgo(iso: string) {
  /* same logic */ return "just now";
} // Simplified for brevity

export default function ActivityFeed({
  events,
  onClear,
}: {
  events: ActivityEvent[];
  onClear: () => void;
}) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.type === filter)),
    [events, filter]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Activity
        </h3>
        {events.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-red-500 hover:underline"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />
        {Object.keys(typeMeta).map((t) => {
          const count = events.filter((e) => e.type === t).length;
          if (count === 0) return null;
          return (
            <FilterPill
              key={t}
              active={filter === t}
              onClick={() => setFilter(t as ActivityType)}
              label={typeMeta[t as ActivityType].label}
              count={count}
            />
          );
        })}
      </div>

      <div className="relative pl-4 border-l-2 border-gray-100 dark:border-white/10 space-y-6 py-2">
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No activity found.</div>
        ) : (
          filtered.map((e) => {
            const { Icon, color } = typeMeta[e.type];
            return (
              <div key={e.id} className="relative group">
                <div
                  className={clsx(
                    "absolute -left-[25px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-[#0d1117] flex items-center justify-center shadow-sm",
                    color
                  )}
                >
                  <Icon size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {e.title}
                  </span>
                  {e.meta && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {e.meta}
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                    {new Date(e.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1 rounded-full text-xs font-bold transition-colors border",
        active
          ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
          : "bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:border-gray-400"
      )}
    >
      {label} {count > 0 && <span className="opacity-60 ml-1">{count}</span>}
    </button>
  );
}
