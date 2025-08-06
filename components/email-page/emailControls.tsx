// src/components/email-page/EmailControls.tsx
"use client";

import React, { useState } from "react";
import { FaFilter, FaCog, FaSync } from "react-icons/fa";
import ThemeToggler from "@/components/ThemeToggler";

interface EmailControlsProps {
  onSortClick: (sortType: "recent" | "unread" | "all") => void;
  onRefreshClick: () => void;
}

const EmailControls: React.FC<EmailControlsProps> = ({
  onSortClick,
  onRefreshClick,
}) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const handleSortOptionClick = (sortType: "recent" | "unread" | "all") => {
    onSortClick(sortType);
    setIsSortMenuOpen(false);
  };

  return (
    <div className="relative flex items-center space-x-2">
      <input
        type="text"
        placeholder="Search Email"
        className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="relative">
        <button
          onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FaFilter className="text-gray-600 dark:text-gray-300" />
        </button>

        {isSortMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-20 py-2 ring-1 ring-black ring-opacity-5">
            <h4 className="px-4 py-2 text-sm font-semibold text-gray-400 dark:text-gray-500">
              Sorted by:
            </h4>
            <button
              onClick={() => handleSortOptionClick("recent")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Recent messages
            </button>
            <button
              onClick={() => handleSortOptionClick("unread")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Unread
            </button>
            <button
              onClick={() => handleSortOptionClick("all")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              All
            </button>
          </div>
        )}
      </div>

      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <FaCog className="text-gray-600 dark:text-gray-300" />
      </button>

      <button
        onClick={onRefreshClick}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <FaSync className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default EmailControls;
