"use client";

import React from "react";
import VesselsPage from "@/components/vessels/VesselsPage";
import MainLayout from "@/components/layout/MainLayout";

const Page: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a]">
        <VesselsPage />
      </div>
    </MainLayout>
  );
};

export default Page;
