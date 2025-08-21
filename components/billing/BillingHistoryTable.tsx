"use client";

import { useMemo, useState } from "react";
import FilterMenu, { FilterValue } from "./FilterMenu";
import StatusBadge from "./StatusBadge";
import { Invoice } from "../types/billing/types";

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
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Billing History
        </h3>
        <FilterMenu value={filter} onChange={setFilter} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <th scope="col" className="px-4 sm:px-6 py-3">Date</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Description</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Amount</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Status</th>
              <th scope="col" className="px-4 sm:px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id} className="border-t border-gray-100 dark:border-white/10">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{i.date}</td>
                <td className="px-4 sm:px-6 py-4">{i.description}</td>
                <td className="px-4 sm:px-6 py-4">${i.amount.toFixed(2)}</td>
                <td className="px-4 sm:px-6 py-4">
                  <StatusBadge status={i.status} />
                </td>
                <td className="px-4 sm:px-6 py-4">
                  {i.invoiceUrl ? (
                    <a
                      href={i.invoiceUrl}
                      className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:opacity-80 dark:text-white"
                    >
                      Download Invoice
                    </a>
                  ) : (
                    <span className="text-gray-400">No Action Available</span>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-4 sm:px-6 py-10 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                  No invoices for this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
