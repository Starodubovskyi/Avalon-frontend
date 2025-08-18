"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";
import UserProfile from "@/components/profile/UserProfile";
import MainLayout from "@/components/layout/MainLayout";

const CompanyProfile = dynamic(
  () => import("@/components/companyprofile/CompanyProfile"),
  { ssr: false }
);
const EditProfile = dynamic(() => import("@/components/profile/EditProfile"), {
  ssr: false,
});

export default function ProfilePage() {
  const pathname = usePathname();

  const renderTab = () => {
    switch (pathname) {
      case "/profile":
        return <UserProfile />;
      default:
        return null;
    }
  };

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
              <TopProfileNavbar />
              <div className="mt-6">{renderTab()}</div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
