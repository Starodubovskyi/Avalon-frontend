"use client";

import { useMemo, useState } from "react";
import { getPublicCompanies } from "@/components/utils/publicCompanies";
import CompanyListItem from "./CompanyListItem";

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
    <div>
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Companies
        </h1>
      </div>

      <div className="mb-6">
        <div className="relative max-w-xl mx-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies…"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white border-gray-300 text-gray-900 dark:bg-neutral-900/60 dark:border-white/15 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <CompanyListItem key={c.id} company={c} />
        ))}
      </div>
    </div>
  );
}
