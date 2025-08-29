"use client";

import { useRouter } from "next/navigation";
import type { Company } from "@/components/types/company.types";

export default function CompanyListItem({ company }: { company: Company }) {
  const router = useRouter();
  const go = () => router.push(`/companies/${encodeURIComponent(company.id)}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") go();
      }}
      className="
        group cursor-pointer block rounded-2xl
        border border-gray-200 dark:border-white/10
        bg-white/70 dark:bg-neutral-900/60
        p-4 hover:shadow transition
      "
    >
      <div className="flex items-center gap-3">
        <img
          src={company.logoUrl || "/placeholder-company.png"}
          alt={company.businessName}
          className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-neutral-800"
        />
        <div className="min-w-0">
          <div className="font-semibold truncate">{company.businessName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {(company.activity || "—") +
              (company.city ? ` • ${company.city}` : "") +
              (company.country ? ` ${company.country}` : "")}
          </div>
        </div>
      </div>
    </div>
  );
}
