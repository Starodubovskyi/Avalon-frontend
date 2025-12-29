"use client";
import { useMemo, useState } from "react";
import FiltersBar from "./FiltersBar";
import DataTable from "./DataTable";
import BulkActionsBar from "./BulkActionsBar";
import QuickEditDrawer from "./QuickEditDrawer";
import HistoryDrawer from "./HistoryDrawer";
import MergeDialog from "./MergeDialog";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";
import type { AdminCompany, CompanyStatus } from "./types";
import clsx from "clsx";

const GLASS_CARD =
  "rounded-[2.5rem] border border-gray-200/50 bg-white/80 shadow-xl shadow-black/5 backdrop-blur-xl " +
  "dark:bg-[#0d1117]/80 dark:border-white/5 dark:shadow-black/20";

interface Props {
  items: AdminCompany[];
  filters: {
    search: string;
    country: string | "all";
    category: string | "all";
    status: CompanyStatus | "all";
  };
  setFilter: <K extends keyof Props["filters"]>(
    k: K,
    v: Props["filters"][K]
  ) => void;
  resetFilters: () => void;
  countries: string[];
  categories: string[];
  statuses: CompanyStatus[];
  selectedIds: string[];
  allIds: string[];
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export default function AdminCompaniesView(props: Props) {
  const store = useAdminCompaniesStore();
  const [quickEdit, setQuickEdit] = useState<AdminCompany | null>(null);
  const [historyFor, setHistoryFor] = useState<AdminCompany | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const selectedCount = props.selectedIds.length;
  const mergeCandidates = useMemo(
    () => props.items.filter((x) => props.selectedIds.includes(x.id)),
    [props.items, props.selectedIds]
  );

  return (
    <div className="w-full">
      <div
        className={clsx(
          GLASS_CARD,
          "p-6 sm:p-8 lg:p-10 min-h-[calc(100vh-1rem)]"
        )}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-8 tracking-tight">
          Admin · Companies
        </h1>

        <FiltersBar
          filters={props.filters}
          setFilter={props.setFilter}
          resetFilters={props.resetFilters}
          countries={props.countries}
          categories={props.categories}
          statuses={props.statuses}
        />

        {selectedCount > 0 && (
          <BulkActionsBar
            selectedCount={selectedCount}
            onSelectAll={() => props.selectAll(props.allIds)}
            onClear={() => props.clearSelection()}
            onPublish={() => store.bulkChangeStatus("published")}
            onSuspend={() => store.bulkChangeStatus("suspended")}
            onArchive={() => store.bulkChangeStatus("archived")}
            onAddTag={() => store.addTagToSelected("priority")}
            onRemoveTag={() => store.removeTagFromSelected("priority")}
            onDelete={() => store.softDeleteSelected()}
            onMerge={() => setMergeOpen(true)}
          />
        )}

        <DataTable
          items={props.items}
          onQuickEdit={(c) => setQuickEdit(c)}
          onHistory={(c) => setHistoryFor(c)}
        />
      </div>

      <QuickEditDrawer
        open={!!quickEdit}
        company={quickEdit}
        onClose={() => setQuickEdit(null)}
        onSave={(id, patch) => {
          store.quickUpdate(id, patch);
          setQuickEdit(null);
        }}
      />

      <HistoryDrawer
        open={!!historyFor}
        company={historyFor}
        onClose={() => setHistoryFor(null)}
      />

      <MergeDialog
        open={mergeOpen}
        companies={mergeCandidates}
        onClose={() => setMergeOpen(false)}
      />
    </div>
  );
}
