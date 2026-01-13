"use client";

import { useMemo, useState } from "react";
import { getPublicCompanies } from "@/components/utils/publicCompanies";
import CompanyListItem from "./CompanyListItem";
import { Search } from "lucide-react";

export default function PublicCompaniesView() {
  const all = useMemo(() => getPublicCompanies(), []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) =>
      [c.businessName, c.activity, c.city, c.country].some((v) =>
        (v ?? "").toString().toLowerCase().includes(q)
      )
    );
  }, [all, query]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Companies
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Discover trusted partners worldwide
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-lg mx-auto group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies by name, activity or location..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 py-10">
            No companies found.
          </p>
        ) : (
          filtered.map((c) => <CompanyListItem key={c.id} company={c} />)
        )}
      </div>
    </div>
  );
}
