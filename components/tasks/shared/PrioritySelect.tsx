"use client";

import { Flag } from "lucide-react";
import { useState } from "react";
import type { Priority } from "../store/tasks";

const COLORS: Record<Priority, string> = {
  low: "bg-blue-500",
  normal: "bg-gray-400",
  high: "bg-red-500",
};

export default function PrioritySelect({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    value === "high"
      ? "High Priority"
      : value === "low"
      ? "Low Priority"
      : "Normal Priority";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.02] dark:border-white/10 dark:text-gray-200"
      >
        <span className={`h-2 w-2 rounded ${COLORS[value]}`} />
        <span>{label}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:bg-[#111] dark:border-white/10">
          {(["low", "normal", "high"] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <Flag className="h-4 w-4 opacity-70" />
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    p === "high"
                      ? "#ef4444"
                      : p === "low"
                      ? "#3b82f6"
                      : "#9ca3af",
                }}
              />
              <span>
                {p === "high"
                  ? "High Priority"
                  : p === "low"
                  ? "Low Priority"
                  : "Normal Priority"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
