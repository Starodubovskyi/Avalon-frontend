"use client";

import { CalendarDays, SlidersHorizontal, Plus } from "lucide-react";
import { useProjectStore } from "../store/tasks";

type Props = {
  value: {
    due: "any" | "today" | "week" | "overdue";
    assignee: "all" | "unassigned" | string;
    priority: "all" | "low" | "normal" | "high";
  };
  onChange: (v: Props["value"]) => void;
  onAddNew: () => void;
};

export default function ListToolbar({ value, onChange, onAddNew }: Props) {
  const users = useProjectStore((s) => s.users);
  const members = useProjectStore((s) => s.project?.memberIds || []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-1 dark:bg-white/[0.04] dark:border-white/10">
        <CalendarDays className="h-4 w-4 text-gray-500" />
        <select
          value={value.due}
          onChange={(e) => onChange({ ...value, due: e.target.value as any })}
          className="bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
        >
          <option value="any">Due Date: Any</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-2 py-1 dark:bg-white/[0.04] dark:border-white/10">
        <select
          value={value.assignee}
          onChange={(e) =>
            onChange({ ...value, assignee: e.target.value as any })
          }
          className="bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
        >
          <option value="all">Assignee: All</option>
          <option value="unassigned">Unassigned</option>
          {members.map((id) => (
            <option key={id} value={id}>
              {users[id]?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-2 py-1 dark:bg-white/[0.04] dark:border-white/10">
        <select
          value={value.priority}
          onChange={(e) =>
            onChange({ ...value, priority: e.target.value as any })
          }
          className="bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
        >
          <option value="all">Priority: All</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200">
        <SlidersHorizontal className="h-4 w-4" />
        Advance Filters
      </button>

      <button
        onClick={onAddNew}
        className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
      >
        <Plus className="h-4 w-4" />
        Add New
      </button>
    </div>
  );
}
