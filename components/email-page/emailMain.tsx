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
    <div className="bg-white dark:bg-gray-800 px-3 sm:px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Inbox</h1>
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
      {emails.map((email) => (
        <div
          key={email.id}
          className={`flex items-start sm:items-center p-3 sm:p-4 rounded-lg cursor-pointer transition-colors ${
            !email.read
              ? "bg-blue-100 dark:bg-blue-950 shadow"
              : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700"
          }`}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 bg-purple-500 flex-shrink-0">
            {email.avatar}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
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
                  className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-[10px] sm:text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-gray-500 dark:text-gray-400">
            {(email.tags || []).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
            <span>{email.time}</span>
          </div>
        </div>
      ))}
    </main>
  </div>
);

export default EmailMain;
