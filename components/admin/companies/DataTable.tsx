"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";
import type { AdminCompany } from "./types";
import CompanyRow from "./CompanyRow";

interface Props {
  items: AdminCompany[];
  onQuickEdit: (c: AdminCompany) => void;
  onHistory: (c: AdminCompany) => void;
}

const card =
  "rounded-3xl border border-gray-200/70 bg-white/95 shadow-[0_8px_30px_rgba(2,6,23,0.06)] backdrop-blur-sm " +
  "dark:bg-neutral-900/70 dark:border-white/10 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

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
    return (
      <div className={card + " p-10 text-center border-dashed"}>
        <div className="text-base text-gray-700 dark:text-gray-300">
          No companies found
        </div>
      </div>
    );
  }

  const allOnPageSelected =
    items.length > 0 && items.every((x) => selectedIds.includes(x.id));

  return (
    <div className={card + " overflow-x-auto"}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
        <thead className="bg-gray-50/80 dark:bg-white/5">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
              <Checkbox
                checked={allOnPageSelected}
                onCheckedChange={(v) => {
                  if (v) {
                    selectAll(items.map((x) => x.id));
                  } else {
                    clearSelection();
                  }
                }}
              />
            </th>
            {(
              [
                ["name", "Name"],
                ["category", "Category"],
                ["country", "Country"],
                ["city", "City"],
                ["status", "Status"],
                ["completeness", "Complete"],
                ["updatedAt", "Updated"],
              ] as const
            ).map(([field, label]) => (
              <th
                key={field}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 whitespace-nowrap"
              >
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => setSort(field as any)}
                >
                  {label}
                  <ArrowUpDown
                    className={
                      "h-3.5 w-3.5 " +
                      (sort.field === field ? "opacity-100" : "opacity-50")
                    }
                  />
                </button>
              </th>
            ))}
            <th className="px-3 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10 bg-white/70 dark:bg-transparent">
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
  );
}
