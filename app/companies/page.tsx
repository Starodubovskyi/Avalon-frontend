"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Globe, Building2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const companiesData = [
  {
    name: "AVS Global Ship Supply",
    category: "Ship Services / Suppliers",
    country: "🇹🇷",
    city: "Istanbul",
    logoUrl: "/logos/avs.png",
  },
  {
    name: "ASCA MARITIME FZE",
    category: "Ship Chandlers",
    country: "🇦🇪",
    city: "Al Hamriyah",
    logoUrl: "/logos/asca.png",
  },
  {
    name: "The Web Factory",
    category: "Software / Technology",
    country: "🇺🇸",
    city: "Dover",
    logoUrl: "",
  },
  {
    name: "Qbecus",
    category: "Software / Technology",
    country: "🇺🇸",
    city: "Boulder",
    logoUrl: "",
  },
];

const businessSectors = [
  {
    letter: "S",
    sectors: ["Software / Technology", "Ship Chandlers", "Shipping Lines"],
  },
  {
    letter: "T",
    sectors: ["Taxi", "Telecommunications", "Tourism & Hospitality"],
  },
  { letter: "O", sectors: ["Offshore Services", "Oil and Gas"] },
];

const CompaniesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

 

  const router = useRouter();

  const filteredCompanies = companiesData.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry
      ? company.country === selectedCountry
      : true;
    const matchesCategory = selectedCategory
      ? company.category === selectedCategory
      : true;
    return matchesSearch && matchesCountry && matchesCategory;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedCategory("");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar/>
        

      <div className="flex-1 flex flex-col bg-muted/40">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="default"
                onClick={() => router.back()}
                className="rounded-full bg-black text-white hover:bg-gray-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center flex-1">
                Companies
              </h1>
              <div className="w-[100px]" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-4">
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md rounded-full px-4 py-2 text-base border border-gray-300 dark:border-gray-700"
              />

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-[150px] rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Country</option>
                <option value="🇹🇷">🇹🇷 Turkey</option>
                <option value="🇦🇪">🇦🇪 UAE</option>
                <option value="🇺🇸">🇺🇸 USA</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-[200px] rounded-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
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
                className="rounded-full px-6 py-2 text-base font-medium bg-black text-white hover:bg-gray-800"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>

              <Button
                onClick={resetFilters}
                className="rounded-full px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Reset
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
              {filteredCompanies.length} companies found
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                Featured Companies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCompanies.length === 0 ? (
                  <div className="h-32 rounded-xl col-span-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : (
                  filteredCompanies.map((company, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="rounded-2xl shadow-md dark:bg-gray-800 transition-transform hover:scale-[1.02] hover:shadow-lg">
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200">
                                {company.category}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                <Globe className="w-4 h-4" /> {company.country}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                Business Sectors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {businessSectors.map((group, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow"
                  >
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                      {group.letter}
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {group.sectors.map((sector, j) => (
                        <li
                          key={j}
                          className="text-sm text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
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
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CompaniesPage;
