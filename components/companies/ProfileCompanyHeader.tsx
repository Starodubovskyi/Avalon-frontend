"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useCallback } from "react";

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
    <>
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
        {title}
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md rounded-full px-4 py-2 text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors duration-300"
        />

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-[150px] rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-sm transition-colors duration-300"
        >
          <option value="">Country</option>
          <option value="🇹🇷">🇹🇷 Turkey</option>
          <option value="🇦🇪">🇦🇪 UAE</option>
          <option value="🇺🇸">🇺🇸 USA</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-[200px] rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-900 dark:text-white text-sm transition-colors duration-300"
        >
          <option value="">Category</option>
          <option value="Ship Services / Suppliers">
            Ship Services / Suppliers
          </option>
          <option value="Ship Chandlers">Ship Chandlers</option>
          <option value="Software / Technology">Software / Technology</option>
          <option value="Agency">Agency</option>
          <option value="Logistics">Logistics</option>
          <option value="Crew Management">Crew Management</option>
        </select>

        <Button
          variant="default"
          onClick={onSearch}
          className="rounded-full px-6 py-2 text-base font-medium bg-black text-white hover:bg-gray-800 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors duration-300"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>

        <Button
          onClick={onReset}
          className="rounded-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
        >
          Reset
        </Button>
      </div>
    </>
  );
}
