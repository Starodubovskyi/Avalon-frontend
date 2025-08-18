"use client";

import React from "react";
import { Bookmark, List, Mail, Compass, Globe, File, User, Heart, Dribbble, Figma, RefreshCcw } from "lucide-react";

interface UserProfile {
  name: string;
  handle: string;
  photo: string;
  followers: string;
  follows: string;
  posts: string;
}

interface LeftSidebarProps {
  user: UserProfile;
  mode?: "desktop" | "mobile";
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, mode = "desktop" }) => {
  const navigation = [
    { name: "Profile", icon: <User size={18} />, href: "/profile" },
    { name: "All Feeds", icon: <Globe size={18} />, count: 36, href: "#" },
    { name: "Explore", icon: <Compass size={18} />, href: "#" },
    { name: "Messages", icon: <Mail size={18} />, href: "/chat" },
    { name: "Lists", icon: <List size={18} />, href: "#" },
    { name: "Bookmark", icon: <Bookmark size={18} />, href: "#" },
    { name: "Marketplace", icon: <Heart size={18} />, href: "#" },
    { name: "Files", icon: <File size={18} />, count: 14, href: "#" },
    { name: "Media", icon: <File size={18} />, href: "#" },
  ];

  const likedPages = [
    { name: "Dribbble", icon: <Dribbble size={18} /> },
    { name: "UI/UX Designs", icon: <Figma size={18} /> },
    { name: "Figma Update", icon: <RefreshCcw size={18} /> },
  ];

  const rootClass = mode === "desktop" ? "hidden lg:block lg:w-1/5 space-y-6" : "block w-full space-y-6";

  return (
    <div className={rootClass}>
      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.handle}</p>
        <div className="flex justify-around mt-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.followers}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.follows}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Follows</p>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.posts}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Post</p>
          </div>
        </div>
      </div>

      <button className="w-full bg-gray-900 dark:bg-[#2dd4bf] text-white font-semibold py-3 rounded-2xl shadow-lg hover:bg-gray-800 dark:hover:bg-[#14b8a6] transition-colors">
        Create Post
      </button>

      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        {navigation.map((item, i) => (
          <a key={i} href={item.href} className="flex items-center justify-between p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
            {item.count ? <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.count}</span> : null}
          </a>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Pages You Liked</h3>
        {likedPages.map((page, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
              {page.icon}
              <span>{page.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
