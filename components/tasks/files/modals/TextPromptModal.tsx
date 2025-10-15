"use client";

import Modal from "@/components/tasks/shared/Modal";
import { useEffect, useState } from "react";

export default function TextPromptModal({
  open,
  title,
  label,
  placeholder,
  initialValue = "",
  confirmText = "Save",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue, open]);

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-[#0f0f0f] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </div>
        <div className="mt-4">
          <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            disabled={!value.trim()}
            onClick={() => onConfirm(value.trim())}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
