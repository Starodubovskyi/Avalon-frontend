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
        const daysLeft = Math.ceil((Date.parse(c.expiryIso) - now) / (24 * 3600 * 1000));
        return { ...c, vesselName: v?.name || "-", daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [certificates, vessels]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm opacity-70">Certificates expiring soon</div>
        <div className="text-xs opacity-60">{rows.length} items</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr className="text-left">
              <Th>Vessel</Th>
              <Th>Certificate</Th>
              <Th>Expiry</Th>
              <Th>Days left</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5">
                <Td>{r.vesselName}</Td>
                <Td>{r.name}</Td>
                <Td>{new Date(r.expiryIso).toLocaleDateString()}</Td>
                <Td className={r.daysLeft <= 7 ? "text-rose-600" : r.daysLeft <= 30 ? "text-amber-600" : ""}>
                  {r.daysLeft}d
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm opacity-60">
                  No data
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
  return <th className="px-4 py-2 font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-2 ${className || ""}`}>{children}</td>;
}
