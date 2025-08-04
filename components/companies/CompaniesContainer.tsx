// components/companies/CompaniesContainer.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompaniesView from "./CompaniesView"; 


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

const CompaniesContainer = () => {
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

  const handleBackClick = () => {
    router.back();
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
      onBackClick={handleBackClick}
    />
  );
};

export default CompaniesContainer; 