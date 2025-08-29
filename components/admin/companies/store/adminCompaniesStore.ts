"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AdminCompany,
  CompanyStatus,
} from "@/components/admin/companies/types";
import { adminCompaniesMock } from "@/components/admin/companies/mock";

type SortField =
  | "name"
  | "updatedAt"
  | "completeness"
  | "status"
  | "country"
  | "city";
export type SortDir = "asc" | "desc";

type Filters = {
  search: string;
  country: string | "all";
  category: string | "all";
  status: CompanyStatus | "all";
};
type State = {
  items: AdminCompany[];
  filters: Filters;
  selectedIds: string[];
  sort: { field: SortField; dir: SortDir };
  setFilter: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  setSort: (field: SortField) => void;
  quickUpdate: (id: string, patch: Partial<AdminCompany>) => void;
  quickUpdateStatus: (id: string, status: CompanyStatus) => void;
  bulkChangeStatus: (status: CompanyStatus) => void;
  softDeleteSelected: () => void;
  addTagToSelected: (tag: string) => void;
  removeTagFromSelected: (tag: string) => void;
  loadMock: () => void;
};

export const useAdminCompaniesStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      filters: { search: "", country: "all", category: "all", status: "all" },
      selectedIds: [],
      sort: { field: "updatedAt", dir: "desc" },

      setFilter: (k, v) => set((s) => ({ filters: { ...s.filters, [k]: v } })),
      resetFilters: () =>
        set({
          filters: {
            search: "",
            country: "all",
            category: "all",
            status: "all",
          },
        }),

      toggleSelect: (id) =>
        set((s) =>
          s.selectedIds.includes(id)
            ? { selectedIds: s.selectedIds.filter((x) => x !== id) }
            : { selectedIds: [...s.selectedIds, id] }
        ),
      clearSelection: () => set({ selectedIds: [] }),
      selectAll: (ids) => set({ selectedIds: ids }),

      setSort: (field) =>
        set((s) => {
          const dir =
            s.sort.field === field && s.sort.dir === "asc" ? "desc" : "asc";
          return { sort: { field, dir } };
        }),

      quickUpdate: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? { ...it, ...patch, updatedAt: new Date().toISOString() }
              : it
          ),
        })),

      quickUpdateStatus: (id, status) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? { ...it, status, updatedAt: new Date().toISOString() }
              : it
          ),
        })),

      bulkChangeStatus: (status) =>
        set((s) => ({
          items: s.items.map((it) =>
            s.selectedIds.includes(it.id)
              ? { ...it, status, updatedAt: new Date().toISOString() }
              : it
          ),
        })),

      softDeleteSelected: () =>
        set((s) => ({
          items: s.items.filter((it) => !s.selectedIds.includes(it.id)),
          selectedIds: [],
        })),

      addTagToSelected: (tag) =>
        set((s) => ({
          items: s.items.map((it) =>
            s.selectedIds.includes(it.id)
              ? { ...it, tags: Array.from(new Set([...(it.tags || []), tag])) }
              : it
          ),
        })),

      removeTagFromSelected: (tag) =>
        set((s) => ({
          items: s.items.map((it) =>
            s.selectedIds.includes(it.id)
              ? { ...it, tags: (it.tags || []).filter((t) => t !== tag) }
              : it
          ),
        })),

      loadMock: () => set({ items: adminCompaniesMock }),
    }),
    { name: "admin-companies-store" }
  )
);
