"use client";

import { useState } from "react";
import Modal from "@/components/tasks/shared/Modal";
import { useNotesStore, type Note } from "./useNotesStore";
import { X, Plus, Save, Trash2 } from "lucide-react";

export default function DayNotesPanel({
  date,
  open,
  onClose,
}: {
  date: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const store = useNotesStore();

  const [draft, setDraft] = useState("");

  const notes = date ? store.getNotesByDate(date) : [];

  if (!open || !date) return null;

  return (
    <Modal side="right" onClose={onClose} className="max-w-[640px]">
      <div className="ml-auto flex h-full w-full max-w-[640px] flex-col border-l border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f0f0f]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-[#0f0f0f]/80">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Notes for
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {date}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-2xl border border-gray-200 p-3 dark:border-white/10">
            <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-300">
              Add note
            </div>
            <div className="flex items-start gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write your note..."
                rows={3}
                className="flex-1 resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              />
              <button
                onClick={() => {
                  if (!draft.trim()) return;
                  store.addNote(date, draft.trim());
                  setDraft("");
                }}
                className="mt-1 inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black"
                disabled={!draft.trim()}
                title="Add"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notes.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-white/20 dark:text-gray-400">
                No notes yet — add your first one ✍️
              </div>
            )}

            {notes.map((n) => (
              <NoteItem key={n.id} note={n} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function NoteItem({ note }: { note: Note }) {
  const store = useNotesStore();
  const [value, setValue] = useState(note.text);
  const dirty = value !== note.text;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated {new Date(note.updatedAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => store.deleteNote(note.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => dirty && store.editNote(note.id, value)}
            disabled={!dirty}
            className="rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-60 dark:text-gray-200 dark:hover:bg-white/10"
            title="Save"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
      />
    </div>
  );
}
