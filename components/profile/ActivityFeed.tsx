"use client";

import { useMemo, useState } from "react";
import {
  FaEdit,
  FaCheckCircle,
  FaFileImage,
  FaLink,
  FaTag,
  FaLock,
  FaGoogle,
  FaCreditCard,
} from "react-icons/fa";

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
  { label: string; Icon: React.ComponentType<any> }
> = {
  profile: { label: "Profile", Icon: FaEdit },
  task: { label: "Tasks", Icon: FaCheckCircle },
  files: { label: "Files", Icon: FaFileImage },
  links: { label: "Links", Icon: FaLink },
  tags: { label: "Tags", Icon: FaTag },
  security: { label: "Security", Icon: FaLock },
  integrations: { label: "Integrations", Icon: FaGoogle },
  billing: { label: "Billing", Icon: FaCreditCard },
};

function timeAgo(iso: string) {
  const s = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return `${s}s ago`;
}

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
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All"
          />
          {(Object.keys(typeMeta) as ActivityType[]).map((t) => (
            <FilterPill
              key={t}
              active={filter === t}
              onClick={() => setFilter(t)}
              label={`${typeMeta[t].label}`}
              count={events.filter((e) => e.type === t).length}
            />
          ))}
        </div>
        {events.length > 0 && (
          <button
            onClick={onClear}
            type="button"
            className="text-xs rounded-full border px-3 py-1 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No activity yet — make changes to your profile, tasks or files to see
          them here.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => {
            const { Icon } = typeMeta[e.type];
            return (
              <li key={e.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200">
                  <Icon className="text-sm" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {e.title}
                  </div>
                  {e.meta && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {e.meta}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(e.createdAt)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "rounded-full px-3 py-1 text-xs border",
        active
          ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white"
          : "text-gray-700 border-gray-200 hover:bg-gray-50 dark:text-gray-200 dark:border-white/15 dark:hover:bg-white/5",
      ].join(" ")}
    >
      {label}
      {typeof count === "number" ? ` · ${count}` : ""}
    </button>
  );
}
