"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "../store/tasks";
import Avatar from "../shared/Avatar";
import useProject from "../hooks/useProject";

function formatDateISO(d?: string | null) {
  if (!d) return "Add date";
  const dt = new Date(d);
  const mm = dt.toLocaleString(undefined, { month: "short" });
  const dd = dt.getDate();
  const hm = dt.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${mm} ${dd} – ${hm}`;
}

export default function RecentTasks() {
  const project = useProject();
  const users = useProjectStore((s) => s.users);
  const tasks = useProjectStore((s) => s.tasks);
  const setDue = useProjectStore((s) => s.setDueDate);
  const assign = useProjectStore((s) => s.assignTask);
  const remove = useProjectStore((s) => s.deleteTask);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const list = useMemo(
    () =>
      Object.values(tasks)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [tasks]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 dark:bg-white/[0.04] dark:border-white/10">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        Recent Tasks
      </div>

      <div className="mt-3 divide-y divide-gray-100 dark:divide-white/10">
        {list.map((t) => (
          <div key={t.id} className="flex items-center gap-4 py-3">
            <div className="w-6 text-center text-xs text-gray-400">•</div>
            <div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
              {t.title}
            </div>
            <div className="w-[160px]">
              <AssigneeDropdown
                currentId={t.assigneeId || undefined}
                users={
                  project.memberIds.map((id) => users[id]).filter(Boolean) as {
                    id: string;
                    name: string;
                  }[]
                }
                onChange={(uid) => assign(t.id, uid || null)}
              />
            </div>
            <div className="w-[200px]">
              <DateInline
                value={t.dueAt || undefined}
                onChange={(d) => setDue(t.id, d)}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => (p === t.id ? null : t.id))}
                className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                ⋯
              </button>
              {menuOpen === t.id && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:bg-[#111] dark:border-white/10">
                  <button
                    onClick={() => {
                      remove(t.id);
                      setMenuOpen(null);
                    }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <AddTaskInline />
      </div>
    </div>
  );
}

function AssigneeDropdown({
  currentId,
  users,
  onChange,
}: {
  currentId?: string;
  users: { id: string; name: string }[];
  onChange: (id?: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = users.find((u) => u?.id === currentId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-white/10 dark:text-gray-200"
      >
        {current ? (
          <Avatar name={current.name} size={20} />
        ) : (
          <span className="text-gray-400">Assign</span>
        )}
        <span className="truncate">{current?.name || ""}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:bg-[#111] dark:border-white/10">
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            Unassigned
          </button>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                onChange(u.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <Avatar name={u.name} size={20} />
              <span className="truncate">{u.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateInline({
  value,
  onChange,
}: {
  value?: string;
  onChange: (iso?: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(value ? value.substring(0, 10) : "");
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-white/10 dark:text-gray-200"
      >
        {value ? formatDateISO(value) : "Add date"}
      </button>
      {open && (
        <div className="absolute z-10 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:bg-[#111] dark:border-white/10">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            type="date"
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:bg-[#0f0f0f] dark:border-white/10 dark:text-gray-100"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Close
            </button>
            <button
              onClick={() => {
                onChange(val ? new Date(val).toISOString() : null);
                setOpen(false);
              }}
              className="rounded-lg bg-gray-900 px-2 py-1 text-sm text-white dark:bg-white dark:text-black"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddTaskInline() {
  const create = useProjectStore((s) => s.createTask);
  const [title, setTitle] = useState("");
  return (
    <div className="flex items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task name"
        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white dark:focus:ring-white/20"
      />
      <button
        onClick={() => {
          if (!title.trim()) return;
          create({ title });
          setTitle("");
        }}
        className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Add Task
      </button>
    </div>
  );
}
