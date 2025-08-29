"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { getPublicCompanyById } from "@/components/utils/publicCompanies";
import ProfileCompanyHeader from "@/components/companies/ProfileCompanyHeader";
import ProfileCompanyBreadcrumbs from "@/components/companies/ProfileCompanyBreadcrumbs";
import MainLayout from "@/components/layout/MainLayout";

const CompanyCard = dynamic(
  () => import("@/components/companyprofile/CompanyCard"),
  { ssr: false }
);

export default function CompanyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const company = useMemo(() => getPublicCompanyById(params.id), [params.id]);
  if (!company) return notFound();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const onSearch = () => {
    const q = new URLSearchParams();
    if (searchTerm) q.set("q", searchTerm);
    if (selectedCountry) q.set("country", selectedCountry);
    if (selectedCategory) q.set("category", selectedCategory);
    router.push(`/companies${q.toString() ? `?${q.toString()}` : ""}`);
  };

  const onReset = () => {
    setSearchTerm("");
    setSelectedCountry("");
    setSelectedCategory("");
    router.push("/companies");
  };

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div
            className="
          w-full rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
          dark:bg-white/5 dark:border-white/10
          dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          "
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <ProfileCompanyHeader
                title="Companies"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSearch={onSearch}
                onReset={onReset}
              />

              <ProfileCompanyBreadcrumbs
                items={[
                  { label: "Companies", href: "/companies" },
                  { label: company.businessName },
                ]}
              />

              <CompanyCard company={company} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
