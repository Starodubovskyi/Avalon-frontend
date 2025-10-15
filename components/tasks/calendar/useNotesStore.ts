"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Note = {
  id: string;
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

type NotesState = {
  notes: Note[];
  addNote: (date: string, text: string) => void;
  editNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  getNotesByDate: (date: string) => Note[];
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (date, text) =>
        set((s) => ({
          notes: [
            {
              id: uid(),
              date,
              text,
              createdAt: now(),
              updatedAt: now(),
            },
            ...s.notes,
          ],
        })),
      editNote: (id, text) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, text, updatedAt: now() } : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      getNotesByDate: (date) => get().notes.filter((n) => n.date === date),
    }),
    { name: "tasks-calendar-notes" }
  )
);
