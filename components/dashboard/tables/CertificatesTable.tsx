"use client";

import { useMemo } from "react";
import { useDashboardStore } from "../store";

export default function CertificatesTable() {
  const { certificates, vessels } = useDashboardStore();
  const rows = useMemo(() => {
    const now = Date.now();
    return certificates
      .map((c) => {
        const v = vessels.find((x) => x.id === c.vesselId);
        const daysLeft = Math.ceil(
          (Date.parse(c.expiryIso) - now) / (24 * 3600 * 1000)
        );
        return { ...c, vesselName: v?.name || "-", daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [certificates, vessels]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Certificates expiring soon
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {rows.length} items
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
            <tr className="text-left text-gray-500 dark:text-gray-400">
              <Th>Vessel</Th>
              <Th>Certificate</Th>
              <Th>Expiry</Th>
              <Th>Days left</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors"
              >
                <Td className="font-medium text-gray-900 dark:text-gray-100">
                  {r.vesselName}
                </Td>
                <Td className="text-gray-600 dark:text-gray-300">{r.name}</Td>
                <Td className="text-gray-500 dark:text-gray-400">
                  {new Date(r.expiryIso).toLocaleDateString()}
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                    ${
                      r.daysLeft <= 7
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                        : r.daysLeft <= 30
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                    }`}
                  >
                    {r.daysLeft}d
                  </span>
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No certificates expiring soon.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-5 py-3 whitespace-nowrap ${className || ""}`}>
      {children}
    </td>
  );
}
