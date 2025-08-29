"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CompaniesView from "./CompaniesView";

import { useAdminCompaniesStore } from "@/components/admin/companies/store/adminCompaniesStore";
import { adminCompaniesMock } from "@/components/admin/companies/mock";

type Company = {
  id?: string;
  name: string;
  category: string;
  country: string;
  city: string;
  logoUrl: string;
};

const VISIBLE_STATUSES = new Set(["published"] as const);

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

export default function CompaniesContainer() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const adminItems = useAdminCompaniesStore((s) => s.items);
  const source = adminItems.length > 0 ? adminItems : adminCompaniesMock;

  const companiesData: Company[] = useMemo(() => {
    return source
      .filter((it) => VISIBLE_STATUSES.has(it.status as any))
      .map(({ id, name, category, country, city, logoUrl }) => ({
        id,
        name,
        category,
        country,
        city,
        logoUrl,
      }));
  }, [source]);

  const filteredCompanies = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return companiesData.filter((company) => {
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.category.toLowerCase().includes(q) ||
        company.city.toLowerCase().includes(q);

      const matchesCountry = selectedCountry
        ? company.country === selectedCountry
        : true;
      const matchesCategory = selectedCategory
        ? company.category === selectedCategory
        : true;

      return matchesSearch && matchesCountry && matchesCategory;
    });
  }, [companiesData, searchTerm, selectedCountry, selectedCategory]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedCategory("");
  };

  const onCompanyClick = (id?: string) => {
    if (!id) return;
    router.push(`/companies/${encodeURIComponent(id)}`);
  };

  return (
    <CompaniesView
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCountry={selectedCountry}
      setSelectedCountry={setSelectedCountry}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      resetFilters={resetFilters}
      filteredCompanies={filteredCompanies}
      businessSectors={businessSectors}
      onCompanyClick={onCompanyClick}
    />
  );
}
