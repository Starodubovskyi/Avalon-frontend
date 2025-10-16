"use client";

import { useState } from "react";

function label(d?: string | null) {
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

export default function DateInline({
  value,
  onChange,
}: {
  value?: string | null;
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
        {label(value)}
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
