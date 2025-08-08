"use client";

import React from "react";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";

const VesselsPage = dynamic(
  () => import("@/components/vessels/VesselsPage"),
  { ssr: false }
);

export default function Page() {
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
              <VesselsPage />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
