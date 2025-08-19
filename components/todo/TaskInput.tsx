"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

type TaskInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
};

export default function TaskInput({
  value,
  onChange,
  onSubmit,
  inputRef,
}: TaskInputProps) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  return (
    <div className="flex gap-2 mb-5">
      <input
        ref={ref}
        className="
          flex-1 px-3 py-2 rounded-xl border text-base
          bg-white border-gray-300 text-gray-900 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-gray-300
          shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
          dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder-white/60
          dark:focus:ring-purple-300/20
        "
        type="text"
        placeholder="Add task..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      />
      <button
        className="
          rounded-xl px-4 py-2 transition active:scale-95 flex items-center justify-center
          bg-gradient-to-b from-purple-500 to-purple-600 text-white
          shadow-[0_8px_20px_rgba(124,58,237,0.3)]
          hover:shadow-[0_12px_28px_rgba(124,58,237,0.35)]
          dark:from-purple-600 dark:to-purple-700
        "
        onClick={onSubmit}
        aria-label="Add task"
        type="button"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
