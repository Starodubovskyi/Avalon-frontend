"use client";

import React from "react";
import LeftSidebar from "@/components/profile/leftSidebar";
import { ActivityTabs } from "@/components/profile/activityTabs";
import SubscriptionPanel from "@/components/profile/subscriptionPanel";
import Tags from "@/components/profile/tags";
import Sidebar from "@/components/Sidebar";

const ProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />

      <main className="flex flex-col lg:flex-row gap-6 p-6 flex-1">
        <div className="flex-1 flex flex-col gap-6">
          <LeftSidebar />
          <ActivityTabs />
        </div>

        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          <SubscriptionPanel />
          <Tags />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
