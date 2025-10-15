"use client";

import { useState } from "react";
import { useProjectStore } from "../store/tasks";
import useProject from "../hooks/useProject";

export default function ProjectDescription() {
  const project = useProject();
  const update = useProjectStore((s) => s.updateProjectDescription);
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(project.description);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 dark:bg-white/[0.04] dark:border-white/10">
      <div className="text-sm font-medium text-gray-900 dark:text-white">
        Project Descriptions
      </div>

      {!edit && (
        <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {project.description}
        </div>
      )}

      {edit && (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white dark:focus:ring-white/20"
          rows={5}
        />
      )}

      <div className="mt-3 flex gap-2">
        {!edit && (
          <button
            onClick={() => {
              setEdit(true);
              setVal(project.description);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
          >
            Edit
          </button>
        )}
        {edit && (
          <>
            <button
              onClick={() => {
                update(val);
                setEdit(false);
              }}
              className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            >
              Save
            </button>
            <button
              onClick={() => setEdit(false)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
