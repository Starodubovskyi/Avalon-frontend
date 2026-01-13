"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search, Globe, Building2, RotateCcw } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import clsx from "clsx";

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
  onCompanyClick: (id?: string) => void;
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
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-[#050505]">
        {/* <div className="px-2 py-2 w-full h-full"> */}
        <div
          className="
              w-full min-h-[calc(100vh-1rem)]
              rounded-[2.5rem] 
              bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl
              border border-gray-200 dark:border-white/5 
              shadow-xl shadow-black/5 dark:shadow-black/20
              overflow-hidden
            "
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-10 tracking-tight">
              Companies
            </h1>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8 p-1">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-2.5 h-12 rounded-full bg-gray-100/50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all text-base shadow-sm"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full sm:w-[180px] h-12 px-6 py-2.5 rounded-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white text-sm transition-all outline-none shadow-sm appearance-none cursor-pointer"
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
                  className="w-full sm:w-[220px] h-12 px-6 py-2.5 rounded-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-gray-900 dark:text-white text-sm transition-all outline-none shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Ship Services / Suppliers">
                    Ship Services
                  </option>
                  <option value="Ship Chandlers">Ship Chandlers</option>
                  <option value="Software / Technology">Technology</option>
                </select>
              </div>

              <Button
                variant="default"
                className={clsx(
                  "w-full sm:w-auto h-12 px-8 rounded-full font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-95 hover:shadow-blue-500/40 text-base",
                  GRADIENT_BG
                )}
              >
                <Search className="w-5 h-5 mr-2" /> Search
              </Button>

              <Button
                onClick={resetFilters}
                variant="ghost"
                className="w-full sm:w-auto h-12 px-6 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Reset
              </Button>
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 text-center">
              Found {filteredCompanies.length} companies
            </p>

            {/* Companies Grid */}
            <section className="mb-12">
              <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight px-2">
                Featured Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.length === 0 ? (
                  <div className="h-48 rounded-[2rem] col-span-full bg-gray-100 dark:bg-white/5 animate-pulse flex items-center justify-center text-gray-400 font-medium">
                    No companies found matching your criteria.
                  </div>
                ) : (
                  filteredCompanies.map((company, idx) => (
                    <motion.div
                      key={company.id ?? idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => onCompanyClick(company.id)}
                      className="group cursor-pointer h-full"
                    >
                      <div
                        className="
                            h-full flex items-center gap-5 p-6 rounded-[2rem]
                            bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5
                            hover:bg-white dark:hover:bg-[#1e2329] hover:border-blue-200 dark:hover:border-blue-500/30
                            hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1
                            transition-all duration-300
                        "
                      >
                        <div className="relative shrink-0">
                          {company.logoUrl ? (
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm border border-gray-100 dark:border-white/10"
                            />
                          ) : (
                            <div
                              className={clsx(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                GRADIENT_BG
                              )}
                            >
                              <Building2 className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {company.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2 mb-2">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-500/20">
                              {company.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5 truncate">
                              <Globe className="w-4 h-4" /> {company.country}
                            </span>
                            {company.city && (
                              <span className="truncate opacity-75">
                                • {company.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Sectors */}
            <section>
              <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight px-2">
                Business Sectors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {businessSectors.map((group, i) => (
                  <div
                    key={i}
                    className="bg-gray-50/80 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md",
                        GRADIENT_BG
                      )}
                    >
                      {group.letter}
                    </div>
                    <ul className="space-y-3">
                      {group.sectors.map((sector, j) => (
                        <li
                          key={j}
                          className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
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
      {/* </div> */}
    </MainLayout>
  );
};

export default CompaniesView;
