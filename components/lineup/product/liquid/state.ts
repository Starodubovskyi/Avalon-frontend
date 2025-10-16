"use client";

import { create } from "zustand";

type Viewport = {
  center?: [number, number];
  zoom?: number;
};

type Filters = {
  q: string;
  subTypes: string[];
  onlyWatchlist: boolean;
};

type LiquidState = {
  vessels: any[];
  filtered: any[];
  selectedId: string | null;

  previewId: string | null;
  isPreviewOpen: boolean;

  filters: Filters;
  viewport: Viewport;

  watchlist: Set<string>;

  setAll: (rows: any[]) => void;
  setFiltered: (rows: any[]) => void;

  setSelectedId: (id: string | null) => void;

  setFilters: (patch: Partial<Filters>) => void;
  clearFilters: () => void;

  setViewport: (vp: Partial<Viewport>) => void;

  openPreview: (id: string) => void;
  closePreview: () => void;

  toggleWatch: (id: string) => void;
  hydrate: () => void;
};

const WL_KEY = "liquid:watchlist";

export const useLiquidStore = create<LiquidState>((set, get) => ({
  vessels: [],
  filtered: [],
  selectedId: null,

  previewId: null,
  isPreviewOpen: false,

  filters: { q: "", subTypes: [], onlyWatchlist: false },
  viewport: {},

  watchlist: new Set<string>(),

  setAll: (rows) => set({ vessels: rows }),
  setFiltered: (rows) => set({ filtered: rows }),

  setSelectedId: (id) => set({ selectedId: id }),

  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  clearFilters: () =>
    set((s) => ({
      filters: { ...s.filters, q: "", subTypes: [], onlyWatchlist: false },
    })),

  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),

  openPreview: (id) =>
    set({ previewId: id, isPreviewOpen: true, selectedId: id }),
  closePreview: () => set({ isPreviewOpen: false }),

  toggleWatch: (id) => {
    const next = new Set(get().watchlist);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    try {
      localStorage.setItem(WL_KEY, JSON.stringify(Array.from(next)));
    } catch {}
    set({ watchlist: next });
  },

  hydrate: () => {
    try {
      const raw = localStorage.getItem(WL_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        set({ watchlist: new Set(arr) });
      }
    } catch {}
  },
}));
