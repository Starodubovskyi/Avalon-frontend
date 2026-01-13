"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { useCallback } from "react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type Props = {
  title?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearch: () => void;
  onReset: () => void;
};

export default function ProfileCompanyHeader({
  title = "Companies",
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedCategory,
  setSelectedCategory,
  onSearch,
  onReset,
}: Props) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") onSearch();
    },
    [onSearch]
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white text-center tracking-tight">
        {title}
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center p-2">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-6 py-3 h-12 rounded-full bg-gray-100/50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all text-base shadow-sm"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full sm:w-[180px] h-12 px-6 py-3 rounded-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white text-sm transition-all outline-none shadow-sm appearance-none cursor-pointer font-medium"
          >
            <option value="">All Countries</option>
            <option value="🇹🇷">🇹🇷 Turkey</option>
            <option value="🇦🇪">🇦🇪 UAE</option>
            <option value="🇺🇸">🇺🇸 USA</option>
          </select>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-[220px] h-12 px-6 py-3 rounded-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white text-sm transition-all outline-none shadow-sm appearance-none cursor-pointer font-medium"
          >
            <option value="">All Categories</option>
            <option value="Ship Services / Suppliers">
              Ship Services / Suppliers
            </option>
            <option value="Ship Chandlers">Ship Chandlers</option>
            <option value="Software / Technology">Software / Technology</option>
            <option value="Agency">Agency</option>
            <option value="Logistics">Logistics</option>
            <option value="Crew Management">Crew Management</option>
          </select>
        </div>

        <Button
          variant="default"
          onClick={onSearch}
          className={clsx(
            "w-full sm:w-auto h-12 px-8 rounded-full font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 hover:shadow-blue-500/40 text-base",
            GRADIENT_BG
          )}
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>

        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full sm:w-auto h-12 px-6 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-semibold"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
