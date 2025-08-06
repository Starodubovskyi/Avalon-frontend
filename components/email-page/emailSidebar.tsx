import React from "react";
import {
  FaInbox,
  FaStar,
  FaRegPaperPlane,
  FaPen,
  FaTrashAlt,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";

type FolderType = "inbox" | "starred" | "sent" | "drafts" | "deleted" | "spam";

type SidebarProps = {
  currentUser: {
    name: string;
    email: string;
    // avatarUrl?: string; // если нужно
  };
  activeFolder: FolderType;
  onFolderSelect: (folder: FolderType) => void;
};

const sidebarNavItems = [
  { name: "Inbox", icon: <FaInbox />, type: "inbox" },
  { name: "Starred", icon: <FaStar />, type: "starred" },
  { name: "Sent", icon: <FaRegPaperPlane />, type: "sent" },
  { name: "Drafts", icon: <FaPen />, type: "drafts" },
  { name: "Deleted", icon: <FaTrashAlt />, type: "deleted" },
  { name: "Spam", icon: <FaExclamationTriangle />, type: "spam" },
];

const labels = [
  { name: "Team Events", color: "bg-green-500" },
  { name: "Work", color: "bg-blue-500" },
  { name: "External", color: "bg-red-500" },
];

const EmailSidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeFolder,
  onFolderSelect,
}) => (
  <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col shadow-lg">
    <div className="flex items-center mb-6">
      <img
        src="https://via.placeholder.com/48"
        alt="User Avatar"
        className="w-12 h-12 rounded-full mr-3"
      />
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-100">
          {currentUser.name}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentUser.email}
        </div>
      </div>
    </div>
    <button className="flex items-center justify-center bg-orange-500 text-white p-3 rounded-lg w-full mb-6 font-semibold shadow-md hover:bg-orange-600 transition-colors">
      <FaPlus className="mr-2" />
      Compose
    </button>
    <nav className="space-y-1">
      {sidebarNavItems.map((item, index) => (
        <div
          key={index}
          className={`flex justify-between items-center p-3 rounded-lg cursor-pointer ${
            activeFolder === item.type
              ? "bg-gray-200 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          onClick={() => onFolderSelect(item.type as FolderType)}
        >
          <div className="flex items-center">
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </div>
        </div>
      ))}
    </nav>
    <div className="mt-8">
      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2">
        Labels
      </h3>
      <div className="space-y-2">
        {labels.map((label, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${label.color}`}></span>
            <span>{label.name}</span>
          </div>
        ))}
      </div>
    </div>
  </aside>
);

export default EmailSidebar;
