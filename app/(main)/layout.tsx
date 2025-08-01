import Navbar from "@/components/Navbar";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-blue-950 dark:from-teal-800 dark:to-blue-950 flex flex-col items-center">
      <div className="p-5 w-auto md:max-w-auto mx-auto bg-white dark:bg-gray-900 rounded-1xl shadow-lg px-6 md:auto lg:auto mt-auto mb-auto relative outline ">
        <Navbar />
        <div className="flex-1 w-full pt-0">{children}</div>{" "}
      </div>
    </div>
  );
};

export default MainLayout;
