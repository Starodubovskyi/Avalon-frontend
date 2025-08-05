// page.tsx
"use client";

import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MapsPage = () => {
  //

  return (
    <MainLayout>
    <div className="flex">
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
    </MainLayout>
  );
};

export default MapsPage;