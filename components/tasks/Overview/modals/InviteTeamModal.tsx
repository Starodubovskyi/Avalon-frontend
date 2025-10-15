"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/tasks/shared/Modal";
import Avatar from "@/components/tasks/shared/Avatar";
import { useProjectStore } from "@/components/tasks/store/tasks";

export default function InviteTeamModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const users = useProjectStore((s) => s.users);
  const members = useProjectStore((s) => s.project?.memberIds || []);
  const addMember = useProjectStore((s) => s.addMember);
  const addUser = useProjectStore((s) => s.addUser);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  const available = useMemo(
    () =>
      Object.values(users)
        .filter((u) => !members.includes(u.id))
        .filter((u) => u.name.toLowerCase().includes(query.toLowerCase())),
    [users, members, query]
  );

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#0f0f0f] dark:border-white/10">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Invite teammates
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search existing users…"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
            <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
              {available.length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  No matches
                </div>
              )}
              {available.map((u) => {
                const checked = selected.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected((prev) =>
                          checked
                            ? prev.filter((id) => id !== u.id)
                            : [...prev, u.id]
                        )
                      }
                    />
                    <Avatar name={u.name} size={20} />
                    <span>{u.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/10 pt-3">
            <div className="text-xs mb-1 text-gray-500 dark:text-gray-400">
              Or add new person
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
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
              selected.forEach((id) => addMember(id));
              if (newName.trim()) {
                const id = addUser(newName.trim());
                addMember(id);
              }
              onClose();
              setSelected([]);
              setNewName("");
              setQuery("");
            }}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Invite
          </button>
        </div>
      </div>
    </Modal>
  );
}
