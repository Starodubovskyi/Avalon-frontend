"use client";

import { useState } from "react";
import { IconFilter } from "@tabler/icons-react";

export type FilterValue = "all" | "paid" | "failed";

export default function FilterMenu({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 active:scale-[0.99] dark:bg-white/5 dark:border-white/10"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Filter
        <IconFilter size={16} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:bg-neutral-900 dark:border-white/10"
          role="menu"
        >
          {[
            { k: "all", label: "All" },
            { k: "paid", label: "Paid" },
            { k: "failed", label: "Failed" },
          ].map((it) => (
            <button
              key={it.k}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/10 ${value === it.k ? "font-medium" : ""}`}
              onClick={() => {
                onChange(it.k as FilterValue);
                setOpen(false);
              }}
              role="menuitem"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
