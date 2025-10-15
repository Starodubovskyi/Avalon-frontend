"use client";

import Modal from "@/components/tasks/shared/Modal";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  subtitle,
  confirmText = "Delete",
  confirmTone = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  subtitle?: string;
  confirmText?: string;
  confirmTone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-[#0f0f0f] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </div>
        {subtitle && (
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {subtitle}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={
              confirmTone === "danger"
                ? "rounded-xl bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                : "rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
