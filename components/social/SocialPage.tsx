"use client";

import React, { useEffect, useState, useCallback } from "react";
import LeftSidebar from "./LeftSidebar";
import MainContent from "./MainContent";
import RightSidebar from "./RightSidebar";
import MobileTopBar from "./MobileTopBar";

interface UserProfile {
  name: string;
  lastName: string;
  profileImage?: string;
}

const SocialPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const closeAll = useCallback(() => {
    setLeftOpen(false);
    setRightOpen(false);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = leftOpen || rightOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [leftOpen, rightOpen]);

  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    let touching = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      currentX = startX;
      touching = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!touching) return;
      currentX = e.touches[0].clientX;
    }

    function onTouchEnd() {
      if (!touching) return;
      const diffX = currentX - startX;

      if (startX < 20 && diffX > 80 && !leftOpen && !rightOpen) {
        setLeftOpen(true);
      }

      if (startX > window.innerWidth - 20 && diffX < -80 && !leftOpen && !rightOpen) {
        setRightOpen(true);
      }

      if (leftOpen && diffX < -80) {
        setLeftOpen(false);
      }
      if (rightOpen && diffX > 80) {
        setRightOpen(false);
      }

      touching = false;
    }

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [leftOpen, rightOpen]);

  const userForSidebar = currentUser
    ? {
        name: `${currentUser.name} ${currentUser.lastName}`,
        handle: "@userHandle",
        photo:
          currentUser.profileImage ||
          "https://placehold.co/64x64/000000/ffffff?text=User",
        followers: "0",
        follows: "0",
        posts: "0",
      }
    : null;

  const userForMainContent = currentUser
    ? {
        name: `${currentUser.name} ${currentUser.lastName}`,
        handle: "@userHandle",
        country: "Украина",
        photo:
          currentUser.profileImage ||
          "https://placehold.co/40x40/000000/ffffff?text=U",
      }
    : null;

  if (!userForSidebar || !userForMainContent) {
    return (
      <div className="flex-1 p-8 text-center text-gray-500 dark:text-gray-400">
        Загрузка... или пользователь не найден.
      </div>
    );
  }

  return (
    <div className="flex-1">
      <MobileTopBar
        onOpenLeft={() => setLeftOpen(true)}
        onOpenRight={() => setRightOpen(true)}
        showClose={leftOpen || rightOpen}
        onCloseAll={closeAll}
      />

      <div className="px-4 lg:px-8 pt-4 lg:pt-8 flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
        <LeftSidebar user={userForSidebar} />
        <div className="flex-1 lg:w-3/5">
          <MainContent currentUser={userForMainContent} />
        </div>
        <RightSidebar />
      </div>

      {(leftOpen || rightOpen) && (
        <div
          className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[1px] lg:hidden"
          onClick={closeAll}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[100] lg:hidden w-[88%] max-w-[360px] h-full
          bg-white dark:bg-[#0b1220] shadow-2xl border-r border-gray-200 dark:border-white/10
          transform transition-transform duration-300
          ${leftOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="sticky top-0 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1220]">
          <span className="font-medium">Menu</span>
        </div>
        <div className="h-[calc(100%-48px)] overflow-y-auto p-4 pr-3">
          <LeftSidebar user={userForSidebar} mode="mobile" />
        </div>
      </aside>

      <aside
        className={`fixed inset-y-0 right-0 z-[100] lg:hidden w-[88%] max-w-[360px] h-full
          bg-white dark:bg-[#0b1220] shadow-2xl border-l border-gray-200 dark:border-white/10
          transform transition-transform duration-300
          ${rightOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1220]">
          <span className="font-medium">People</span>
        </div>
        <div className="h-[calc(100%-48px)] overflow-y-auto p-4 pl-3">
          <RightSidebar mode="mobile" />
        </div>
      </aside>
    </div>
  );
};

export default SocialPage;
