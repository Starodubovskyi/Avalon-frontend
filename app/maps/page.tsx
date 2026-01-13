"use client";

import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import LoaderRadar from "@/components/Loader/LoaderRadar";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MapsPage = () => {
  return (
    <MainLayout>
      <LoaderRadar />
      <div className="flex">
        <div
          className="
            flex-1 relative
            rounded-3xl overflow-hidden
            border border-gray-100 bg-white
            shadow-[0_18px_45px_rgba(15,23,42,0.15)]
            dark:bg-black dark:border-white/10 dark:shadow-[0_18px_45px_rgba(0,0,0,0.6)]
          "
        >
          <Map />
        </div>
      </div>
    </MainLayout>
  );
};

export default MapsPage;
