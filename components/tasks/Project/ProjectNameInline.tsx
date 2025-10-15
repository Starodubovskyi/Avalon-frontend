"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useProjectStore } from "../store/tasks";

export default function ProjectNameInline() {
  const project = useProjectStore((s) => s.project);
  const rename = useProjectStore((s) => s.renameProject);
  const reset = useProjectStore((s) => s.resetProject);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(project?.name || "");
  const [menu, setMenu] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setValue(project?.name || ""), [project?.name]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!btnRef.current) return;
      const m = document.getElementById("project-title-menu");
      if (
        m &&
        !m.contains(e.target as Node) &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!project) return null;

  return (
    <div className="flex items-center gap-2">
      {!editing ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
            title="Rename project"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (value.trim()) rename(value.trim());
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xl font-semibold outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
          />
          <button
            onClick={() => {
              if (value.trim()) rename(value.trim());
              setEditing(false);
            }}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}

      <span className="ml-2 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-300">
        Active
      </span>

      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => setMenu((v) => !v)}
          className="ml-2 rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
          title="Project menu"
        >
          <EllipsisVertical className="h-5 w-5" />
        </button>
        {menu && (
          <div
            id="project-title-menu"
            className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#111]"
          >
            <button
              onClick={() => {
                setMenu(false);
                reset();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
