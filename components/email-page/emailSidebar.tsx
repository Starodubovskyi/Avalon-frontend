"use client";

import React from "react";
import {
  Inbox,
  Star,
  Send,
  FileEdit,
  Trash2,
  AlertOctagon,
  Plus,
  X,
} from "lucide-react";
import type { AppUser } from "@/lib/useUserFromQueryAndStorage";
import clsx from "clsx";

// Общий градиент (как в чате)
const GRADIENT_CLASS =
  "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type FolderType = "inbox" | "starred" | "sent" | "drafts" | "deleted" | "spam";

type SidebarProps = {
  currentUser: AppUser;
  activeFolder: FolderType;
  onFolderSelect: (folder: FolderType) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

const sidebarNavItems = [
  { name: "Inbox", icon: <Inbox size={20} />, type: "inbox" },
  { name: "Starred", icon: <Star size={20} />, type: "starred" },
  { name: "Sent", icon: <Send size={20} />, type: "sent" },
  { name: "Drafts", icon: <FileEdit size={20} />, type: "drafts" },
  { name: "Deleted", icon: <Trash2 size={20} />, type: "deleted" },
  { name: "Spam", icon: <AlertOctagon size={20} />, type: "spam" },
];

const labels = [
  { name: "Team Events", color: "bg-green-500" },
  { name: "Work", color: "bg-blue-500" },
  { name: "External", color: "bg-red-500" },
];

const Panel: React.FC<SidebarProps & { user: AppUser }> = ({
  user,
  activeFolder,
  onFolderSelect,
  onClose,
}) => {
  const avatar = user.avatar || user.photo || "";
  const displayEmail =
    user.email ||
    (user.handle?.startsWith("@")
      ? `${user.handle.slice(1)}@example.com`
      : user.handle) ||
    "user@example.com";
  const displayName = user.name || "User";

  return (
    <aside
      role="navigation"
      className="w-80 h-full flex flex-col p-6 bg-white dark:bg-[#0d1117] border-r border-gray-100 dark:border-white/5"
    >
      {/* User Info Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${GRADIENT_CLASS}`}
            >
              {displayName[0]}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 dark:text-white truncate">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {displayEmail}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 sm:hidden text-gray-500 transition-colors"
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      {/* Compose Button */}
      <button
        type="button"
        className={`flex items-center justify-center gap-3 text-white p-3.5 rounded-2xl w-full mb-8 font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95 ${GRADIENT_CLASS}`}
      >
        <Plus size={20} />
        <span>Compose</span>
      </button>

      {/* Navigation */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10">
        {sidebarNavItems.map((item, index) => {
          const active = activeFolder === (item.type as FolderType);
          return (
            <button
              key={index}
              onClick={() => {
                onFolderSelect(item.type as FolderType);
                onClose?.();
              }}
              className={clsx(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium text-sm",
                active
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <span
                className={clsx(
                  active ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
                )}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
              {/* Optional: Add unread count badges here if available */}
            </button>
          );
        })}

        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
          <h3 className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Labels
          </h3>
          <div className="space-y-1">
            {labels.map((label, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 text-sm transition-colors"
              >
                <span
                  className={`w-3 h-3 rounded-full ${label.color} shadow-sm`}
                />
                <span>{label.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

const EmailSidebar: React.FC<SidebarProps> = (props) => {
  return (
    <>
      <div className="hidden sm:block h-full">
        <Panel {...props} user={props.currentUser} />
      </div>

      <div
        className={clsx(
          "sm:hidden fixed inset-0 z-50 transition-opacity duration-300",
          props.isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div
          onClick={props.onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <div
          className={clsx(
            "absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-[#0d1117] transition-transform duration-300 ease-out shadow-2xl",
            props.isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Panel {...props} user={props.currentUser} />
        </div>
      </div>
    </>
  );
};

export default EmailSidebar;
