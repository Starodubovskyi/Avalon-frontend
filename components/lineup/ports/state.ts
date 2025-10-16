import { create } from "zustand";

type Status = "Open" | "Closed" | "Congested";

export type RadiusFilter = {
  center?: { lat: number; lng: number } | null;
  km: number;
} | null;

export type PortsStore = {
  q: string;
  setQ: (v: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  sortKey: "name" | "country" | "unlocode" | "arrivals" | "status";
  sortDir: "asc" | "desc";
  setSort: (k: PortsStore["sortKey"]) => void;
  status: Set<Status> | null;
  toggleStatus: (s: Status) => void;
  clearStatus: () => void;
  radius: RadiusFilter;
  setRadius: (r: RadiusFilter) => void;
  density: "cozy" | "dense";
  toggleDensity: () => void;
  tableFocusIndex: number;
  setTableFocusIndex: (dir: "next" | "prev" | number) => void;
};

export const usePortsStore = create<PortsStore>((set, get) => ({
  q: "",
  setQ: (v) => set({ q: v }),
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  sortKey: "name",
  sortDir: "asc",
  setSort: (k) => {
    const { sortKey, sortDir } = get();
    if (sortKey === k) set({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    else set({ sortKey: k, sortDir: "asc" });
  },
  status: null,
  toggleStatus: (s) => {
    const cur = get().status ? new Set(get().status) : new Set<Status>();
    if (cur.has(s)) cur.delete(s);
    else cur.add(s);
    set({ status: cur.size ? cur : null });
  },
  clearStatus: () => set({ status: null }),
  radius: null,
  setRadius: (r) => set({ radius: r }),
  density: "cozy",
  toggleDensity: () =>
    set({ density: get().density === "cozy" ? "dense" : "cozy" }),
  tableFocusIndex: -1,
  setTableFocusIndex: (dir) => {
    if (typeof dir === "number") set({ tableFocusIndex: dir });
    else {
      const cur = get().tableFocusIndex;
      set({ tableFocusIndex: dir === "next" ? cur + 1 : Math.max(0, cur - 1) });
    }
  },
}));
