// components/MainLayout.tsx
// Этот файл должен быть по пути components/MainLayout.tsx
/** @format */

import Sidebar from "@/components/Sidebar";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <Navbar /> здесь нет, он теперь в app/layout.tsx
    <>
      <div className="flex">
        <div className="hidden md:block h-[100vh] w-[300px]">
          <Sidebar />
        </div>
        {/* Отступ p-5 и максимальная ширина, чтобы контент не прилипал к краям */}
        <div className="p-5 w-full md:max-w-[1140px]">{children}</div>
      </div>
    </>
  );
};

export default MainLayout;
