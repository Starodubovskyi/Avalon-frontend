import Navbar from "@/components/Navbar";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-950 dark:from-teal-800 dark:to-blue-950 flex flex-col items-center">
      <div className="p-5 w-full md:max-w-[1700px] mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg px-6 md:px-10 lg:px-12 mt-20 mb-4 relative outline outline-[8px] outline-[#b8e4e2]/30 outline-offset-[-8px]">
        <Navbar />
        <div className="flex-1 w-full pt-4">{children}</div>{" "}
      </div>
    </div>
  );
};

export default MainLayout;