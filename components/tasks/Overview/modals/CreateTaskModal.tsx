"use client";

import { useState } from "react";
import Modal from "../../shared/Modal";
import { useProjectStore } from "../../store/tasks";
import useProject from "../../hooks/useProject";

export default function CreateTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useProjectStore((s) => s.createTask);
  const users = useProjectStore((s) => s.users);
  const project = useProject();
  const members = project.memberIds;

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [date, setDate] = useState<string>("");

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#0f0f0f] dark:border-white/10">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Task
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Title
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Assignee
            </div>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            >
              <option value="">Unassigned</option>
              {members.map((id) => (
                <option key={id} value={id}>
                  {users[id]?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Due date
            </div>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
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
            onClick={() => {
              if (!title.trim()) return;
              create({
                title,
                assigneeId: assignee || undefined,
                dueAt: date ? new Date(date).toISOString() : undefined,
              });
              onClose();
              setTitle("");
              setAssignee("");
              setDate("");
            }}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
}
