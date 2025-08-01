"use client";

import { useEffect, useState } from "react";
import TopProfileNavbar from "@/components/shared/TopProfileNavbar";
import UserProfile from "@/components/profile/UserProfile";
import CompanyProfile from "@/components/profile/CompanyProfile";
import EditProfile from "@/components/profile/EditProfile";
import OnlineServices from "@/components/profile/OnlineServices";
import MySubscriptions from "@/components/profile/MySubscriptions";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        onEditProfileClick={() => setActiveTab("edit")}
        isLoggedIn={Boolean(currentUser)}
        currentUser={currentUser}
      />
      <div className="flex-1 p-6">
        <TopProfileNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
  );
}
