// src/components/email-page/EmailMain.tsx
import React from "react";
import EmailControls from "./emailControls";

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
};

const EmailMain: React.FC<MainProps> = ({
  emails,
  onSortClick,
  onRefreshClick,
}) => (
  <div className="flex-1 flex flex-col">
    <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <div className="flex text-sm text-gray-500 dark:text-gray-400">
          <span>2345 Emails</span>
          <span className="ml-2">56 Unread</span>
        </div>
      </div>
      <EmailControls
        onSortClick={onSortClick}
        onRefreshClick={onRefreshClick}
      />
    </div>
    <main className="flex-1 overflow-y-auto p-4 space-y-3">
      {emails.map((email) => (
        <div
          key={email.id}
          className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 ${
            !email.read
              ? "bg-blue-100 dark:bg-blue-950 shadow"
              : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700"
          }`}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 bg-purple-500">
            {email.avatar}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 dark:text-gray-100">
              {email.sender}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {email.subject}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {email.preview}
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-4 text-xs">
            {email.tags &&
              email.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {tag}
                </span>
              ))}
            <span className="text-gray-500 dark:text-gray-400">
              {email.time}
            </span>
          </div>
        </div>
      ))}
    </main>
  </div>
);

export default EmailMain;
