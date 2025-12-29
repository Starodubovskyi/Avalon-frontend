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

type CurrentUser = {
  name: string;
  email: string;
  avatar?: string;
  handle?: string;
  photo?: string;
};

const initialEmails: Email[] = [
  {
    id: 1,
    sender: "Justin Lapointe",
    avatar: "JL",
    subject: "Client Dashboard Update",
    preview:
      "It seems that recipients are receiving the notifications correctly now. Let's check...",
    time: "3:13 PM",
    tags: ["Projects", "Work"],
    read: false,
    isRecent: false,
    folder: "inbox",
  },
  {
    id: 2,
    sender: "Rufana",
    avatar: "R",
    subject: "UI Project Review",
    preview:
      "Regardless, you can usually expect an increase in user engagement after these changes.",
    time: "2:45 PM",
    tags: ["Applications"],
    read: false,
    isRecent: true,
    folder: "starred",
  },
  {
    id: 3,
    sender: "Cameron Drake",
    avatar: "CD",
    subject: "You're missing out!",
    preview:
      "Here are a few catchy email subject line examples that might inspire you.",
    time: "11:20 AM",
    tags: ["External"],
    read: true,
    isRecent: false,
    folder: "sent",
  },
  {
    id: 4,
    sender: "Sean Hill",
    avatar: "SH",
    subject: "Progress Report Q3",
    preview:
      "You can write effective retargeting subject lines by focusing on value.",
    time: "Yesterday",
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
      sorted.sort((a, b) => +a.read - +b.read); // Unread (false) first -> 0 - 1 = -1
    } else if (sortType === "recent") {
      // Mock logic for 'recent' flag sorting
      sorted.sort((a, b) =>
        a.isRecent === b.isRecent ? 0 : a.isRecent ? -1 : 1
      );
    }
    // In a real app, you'd fetch sorted data. Here we just update local state view.
    // Ideally we update the order in the main list, but for filtering logic we just re-set.
    // For simplicity in this mock, we aren't re-ordering 'emails', just forcing a re-render is usually enough if filtered.
    // To see effect, let's just reverse visible for demo if 'all'
    if (sortType === "all") sorted.reverse();

    // Hacky update to force render for demo
    const newEmails = emails
      .filter((e) => e.folder !== activeFolder)
      .concat(sorted);
    setEmails(newEmails);
  };

  const refreshEmails = () => {
    // Simulate refresh
    setEmails([...initialEmails]);
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-black overflow-hidden font-sans">
      <EmailSidebar
        currentUser={currentUser}
        activeFolder={activeFolder}
        onFolderSelect={(f) => setActiveFolder(f)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <EmailMain
          emails={visibleEmails}
          onSortClick={handleSortClick}
          onRefreshClick={refreshEmails}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
};

export default EmailDashboard;
