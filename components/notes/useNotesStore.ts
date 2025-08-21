import { create } from 'zustand';

export type Note = {
  id: string;
  date: string;
  text: string;
};

type NotesStore = {
  notes: Note[];
  addNote: (date: string, text: string) => void;
  editNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  getNotesByDate: (date: string) => Note[];
};

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes:
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('notes') ?? '[]')
      : [],
  addNote: (date, text) => {
    const id = Math.random().toString(36).slice(2, 10);
    const note = { id, date, text };
    const notes = [...get().notes, note];
    set({ notes });
    localStorage.setItem('notes', JSON.stringify(notes));
  },
  editNote: (id, text) => {
    const notes = get().notes.map(n => n.id === id ? { ...n, text } : n);
    set({ notes });
    localStorage.setItem('notes', JSON.stringify(notes));
  },
  deleteNote: (id) => {
    const notes = get().notes.filter(n => n.id !== id);
    set({ notes });
    localStorage.setItem('notes', JSON.stringify(notes));
  },
  getNotesByDate: (date) => get().notes.filter(n => n.date === date),
}));
