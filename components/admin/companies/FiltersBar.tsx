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
import clsx from "clsx";

const inputBase =
  "w-full rounded-full border-none px-4 py-2.5 text-sm " +
  "bg-gray-100/50 text-gray-900 " +
  "dark:bg-white/5 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm";

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
    <div className="mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Search */}
        <div className="relative min-w-0 flex-1 lg:flex-[2] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search companies…"
            className={`${inputBase} pl-12 h-12 text-base`}
          />
        </div>

        <div className="w-full lg:flex-[3] grid grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          <div className="w-full">
            <Select
              value={filters.country}
              onValueChange={(v) => setFilter("country", v as any)}
            >
              <SelectTrigger className={clsx(inputBase, "h-12")}>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-white/10 dark:bg-[#161b22]">
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
              <SelectTrigger className={clsx(inputBase, "h-12")}>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-white/10 dark:bg-[#161b22]">
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
              <SelectTrigger className={clsx(inputBase, "h-12")}>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-white/10 dark:bg-[#161b22]">
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="justify-self-end w-full lg:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="
                w-full lg:w-auto h-12 px-6 rounded-full
                text-gray-500 hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-white/10
                transition-colors font-medium
              "
              title="Reset filters"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
