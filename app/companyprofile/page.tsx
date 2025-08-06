"use client";

import MainLayout from "@/components/layout/MainLayout";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";
import dynamic from "next/dynamic";

const CompanyProfile = dynamic(
  () => import("@/components/companyprofile/CompanyProfile"),
  {
    ssr: false,
  }
);

export default function CompanyProfilePage() {
  // На этой странице мы просто рендерим компонент CompanyProfile
  // Навигация будет работать благодаря TopProfileNavbar
  return (
    <MainLayout>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 p-6">
          <TopProfileNavbar />
          <div className="mt-6">
            <CompanyProfile />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
