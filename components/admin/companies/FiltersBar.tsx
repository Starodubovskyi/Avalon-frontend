"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { CompanyStatus } from "./types";

const inputBase =
  "w-full rounded-xl border px-3 py-2 text-sm " +
  "bg-white border-gray-300 text-gray-900 " +
  "dark:bg-neutral-900/60 dark:border-white/15 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

type Props = {
  filters: {
    search: string;
    country: string | "all";
    category: string | "all";
    status: CompanyStatus | "all";
  };
  setFilter: <K extends keyof Props["filters"]>(
    k: K,
    v: Props["filters"][K]
  ) => void;
  resetFilters: () => void;
  countries: string[];
  categories: string[];
  statuses: CompanyStatus[];
};

export default function FiltersBar({
  filters,
  setFilter,
  resetFilters,
  countries,
  categories,
  statuses,
}: Props) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        <div className="relative min-w-0 flex-1 lg:flex-[2]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search companies…"
            className={`${inputBase} pl-9 h-11 md:h-12 text-[15px]`}
          />
        </div>

        <div className="w-full lg:flex-[3] grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          <div className="w-full">
            <Select
              value={filters.country}
              onValueChange={(v) => setFilter("country", v as any)}
            >
              <SelectTrigger className={inputBase}>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <Select
              value={filters.category}
              onValueChange={(v) => setFilter("category", v as any)}
            >
              <SelectTrigger className={inputBase}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full">
            <Select
              value={filters.status}
              onValueChange={(v) => setFilter("status", v as any)}
            >
              <SelectTrigger className={inputBase}>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="justify-self-end self-stretch">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              className="
                h-9 px-3 rounded-full text-xs
                border border-gray-200 bg-white text-gray-700
                hover:bg-gray-50
                dark:bg-transparent dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5
                whitespace-nowrap
              "
              title="Reset filters"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
