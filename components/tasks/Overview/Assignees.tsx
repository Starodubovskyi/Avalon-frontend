"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "../store/tasks";
import Avatar from "../shared/Avatar";
import useProject from "../hooks/useProject";

export default function Assignees() {
  const project = useProject();
  const users = useProjectStore((s) => s.users);
  const addMember = useProjectStore((s) => s.addMember);
  const removeMember = useProjectStore((s) => s.removeMember);
  const currentUserId = useProjectStore((s) => s.currentUserId);
  const [open, setOpen] = useState(false);

  const membersOrdered = useMemo(() => {
    const ids = project.memberIds || [];
    const byName = (a: string, b: string) =>
      (users[a]?.name || "").localeCompare(users[b]?.name || "", "en");
    const rest = ids
      .filter((id) => id !== project.ownerId && id !== currentUserId)
      .sort(byName);

    const res: string[] = [];
    if (project.ownerId && ids.includes(project.ownerId))
      res.push(project.ownerId);
    if (
      currentUserId &&
      ids.includes(currentUserId) &&
      currentUserId !== project.ownerId
    ) {
      res.push(currentUserId);
    }
    return res.concat(rest);
  }, [project.memberIds, project.ownerId, currentUserId, users]);

  const available = useMemo(() => {
    const set = new Set(project.memberIds || []);
    const all = Object.values(users)
      .map((u) => u.id)
      .filter((id) => !set.has(id));

    if (
      currentUserId &&
      !set.has(currentUserId) &&
      !all.includes(currentUserId)
    ) {
      all.unshift(currentUserId);
    }
    return all;
  }, [users, project.memberIds, currentUserId]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 dark:bg-white/[0.04] dark:border-white/10">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        Assignees
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {membersOrdered.map((id) => {
            const u = users[id];
            if (!u) return null;
            const isOwner = project.ownerId === id;
            const isMe = currentUserId === id;

            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1 dark:bg-white/[0.02] dark:border-white/10"
              >
                <Avatar name={u.name} src={u.avatarUrl} size={28} />
                <div className="flex items-center gap-1 text-xs text-gray-800 dark:text-gray-100">
                  <span>{u.name}</span>
                  {isMe && (
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-white/10 dark:text-gray-200">
                      You
                    </span>
                  )}
                  {isOwner && (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                      Owner
                    </span>
                  )}
                </div>

                {!isOwner && (
                  <button
                    onClick={() => removeMember(id)}
                    className="ml-1 rounded-md px-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                    title="Remove from project"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
            >
              + Add member
            </button>
            {open && (
              <div className="absolute z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:bg-[#111] dark:border-white/10">
                {available.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-300">
                    No users to add
                  </div>
                )}
                {available.map((uid) => {
                  const u = users[uid];
                  if (!u) return null;
                  const isOwner = project.ownerId === uid;
                  const isMe = currentUserId === uid;
                  return (
                    <button
                      key={uid}
                      onClick={() => {
                        addMember(uid);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      <span className="inline-flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        <Avatar name={u.name} src={u.avatarUrl} size={22} />
                        <span className="truncate">{u.name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {isMe && (
                          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-white/10 dark:text-gray-200">
                            You
                          </span>
                        )}
                        {isOwner && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                            Owner
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
