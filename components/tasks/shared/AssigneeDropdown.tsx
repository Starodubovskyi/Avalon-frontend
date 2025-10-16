"use client";

import { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "@/components/tasks/store/tasks";
import Avatar from "@/components/tasks/shared/Avatar";
import { ChevronDown } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
};

export default function AssigneeDropdown({ value, onChange }: Props) {
  const users = useProjectStore((s) => s.users);
  const [open, setOpen] = useState(false);

  const selected = value ? users[value] : null;

  const youId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = localStorage.getItem("currentUser");
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      const name: string | undefined = parsed?.name;
      if (!name) return undefined;
      const id = Object.values(users).find((u) => u.name === name)?.id;
      return id;
    } catch {
      return undefined;
    }
  }, [users]);

  const ownerId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("tasks_owner_id") || undefined;
  }, []);

  const options = useMemo(() => Object.values(users), [users]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-gray-200 bg-transparent px-2 py-1 text-left dark:border-white/10"
      >
        <div className="flex flex-wrap items-center gap-2">
          {selected ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-800 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-100">
                <Avatar name={selected.name} size={18} />
                <span className="max-w-[140px] truncate">{selected.name}</span>
              </span>

              {selected.id === youId && (
                <span className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
                  You
                </span>
              )}

              {selected.id === ownerId && (
                <span className="rounded-md border border-yellow-200 bg-yellow-50 px-1.5 py-0.5 text-[11px] text-yellow-800 dark:border-yellow-400/25 dark:bg-yellow-400/10 dark:text-yellow-300">
                  Owner
                </span>
              )}
            </>
          ) : (
            <span className="rounded-lg border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 dark:border-white/10 dark:text-gray-300">
              Unassigned
            </span>
          )}

          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-gray-400" />
        </div>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:bg-[#111] dark:border-white/10">
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className="mb-1 block w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Unassign
          </button>
          <div className="max-h-64 overflow-y-auto">
            {options.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onChange(u.id);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <Avatar name={u.name} size={20} />
                  <span>{u.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  {u.id === youId && (
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 dark:bg-white/10 dark:text-gray-300">
                      You
                    </span>
                  )}
                  {u.id === ownerId && (
                    <span className="rounded-md bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300">
                      Owner
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
