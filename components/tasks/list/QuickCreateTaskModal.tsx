"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../shared/Modal";
import { useProjectStore } from "../store/tasks";
import AssigneeDropdown from "../shared/AssigneeDropdown";

export default function QuickCreateTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useProjectStore((s) => s.createTask);
  const members = useProjectStore((s) => s.project?.memberIds || []);
  const meId = useProjectStore((s) => s.currentUserId);

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const memberOptions = useMemo(() => {
    const set = new Set<string>(members);
    if (meId) set.add(meId);
    return Array.from(set);
  }, [members, meId]);

  useEffect(() => {
    if (open) {
      setAssignee(meId || null);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setTitle("");
      setAssignee(null);
    }
  }, [open, meId]);

  if (!open) return null;

  const handleCreate = () => {
    if (!title.trim()) return;
    create({
      title: title.trim(),
      assigneeId: assignee || undefined,
      status: "todo",
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#0f0f0f] dark:border-white/10">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Add Task
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Title
            </div>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Task title"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
          </div>

          <div>
            <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">
              Assignee
            </div>
            <AssigneeDropdown value={assignee || null} onChange={setAssignee} />
            {memberOptions.length === 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No members yet — you’ll be added automatically after creating a
                project.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}
