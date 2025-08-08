"use client";

import Sidebar from "./Sidebar";




const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
  );
};

export default MainLayout;
