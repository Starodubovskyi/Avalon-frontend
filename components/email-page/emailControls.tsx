"use client";

import React, { useState } from "react";
import { FaFilter, FaCog, FaSync, FaEllipsisV, FaSearch } from "react-icons/fa";

interface EmailControlsProps {
  onSortClick: (sortType: "recent" | "unread" | "all") => void;
  onRefreshClick: () => void;
}

const EmailControls: React.FC<EmailControlsProps> = ({
  onSortClick,
  onRefreshClick,
}) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSortOptionClick = (sortType: "recent" | "unread" | "all") => {
    onSortClick(sortType);
    setIsSortMenuOpen(false);
    setIsMoreOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <div className="relative flex-1 sm:flex-none">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search email"
          className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="hidden sm:block relative">
        <button
          onClick={() => setIsSortMenuOpen((v) => !v)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Sort"
        >
          <FaFilter className="text-gray-600 dark:text-gray-300" />
        </button>

        {isSortMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-20 py-2 ring-1 ring-black/5">
            <h4 className="px-4 py-2 text-sm font-semibold text-gray-400 dark:text-gray-500">
              Sorted by
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

      <button
        onClick={onRefreshClick}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:inline-flex"
        aria-label="Refresh"
      >
        <FaSync className="text-gray-600 dark:text-gray-300" />
      </button>

      <div className="sm:hidden relative">
        <button
          onClick={() => setIsMoreOpen((v) => !v)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="More"
        >
          <FaEllipsisV className="text-gray-600 dark:text-gray-300" />
        </button>
        {isMoreOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-20 py-2 ring-1 ring-black/5">
            <button
              onClick={() => handleSortOptionClick("recent")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Sort: Recent
            </button>
            <button
              onClick={() => handleSortOptionClick("unread")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Sort: Unread
            </button>
            <button
              onClick={() => handleSortOptionClick("all")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Sort: All
            </button>
            <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
            <button
              onClick={onRefreshClick}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              Refresh
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
              Settings
            </button>
          </div>
        )}
      </div>

      <button
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hidden sm:inline-flex"
        aria-label="Settings"
      >
        <FaCog className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default EmailControls;
