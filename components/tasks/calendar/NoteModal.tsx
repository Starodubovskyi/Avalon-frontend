"use client";

import { useState } from "react";
import { useNotesStore, type Note } from "./useNotesStore";

export default function NoteModal({
  date,
  note,
  onClose,
}: {
  date: string;
  note?: Note;
  onClose?: () => void;
}) {
  const notes = useNotesStore();
  const [text, setText] = useState(note?.text || "");
  const [open, setOpen] = useState(!note);

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (note) {
      notes.editNote(note.id, text);
      onClose?.();
    } else {
      notes.addNote(date, text);
      setOpen(false);
      setText("");
      onClose?.();
    }
  }

  if (!(note || open)) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
      <form
        onSubmit={handleSave}
        className="
          relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5
          shadow-[0_16px_40px_rgba(2,6,23,0.08)]
          dark:bg-[#0f0f0f] dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          animate-[modal_.22s_ease-out_both]
        "
      >
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {note ? "Edit note" : "Add note"}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            {date}
          </span>
        </div>

        <textarea
          className="
            mt-3 w-full min-h-[80px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
            outline-none focus:ring-2 focus:ring-gray-900/10
            dark:bg-white/[0.02] dark:border-white/10 dark:text-white
          "
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          maxLength={300}
          placeholder="Write your note..."
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex-1 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:bg-white dark:text-black"
          >
            Save
          </button>
        </div>
      </form>

      <style>{`
        @keyframes modal {
          from { opacity: 0; transform: translateY(8px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
