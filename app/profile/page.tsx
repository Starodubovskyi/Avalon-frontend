"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import TopProfileNavbar from "@/components/profile/TopProfileNavbar";
import UserProfile from "@/components/profile/UserProfile";
import MainLayout from "@/components/layout/MainLayout";
import BackgroundAnimation from "@/components/layout/BackgroundAnimation";

const CompanyProfile = dynamic(
  () => import("@/components/companyprofile/CompanyProfile"),
  {
    ssr: false,
  }
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
      <div className="relative flex min-h-screen">
        <BackgroundAnimation />
        <div
          className="
          flex-1 p-6
          bg-white/10
          border border-gray-200
          shadow
          dark:bg-black/20
          dark:border-white/10
          dark:shadow-white/10
          backdrop-blur-md
        "
        >
          <TopProfileNavbar />
          <div className="mt-6">{renderTab()}</div>
        </div>
      </div>
    </MainLayout>
  );
}
