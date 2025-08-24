"use client";

import React from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";

const VesselsPage = dynamic(() => import("@/components/vessels/VesselsPage"), {
  ssr: false,
});




export default function Page() {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <VesselsPage />
      </div>
    </MainLayout>
  );
}
