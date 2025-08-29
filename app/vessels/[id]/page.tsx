"use client";

import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";

const VesselProfileContainer = dynamic(
  () => import("@/components/vessels/profile/VesselProfileContainer"),
  { ssr: false }
);

export default function VesselProfilePage() {
  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1 lg:ml-6 xl:ml-2">
          <div
            className="
              w-full
              rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
              dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            "
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <VesselProfileContainer />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
