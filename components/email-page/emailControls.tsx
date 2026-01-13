"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Filter,
  RefreshCw,
  MoreVertical,
  Search,
  Settings,
} from "lucide-react";
import clsx from "clsx";

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

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(e.target as Node)
      )
        setIsSortMenuOpen(false);
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      )
        setIsMoreOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSortOptionClick = (sortType: "recent" | "unread" | "all") => {
    onSortClick(sortType);
    setIsSortMenuOpen(false);
    setIsMoreOpen(false);
  };

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      {/* Search Input */}
      <div className="relative flex-1 sm:w-72 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search emails..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#161b22] focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-gray-900 dark:text-white outline-none placeholder-gray-500"
        />
      </div>

      {/* Desktop Actions */}
      <div className="hidden sm:flex items-center gap-2">
        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className={clsx(
              "p-2.5 rounded-full transition-all active:scale-95",
              isSortMenuOpen
                ? "bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-white"
                : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500"
            )}
            title="Filter & Sort"
          >
            <Filter size={18} />
          </button>

          {isSortMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sort by
              </div>
              {[
                { label: "Recent", value: "recent" },
                { label: "Unread", value: "unread" },
                { label: "All", value: "all" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortOptionClick(opt.value as any)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onRefreshClick}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-all active:scale-95 active:rotate-180 duration-500"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>

        <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* Mobile Actions */}
      <div className="sm:hidden relative" ref={moreMenuRef}>
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
        >
          <MoreVertical size={20} />
        </button>
        {isMoreOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1e2329] border border-gray-100 dark:border-white/5 shadow-xl z-30 p-1.5 animate-in slide-in-from-top-2">
            <button
              onClick={onRefreshClick}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
            <button
              onClick={() => handleSortOptionClick("unread")}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Sort: Unread
            </button>
            <button
              onClick={() => handleSortOptionClick("recent")}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Sort: Recent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailControls;
