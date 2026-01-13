import React from "react";
import EmailControls from "./emailControls";
import { Menu } from "lucide-react";
import clsx from "clsx";

// Градиент для непрочитанных
const UNREAD_BG =
  "bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10";

interface Email {
  sender: string;
  avatar: string;
  subject: string;
  preview: string;
  time: string;
  tags?: string[];
  read: boolean;
  isRecent?: boolean;
  id: number;
}

type MainProps = {
  emails: Email[];
  onSortClick: (sortType: "recent" | "unread" | "all") => void;
  onRefreshClick: () => void;
  onMenuClick?: () => void;
};

const EmailMain: React.FC<MainProps> = ({
  emails,
  onSortClick,
  onRefreshClick,
  onMenuClick,
}) => (
  <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#050505]">
    {/* Header */}
    <div
      className="
        sticky top-0 z-10 px-6 py-4
        flex flex-col sm:flex-row sm:items-center justify-between gap-4
        border-b border-gray-200 dark:border-white/10
        bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md
      "
    >
      <div className="flex items-center gap-4">
        <button
          className="sm:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Inbox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {emails.length} Messages •{" "}
            <span className="text-blue-500">
              {emails.filter((e) => !e.read).length} Unread
            </span>
          </p>
        </div>
      </div>

      <EmailControls
        onSortClick={onSortClick}
        onRefreshClick={onRefreshClick}
      />
    </div>

    {/* Email List */}
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
      {emails.map((email) => {
        return (
          <div
            key={email.id}
            className={clsx(
              "group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:px-6 sm:py-5 rounded-2xl cursor-pointer transition-all duration-200",
              "border border-transparent hover:border-blue-200 dark:hover:border-blue-900", // Hover border
              email.read
                ? "bg-white dark:bg-[#161b22] shadow-sm hover:shadow-md"
                : `${UNREAD_BG} bg-white dark:bg-[#161b22] shadow-md border-l-4 border-l-blue-500` // Unread style
            )}
          >
            {/* Avatar */}
            <div className="flex items-start justify-between sm:w-auto">
              <div
                className={clsx(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm",
                  email.read
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                )}
              >
                {email.avatar}
              </div>
              {/* Time for mobile */}
              <span className="sm:hidden text-xs font-medium text-gray-400">
                {email.time}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3
                  className={clsx(
                    "text-base truncate pr-2",
                    email.read
                      ? "font-semibold text-gray-700 dark:text-gray-300"
                      : "font-bold text-gray-900 dark:text-white"
                  )}
                >
                  {email.sender}
                </h3>
                <span className="hidden sm:block text-xs font-medium text-gray-400 whitespace-nowrap">
                  {email.time}
                </span>
              </div>

              <p
                className={clsx(
                  "text-sm truncate",
                  email.read
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-800 dark:text-gray-200 font-medium"
                )}
              >
                {email.subject}
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500 truncate pr-4">
                {email.preview}
              </p>

              {/* Tags */}
              <div className="mt-2 flex flex-wrap gap-2">
                {(email.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Empty State spacer */}
      <div className="h-10" />
    </main>
  </div>
);

export default EmailMain;
