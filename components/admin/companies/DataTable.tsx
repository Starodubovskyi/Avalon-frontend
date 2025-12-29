"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";
import type { AdminCompany } from "./types";
import CompanyRow from "./CompanyRow";
import EmptyState from "./EmptyState";

interface Props {
  items: AdminCompany[];
  onQuickEdit: (c: AdminCompany) => void;
  onHistory: (c: AdminCompany) => void;
}

export default function DataTable({ items, onQuickEdit, onHistory }: Props) {
  const {
    selectedIds,
    toggleSelect,
    setSort,
    sort,
    selectAll,
    clearSelection,
  } = useAdminCompaniesStore();

  if (items.length === 0) {
    return <EmptyState />;
  }

  const allOnPageSelected =
    items.length > 0 && items.every((x) => selectedIds.includes(x.id));

  return (
    <div className="rounded-[2rem] border border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-white/5 overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200/50 dark:border-white/5">
            <tr>
              <th className="px-6 py-4 w-12">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={(v) => {
                    if (v) selectAll(items.map((x) => x.id));
                    else clearSelection();
                  }}
                  className="rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </th>
              {(
                [
                  ["name", "Company"],
                  ["category", "Category"],
                  ["country", "Country"],
                  ["city", "City"],
                  ["status", "Status"],
                  ["completeness", "Profile"],
                  ["updatedAt", "Updated"],
                ] as const
              ).map(([field, label]) => (
                <th
                  key={field}
                  className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setSort(field as any)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <ArrowUpDown
                      className={
                        "h-3 w-3 " +
                        (sort.field === field
                          ? "opacity-100 text-blue-500"
                          : "opacity-30")
                      }
                    />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {items.map((it) => (
              <CompanyRow
                key={it.id}
                company={it}
                selected={selectedIds.includes(it.id)}
                onToggleSelect={() => toggleSelect(it.id)}
                onQuickEdit={() => onQuickEdit(it)}
                onHistory={() => onHistory(it)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
