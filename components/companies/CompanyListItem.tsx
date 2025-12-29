"use client";

import { useRouter } from "next/navigation";
import type { Company } from "@/components/types/company.types";
import clsx from "clsx";
import { Building2 } from "lucide-react";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
        group relative flex items-center gap-5 p-5 rounded-[2rem]
        bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5
        shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1
        transition-all duration-300 cursor-pointer h-full
      "
    >
      <div className="relative shrink-0">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.businessName}
            className="w-16 h-16 rounded-2xl object-cover ring-1 ring-gray-100 dark:ring-white/10 group-hover:ring-blue-500/50 transition-all shadow-sm"
          />
        ) : (
          <div
            className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md",
              GRADIENT_BG
            )}
          >
            <Building2 className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-bold text-xl text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {company.businessName}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 truncate flex flex-wrap items-center gap-2 mt-1">
          <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
            {company.activity || "Company"}
          </span>
          {(company.city || company.country) && (
            <span className="truncate text-gray-400 dark:text-gray-500">
              {company.city ? `${company.city}, ` : ""}
              {company.country}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
