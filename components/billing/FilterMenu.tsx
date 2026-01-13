"use client";

import { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import clsx from "clsx";

export type FilterValue = "all" | "paid" | "failed";

export default function FilterMenu({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 transition-all"
        onClick={() => setOpen((s) => !s)}
      >
        <Filter size={16} />
        Filter
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:bg-[#161b22] dark:border-white/10 z-20 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          {[
            { k: "all", label: "All" },
            { k: "paid", label: "Paid" },
            { k: "failed", label: "Failed" },
          ].map((it) => (
            <button
              key={it.k}
              className={clsx(
                "w-full px-3 py-2 text-left text-sm rounded-xl transition-colors",
                value === it.k
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              )}
              onClick={() => {
                onChange(it.k as FilterValue);
                setOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
