"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "../store/tasks";
import Avatar from "@/components/tasks/shared/Avatar";

export default function CreateProjectScreen() {
  const create = useProjectStore((s) => s.createProject);
  const users = useProjectStore((s) => s.users);
  const addUser = useProjectStore((s) => s.addUser);

  const [name, setName] = useState("");
  const [description, setDescription] = useState(
    "Provides a clear overview of a project's purpose, scope, objectives, and key details."
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [newMember, setNewMember] = useState("");

  const members = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/[0.04] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create a new project
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Name your project, add a brief description and invite teammates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Project name
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
              Description
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What is this project about?"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Quick add teammate
              </div>
              <input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Type a name and press Add"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMember();
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              />
            </div>
            <button
              onClick={handleAddMember}
              className="shrink-0 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
              disabled={!newMember.trim()}
            >
              Add
            </button>
          </div>

          <div>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Members (optional)
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.values(users).map((u) => {
                const checked = !!selected[u.id];
                return (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition dark:border-white/10 ${
                      checked
                        ? "border-gray-900 bg-gray-50 dark:bg-white/10"
                        : "border-gray-200 bg-white dark:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelected((s) => ({ ...s, [u.id]: !s[u.id] }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Avatar name={u.name} size={24} />
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {u.name}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setName("");
            setDescription("");
            setSelected({});
            setNewMember("");
          }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
        >
          Reset
        </button>
        <button
          disabled={!name.trim()}
          onClick={() => {
            create({
              name: name.trim(),
              description: description.trim(),
              memberIds: members,
            });
          }}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          Create project
        </button>
      </div>
    </div>
  );

  function handleAddMember() {
    const n = newMember.trim();
    if (!n) return;
    const id = addUser(n);
    setSelected((s) => ({ ...s, [id]: true }));
    setNewMember("");
  }
}
