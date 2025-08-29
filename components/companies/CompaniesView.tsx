"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search, Globe, Building2 } from "lucide-react";
import MainLayout from "../layout/MainLayout";

interface Company {
  id?: string;
  name: string;
  category: string;
  country: string;
  city: string;
  logoUrl: string;
}

interface BusinessSectorGroup {
  letter: string;
  sectors: string[];
}

interface CompaniesViewProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  resetFilters: () => void;
  filteredCompanies: Company[];
  businessSectors: BusinessSectorGroup[];
  onCompanyClick: (id?: string) => void; // ⬅️ новый проп
}

const CompaniesView: React.FC<CompaniesViewProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCountry,
  setSelectedCountry,
  selectedCategory,
  setSelectedCategory,
  resetFilters,
  filteredCompanies,
  businessSectors,
  onCompanyClick,
}) => {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div
            className="
              w-full
              rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
              dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            "
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
                Companies
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-4">
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="Software / Technology">
                    Software / Technology
                  </option>
                </select>

                <Button
                  variant="default"
                  className="rounded-full px-6 py-2 text-base font-medium bg-black text-white hover:bg-gray-800 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors duration-300"
                >
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>

                <Button
                  onClick={resetFilters}
                  className="rounded-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Reset
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center transition-colors duration-300">
                {filteredCompanies.length} companies found
              </p>

              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors duration-300">
                  Featured Companies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCompanies.length === 0 ? (
                    <div className="h-32 rounded-xl col-span-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  ) : (
                    filteredCompanies.map((company, idx) => (
                      <motion.div
                        key={company.id ?? idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        role="button"
                        tabIndex={0}
                        data-company-id={company.id}
                        onClick={() => onCompanyClick(company.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onCompanyClick(company.id);
                          }
                        }}
                        className="cursor-pointer"
                        aria-label={`Open ${company.name} profile`}
                      >
                        <Card className="rounded-2xl shadow-md dark:shadow-lg bg-white dark:bg-[#1a1a1a] transition-[transform,box-shadow] duration-300 hover:scale-[1.02] hover:shadow-lg">
                          <CardContent className="p-5 flex items-center gap-4">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={company.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                {company.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 transition-colors duration-300">
                                  {company.category}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                  <Globe className="w-4 h-4" />{" "}
                                  {company.country}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {company.city}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors duration-300">
                  Business Sectors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {businessSectors.map((group, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 dark:bg-[#1a1a1a] p-4 rounded-xl shadow transition-colors duration-300"
                    >
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white transition-colors duration-300">
                        {group.letter}
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {group.sectors.map((sector, j) => (
                          <li
                            key={j}
                            className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors duration-300"
                          >
                            {sector}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CompaniesView;
