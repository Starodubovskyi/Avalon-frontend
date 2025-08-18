'use client';
import { useState } from "react";
import { useNotesStore, Note } from "./useNotesStore";

export default function NoteModal({
  date,
  note,
  onClose
}: {
  date: string;
  note?: Note;
  onClose?: () => void;
}) {
  const notesStore = useNotesStore();
  const [text, setText] = useState(note?.text || "");
  const [open, setOpen] = useState(!note);

  function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (note) {
      notesStore.editNote(note.id, text);
      onClose?.();
    } else {
      notesStore.addNote(date, text);
      setOpen(false);
      setText("");
      onClose?.();
    }
  }

  if (note || open) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-fadein">
        <form
          onSubmit={handleSave}
          className="relative w-full max-w-xs sm:max-w-sm md:max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 items-center border border-gray-100 dark:border-gray-800"
          style={{
            animation: "pop-in 0.25s cubic-bezier(.65,1.35,.8,1) both"
          }}
        >
          <h3 className="font-bold text-xl mb-2 text-center text-blue-600 dark:text-blue-200 tracking-tight">
            {note ? "Edit note" : `Add note for `}
            <span className="whitespace-nowrap font-normal text-base text-gray-400">
              {date}
            </span>
          </h3>
          <textarea
            className="w-full min-h-[60px] rounded-xl border border-blue-200 dark:border-blue-700 p-3 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 focus:outline-none bg-blue-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-base resize-none transition"
            value={text}
            onChange={e => setText(e.target.value)}
            autoFocus
            maxLength={300}
            placeholder="Write your note..."
          />
          <div className="flex w-full justify-between items-center gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 text-gray-600 dark:text-gray-300 transition text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold px-3 py-2 transition text-base shadow-md disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </form>
        <style>{`
          @keyframes pop-in {
            0% { opacity: 0; transform: scale(.8) translateY(40px);}
            100% { opacity: 1; transform: scale(1) translateY(0);}
          }
          .animate-fadein { animation: fadein .15s both; }
          @keyframes fadein {
            from { opacity: 0;}
            to { opacity: 1;}
          }
        `}</style>
      </div>
    );
  }
  return null;
}
