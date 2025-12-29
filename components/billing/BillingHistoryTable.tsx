"use client";

import { useMemo, useState } from "react";
import FilterMenu, { FilterValue } from "./FilterMenu";
import StatusBadge from "./StatusBadge";
import { Invoice } from "../types/billing/types";
import { Clock, Download } from "lucide-react";

export default function BillingHistoryTable({
  surfaceClass,
  invoices,
}: {
  surfaceClass: string;
  invoices: Invoice[];
}) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const rows = useMemo(() => {
    if (filter === "all") return invoices;
    if (filter === "paid") return invoices.filter((i) => i.status === "paid");
    return invoices.filter((i) => i.status === "failed");
  }, [filter, invoices]);

  return (
    <div className={`${surfaceClass}`}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="text-gray-400 w-5 h-5" />
          Billing History
        </h3>
        <FilterMenu value={filter} onChange={setFilter} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th scope="col" className="px-8 py-4 first:rounded-tl-2xl">
                Date
              </th>
              <th scope="col" className="px-8 py-4">
                Description
              </th>
              <th scope="col" className="px-8 py-4">
                Amount
              </th>
              <th scope="col" className="px-8 py-4">
                Status
              </th>
              <th
                scope="col"
                className="px-8 py-4 last:rounded-tr-2xl text-right"
              >
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {rows.map((i) => (
              <tr
                key={i.id}
                className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <td className="px-8 py-5 text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                  {i.date}
                </td>
                <td className="px-8 py-5 text-gray-600 dark:text-gray-400">
                  {i.description}
                </td>
                <td className="px-8 py-5 text-gray-900 dark:text-white font-bold">
                  ${i.amount.toFixed(2)}
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={i.status} />
                </td>
                <td className="px-8 py-5 text-right">
                  {i.invoiceUrl ? (
                    <a
                      href={i.invoiceUrl}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <Download size={14} /> Download
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      Unavailable
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  className="px-8 py-12 text-center text-gray-500 dark:text-gray-400 italic"
                  colSpan={5}
                >
                  No invoices found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
