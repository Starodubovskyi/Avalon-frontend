import React from "react";
import EmailControls from "./emailControls";
import { FaBars } from "react-icons/fa";

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
  <div className="flex-1 flex flex-col h-full">
    <div
      className="
        sticky top-0 z-10
        px-3 sm:px-4 py-3
        flex items-center justify-between
        border-b border-gray-200 bg-white/90 backdrop-blur
        dark:border-white/10 dark:bg-white/5
      "
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          type="button"
        >
          <FaBars />
        </button>
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Inbox
          </h1>
          <div className="hidden sm:flex text-sm text-gray-500 dark:text-gray-400 gap-2">
            <span>2345 Emails</span>
            <span>• 56 Unread</span>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto sm:flex-none">
        <EmailControls
          onSortClick={onSortClick}
          onRefreshClick={onRefreshClick}
        />
      </div>
    </div>

    <main className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
      {emails.map((email) => {
        const unreadClasses =
          "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600";
        const readClasses =
          "border-gray-200 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10";

        return (
          <div
            key={email.id}
            className={`
              group flex items-start sm:items-center gap-3 sm:gap-4
              p-3 sm:p-4 rounded-2xl border transition
              shadow-[0_8px_24px_rgba(2,6,23,0.06)]
              dark:shadow-[0_8px_24px_rgba(255,255,255,0.04)]
              ${email.read ? readClasses : unreadClasses}
            `}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-purple-500">
              {email.avatar}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-900 dark:text-white truncate">
                  {email.sender}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                  {email.time}
                </span>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {email.subject}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {email.preview}
              </div>

              <div className="mt-2 flex gap-2 flex-wrap">
                {(email.tags || []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="
                      px-2 py-0.5 rounded-full text-[10px] sm:text-xs
                      bg-white dark:bg-white/10
                      border border-gray-200 dark:border-white/10
                      text-gray-700 dark:text-gray-200
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 ml-2 text-xs text-gray-600 dark:text-gray-300">
              {(email.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="
                    px-2 py-1 rounded-full
                    bg-white dark:bg-white/10
                    border border-gray-200 dark:border-white/10
                    text-gray-700 dark:text-gray-200
                  "
                >
                  {tag}
                </span>
              ))}
              <span>{email.time}</span>
            </div>
          </div>
        );
      })}
    </main>
  </div>
);

export default EmailMain;
