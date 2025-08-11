"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import TodayNoteNotification from "../../app/notes/TodayNoteNotification"


import BackgroundAnimation from "./BackgroundAnimation";


const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen relative">
       <TodayNoteNotification /> 
      <BackgroundAnimation />
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
