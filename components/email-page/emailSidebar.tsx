import React from "react";
import {
  FaInbox,
  FaStar,
  FaRegPaperPlane,
  FaPen,
  FaTrashAlt,
  FaExclamationTriangle,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

type FolderType = "inbox" | "starred" | "sent" | "drafts" | "deleted" | "spam";

type SidebarProps = {
  currentUser: { name: string; email: string };
  activeFolder: FolderType;
  onFolderSelect: (folder: FolderType) => void;
  isOpen?: boolean;
  onClose?: () => void;
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

const Panel: React.FC<SidebarProps> = ({
  currentUser,
  activeFolder,
  onFolderSelect,
  isOpen,
  onClose,
}) => {
  return (
    <aside
      className="w-72 bg-white dark:bg-gray-800 p-6 flex flex-col shadow-lg h-full"
      role="navigation"
    >
      <div className="flex items-center mb-6">
        <img
          src="https://via.placeholder.com/48"
          alt="User Avatar"
          className="w-12 h-12 rounded-full mr-3"
        />
        <div>
          <div className="font-semibold text-gray-800 dark:text-gray-100">
            {currentUser.name || "User"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentUser.email || "user@example.com"}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 sm:hidden"
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>
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
              activeFolder === (item.type as FolderType)
                ? "bg-gray-200 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => {
              onFolderSelect(item.type as FolderType);
              onClose?.();
            }}
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
              <span className={`w-2.5 h-2.5 rounded-full ${label.color}`} />
              <span>{label.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

const EmailSidebar: React.FC<SidebarProps> = (props) => {
  return (
    <>
      <div className="hidden sm:block h-full">
        <Panel {...props} />
      </div>

      <div
        className={`sm:hidden fixed inset-0 z-40 ${
          props.isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!props.isOpen}
      >
        <div
          onClick={props.onClose}
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            props.isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-800 transform transition-transform ${
            props.isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Panel {...props} />
        </div>
      </div>
    </>
  );
};

export default EmailSidebar;
