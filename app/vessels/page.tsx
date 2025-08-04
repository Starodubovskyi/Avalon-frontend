"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import VesselsPage from "../../components/vessels/VesselsPage";
import { Menu } from "lucide-react";

const Page: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col md:flex-row">
      <div className="md:hidden p-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600 dark:text-gray-300"
        >
          <Menu size={24} />
        </button>
      </div>
      <div
        className={`${
          isSidebarOpen ? "block" : "hidden"
        } md:block absolute md:relative z-20 w-64 md:w-auto`}
      >
        <Sidebar />
      </div>
      <VesselsPage />
    </div>
  );
};

export default Page;
