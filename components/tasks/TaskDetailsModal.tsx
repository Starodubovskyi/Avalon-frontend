"use client";

import { useMemo, useState } from "react";
import Modal from "./shared/Modal";
import PrioritySelect from "./shared/PrioritySelect";
import AssigneeDropdown from "./shared/AssigneeDropdown";
import { useProjectStore, type Priority } from "./store/tasks";
import { X, Plus, Paperclip } from "lucide-react";

const ALL_CATEGORIES = [
  "Creative",
  "Technical",
  "Design",
  "Development",
  "Management",
];

export default function TaskDetailsModal({
  taskId,
  open,
  onClose,
}: {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const task = useProjectStore((s) => (taskId ? s.tasks[taskId] : undefined));

  const assign = useProjectStore((s) => s.assignTask);
  const setStart = useProjectStore((s) => s.setStartDate);
  const setDue = useProjectStore((s) => s.setDueDate);
  const setPriority = useProjectStore((s) => s.setPriority);
  const updateTask = useProjectStore((s) => s.updateTask);
  const addSubtask = useProjectStore((s) => s.addSubtask);
  const toggleSubtask = useProjectStore((s) => s.toggleSubtask);
  const removeSubtask = useProjectStore((s) => s.removeSubtask);
  const markStarted = useProjectStore((s) => s.markStarted);
  const markCompleted = useProjectStore((s) => s.markCompleted);

  const [newSub, setNewSub] = useState("");
  const [comment, setComment] = useState("");

  const startValue = useMemo(
    () => (task?.startedAt ? toLocal(task.startedAt) : ""),
    [task?.startedAt]
  );
  const dueValue = useMemo(
    () => (task?.dueAt ? toLocal(task.dueAt) : ""),
    [task?.dueAt]
  );

  if (!open || !task) return null;

  const priorityLabel =
    task.priority === "high"
      ? "High Priority"
      : task.priority === "low"
      ? "Low Priority"
      : "Normal Priority";
  const priorityChip =
    task.priority === "high"
      ? "bg-red-50 text-red-600 border-red-200"
      : task.priority === "low"
      ? "bg-blue-50 text-blue-600 border-blue-200"
      : "bg-gray-50 text-gray-600 border-gray-200";

  const statusChip =
    task.status === "inprogress"
      ? "bg-yellow-100 text-yellow-800"
      : task.status === "done"
      ? "bg-green-100 text-green-800"
      : "bg-gray-200 text-gray-700";

  return (
    <Modal onClose={onClose} side="right" className="max-w-[720px]">
      <div className="ml-auto flex h-full w-full max-w-[720px] flex-col rounded-none border-l border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f0f0f] md:rounded-l-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-[#0f0f0f]/80">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Task Details
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-white/10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="mt-1 h-3 w-3 rounded-full border-2 border-violet-500" />
            <input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="w-full min-w-0 bg-transparent text-lg font-semibold leading-6 text-gray-900 outline-none dark:text-white"
            />
          </div>
          <div className="shrink-0 space-x-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${priorityChip}`}
            >
              {priorityLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${statusChip}`}
            >
              {task.status === "inprogress"
                ? "In Progress"
                : task.status === "done"
                ? "Completed"
                : "Pending"}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <FieldBlock label="Assignee">
            <AssigneeDropdown
              value={task.assigneeId || null}
              onChange={(id) => assign(task.id, id)}
            />
          </FieldBlock>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldBlock label="Start Date">
              <input
                type="datetime-local"
                value={startValue}
                onChange={(e) => setStart(task.id, fromLocal(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              />
              <button
                onClick={() => markStarted(task.id)}
                className="mt-2 rounded-lg bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700"
              >
                Start now
              </button>
            </FieldBlock>

            <FieldBlock label="Due Date">
              <input
                type="datetime-local"
                value={dueValue}
                onChange={(e) => setDue(task.id, fromLocal(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              />
            </FieldBlock>
          </div>

          <FieldBlock label="Priority">
            <PrioritySelect
              value={task.priority as Priority}
              onChange={(p) => setPriority(task.id, p)}
            />
          </FieldBlock>

          <FieldBlock label="Category">
            <CategoryMulti
              all={ALL_CATEGORIES}
              selected={task.categories || []}
              onToggle={(name) => {
                const set = new Set(task.categories || []);
                set.has(name) ? set.delete(name) : set.add(name);
                updateTask(task.id, { categories: Array.from(set) });
              }}
            />
          </FieldBlock>

          <FieldBlock
            label="Description"
            action={
              <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10">
                <Paperclip className="h-4 w-4" /> Attach
              </button>
            }
          >
            <textarea
              value={task.description || ""}
              onChange={(e) =>
                updateTask(task.id, { description: e.target.value })
              }
              placeholder="Add a description..."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
          </FieldBlock>

          <FieldBlock label="Subtasks">
            <div className="space-y-2">
              {(task.subtasks || []).map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-white/10"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => toggleSubtask(task.id, st.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span
                      className={
                        st.done
                          ? "line-through text-gray-400"
                          : "text-gray-800 dark:text-gray-100"
                      }
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    onClick={() => removeSubtask(task.id, st.id)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  value={newSub}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSub.trim()) {
                      addSubtask(task.id, newSub.trim());
                      setNewSub("");
                    }
                  }}
                  placeholder="Add subtask"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (!newSub.trim()) return;
                    addSubtask(task.id, newSub.trim());
                    setNewSub("");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black dark:bg-white dark:text-black"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          </FieldBlock>

          <div className="rounded-xl border border-gray-200 p-3 text-sm dark:border-white/10 dark:text-gray-200">
            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Time
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-gray-500">Started:&nbsp;</span>
                <span>
                  {task.startedAt
                    ? new Date(task.startedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Completed:&nbsp;</span>
                <span>
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => markStarted(task.id)}
                  className="rounded-lg bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700"
                >
                  Set start now
                </button>
                <button
                  onClick={() => markCompleted(task.id)}
                  className="rounded-lg bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                >
                  Complete now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white/80 p-3 backdrop-blur dark:border-white/10 dark:bg-[#0f0f0f]/80">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10">
              +
            </button>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add Comment"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
            <button
              onClick={() => setComment("")}
              className="rounded-xl bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
              title="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FieldBlock({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function CategoryMulti({
  all,
  selected,
  onToggle,
}: {
  all: string[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const items = all.filter((x) => x.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-white/10 dark:text-gray-200"
      >
        + Add Category
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:bg-[#111] dark:border-white/10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm dark:bg-[#0f0f0f] dark:border-white/10 dark:text-white"
          />
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {items.map((name) => {
              const checked = selected.includes(name);
              return (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(name)}
                  />
                  {name}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-lg bg-black/5 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200"
            >
              {c}
              <button
                onClick={() => onToggle(c)}
                className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function fromLocal(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return d.toISOString();
}
