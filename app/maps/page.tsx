"use client";

import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar"; // Путь к Sidebar
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const MapsPage = () => {
  return (
    <div className="flex">
      <Sidebar /> {/* Слева */}
      <div className="flex-1 relative">
        <Map />
      </div>
    </div>
  );
};

export default MapsPage;
