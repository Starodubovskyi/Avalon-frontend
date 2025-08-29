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
          className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-gray-100
                     dark:bg-white/10 dark:text-gray-100 dark:border-white/10
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      <div className="hidden sm:block relative">
        <button
          onClick={() => setIsSortMenuOpen((v) => !v)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Sort"
          type="button"
        >
          <FaFilter className="text-gray-600 dark:text-gray-300" />
        </button>

        {isSortMenuOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white
                       shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
                       z-20 py-2"
          >
            <h4 className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Sorted by
            </h4>
            <button
              onClick={() => handleSortOptionClick("recent")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              type="button"
            >
              Recent messages
            </button>
            <button
              onClick={() => handleSortOptionClick("unread")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              type="button"
            >
              Unread
            </button>
            <button
              onClick={() => handleSortOptionClick("all")}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              type="button"
            >
              All
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onRefreshClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:inline-flex"
        aria-label="Refresh"
        type="button"
      >
        <FaSync className="text-gray-600 dark:text-gray-300" />
      </button>

      <div className="sm:hidden relative">
        <button
          onClick={() => setIsMoreOpen((v) => !v)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="More"
          type="button"
        >
          <FaEllipsisV className="text-gray-600 dark:text-gray-300" />
        </button>
        {isMoreOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white
                       shadow-[0_16px_40px_rgba(2,6,23,0.08)]
                       dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
                       z-20 py-2"
          >
            <button
              onClick={() => handleSortOptionClick("recent")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              type="button"
            >
              Sort: Recent
            </button>
            <button
              onClick={() => handleSortOptionClick("unread")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              type="button"
            >
              Sort: Unread
            </button>
            <button
              onClick={() => handleSortOptionClick("all")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              type="button"
            >
              Sort: All
            </button>
            <div className="my-1 h-px bg-gray-200 dark:bg-white/10" />
            <button
              onClick={onRefreshClick}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              type="button"
            >
              Refresh
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200"
              type="button"
            >
              Settings
            </button>
          </div>
        )}
      </div>

      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors hidden sm:inline-flex"
        aria-label="Settings"
        type="button"
      >
        <FaCog className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default EmailControls;
