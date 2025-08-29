"use client";
import React, { useState } from "react";
import EmailSidebar from "./emailSidebar";
import EmailMain from "./emailMain";

type FolderType = "inbox" | "starred" | "sent" | "drafts" | "deleted" | "spam";

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
  folder: FolderType;
}

type CurrentUser = { name: string; email: string };

const initialEmails: Email[] = [
  {
    id: 1,
    sender: "Justin Lapointe",
    avatar: "JL",
    subject: "Client Dashboard",
    preview: "It seems that recipients are receiving...",
    time: "3:13 PM",
    tags: ["Projects"],
    read: false,
    isRecent: false,
    folder: "inbox",
  },
  {
    id: 2,
    sender: "Rufana",
    avatar: "R",
    subject: "UI project",
    preview: "Regardless, you can usually expect an increase",
    time: "3:13 PM",
    tags: ["Applications"],
    read: false,
    isRecent: true,
    folder: "starred",
  },
  {
    id: 3,
    sender: "Cameron Drake",
    avatar: "CD",
    subject: "You're missing",
    preview: "Here are a few catchy email subject line examples",
    time: "3:13 PM",
    tags: ["External"],
    read: true,
    isRecent: false,
    folder: "sent",
  },
  {
    id: 4,
    sender: "Sean Hill",
    avatar: "SH",
    subject: "How Have You Progressed",
    preview: "You can write effective retargeting subject",
    time: "3:13 PM",
    tags: ["Team Events"],
    read: true,
    isRecent: true,
    folder: "inbox",
  },
];

const EmailDashboard: React.FC<{ currentUser: CurrentUser }> = ({
  currentUser,
}) => {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [activeFolder, setActiveFolder] = useState<FolderType>("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleEmails = emails.filter((email) => email.folder === activeFolder);

  const handleSortClick = (sortType: "recent" | "unread" | "all") => {
    let sorted = [...visibleEmails];
    if (sortType === "unread") {
      sorted.sort((a, b) => +a.read - +b.read);
    } else if (sortType === "recent") {
      sorted.sort((a, b) =>
        a.isRecent === b.isRecent ? 0 : a.isRecent ? -1 : 1
      );
    }
    setEmails((prev) =>
      prev.map((email) =>
        email.folder === activeFolder
          ? sorted.find((e) => e.id === email.id) || email
          : email
      )
    );
  };

  const refreshEmails = () => setEmails([...initialEmails]);

  return (
    <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
      <div className="px-1 sm:px-2 lg:px-2 py-1">
        <div
          className="
            w-full h-[100dvh]
            rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
            dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
            overflow-hidden
          "
        >
          <div className="flex h-full text-gray-800 dark:text-gray-100">
            <EmailSidebar
              currentUser={currentUser}
              activeFolder={activeFolder}
              onFolderSelect={(f) => setActiveFolder(f)}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <EmailMain
              emails={visibleEmails}
              onSortClick={handleSortClick}
              onRefreshClick={refreshEmails}
              onMenuClick={() => setSidebarOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDashboard;
