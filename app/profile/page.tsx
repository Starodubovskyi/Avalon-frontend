"use client";

import dynamic from "next/dynamic";

import {  useState } from "react";
import TopProfileNavbar from "@/components/shared/TopProfileNavbar";
import UserProfile from "@/components/profile/UserProfile";
const CompanyProfile = dynamic(() => import("@/components/profile/CompanyProfile/CompanyProfile"), {
  ssr: false,
});
import EditProfile from "@/components/profile/EditProfile";
import OnlineServices from "@/components/profile/OnlineServices";
import MySubscriptions from "@/components/profile/MySubscriptions";
import MainLayout from "@/components/layout/MainLayout";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");

 
  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile />;
      case "company":
        return <CompanyProfile />;
      case "edit":
        return <EditProfile />;
      case "services":
        return <OnlineServices />;
      case "subscriptions":
        return <MySubscriptions />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-6">
        <TopProfileNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
    </MainLayout>
  );
}
