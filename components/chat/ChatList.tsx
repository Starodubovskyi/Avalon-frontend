"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Plus } from "lucide-react"; // Добавил иконку плюса для красоты
import CreateGroupModal from "./CreateGroupModal";

// Общий класс для градиента
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

type UserFixed = {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  unreadCount: number;
  isTyping: boolean;
  isGroup?: boolean;
  memberIds?: string[];
};

type ChatListProps = {
  users: UserFixed[];
  setUsers: React.Dispatch<React.SetStateAction<UserFixed[]>>;
  selectedUserId: string;
  onSelectUser: (id: string) => void;
};

export default function ChatList({
  users,
  setUsers,
  selectedUserId,
  onSelectUser,
}: ChatListProps) {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users
    .filter((u) => u.id !== "u1")
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectUser = (userId: string) => {
    const updatedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar || "",
      isOnline: u.isOnline ?? false,
      unreadCount: u.unreadCount ?? 0,
      isTyping: u.isTyping ?? false,
      isGroup: u.isGroup,
      memberIds: u.memberIds,
      ...(u.id === userId ? { unreadCount: 0 } : {}),
    }));
    setUsers(updatedUsers);
    onSelectUser(userId);
  };

  const handleCreateGroup = (
    groupName: string,
    avatarUrl: string | null,
    memberIds: string[]
  ) => {
    const newGroupId = "group_" + memberIds.sort().join("_");

    const existingGroup = users.find((u) => u.id === newGroupId);
    if (existingGroup) {
      onSelectUser(existingGroup.id);
      setShowCreateGroup(false);
      return;
    }

    const newGroup: UserFixed = {
      id: newGroupId,
      name: groupName || "New Group",
      avatar: avatarUrl || "",
      isOnline: false,
      unreadCount: 0,
      isTyping: false,
      isGroup: true,
      memberIds,
    };

    setUsers((prev) => [...prev, newGroup]);
    onSelectUser(newGroupId);
    setShowCreateGroup(false);
  };

  return (
    <div
      className={clsx(
        "flex flex-col h-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/10",
        selectedUserId ? "hidden md:flex md:w-80" : "flex w-full md:w-80"
      )}
    >
      <div className="p-5 border-b border-gray-100 dark:border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl tracking-tight">Chats</h2>
          <button
            onClick={() => setShowCreateGroup(true)}
            title="New Group"
            className={`p-2 rounded-full text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95 ${GRADIENT_BG}`}
            aria-label="Create new group chat"
            type="button"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <input
          placeholder="Search contacts..."
          className="w-full px-4 py-2.5 rounded-xl bg-gray-100/50 dark:bg-white/5 border-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 mb-2 uppercase tracking-wider">
          All Chats
        </h3>

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user.id)}
            className={clsx(
              "group flex items-center justify-between px-3 py-3 rounded-2xl cursor-pointer transition-all duration-200",
              user.id === selectedUserId
                ? "bg-blue-50 dark:bg-white/10 shadow-sm"
                : "hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 dark:group-hover:ring-white/10 transition-all"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg select-none shadow-md ${GRADIENT_BG}`}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {user.isOnline && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0d1117] rounded-full" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={clsx(
                      "font-semibold truncate text-[15px]",
                      user.id === selectedUserId
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-100"
                    )}
                  >
                    {user.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  {user.isTyping ? (
                    <span className="text-blue-500 font-medium animate-pulse">
                      typing...
                    </span>
                  ) : user.unreadCount > 0 ? (
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {user.unreadCount} new messages
                    </span>
                  ) : (
                    <span className="truncate opacity-70">Tap to chat</span>
                  )}
                </div>
              </div>
            </div>

            {user.unreadCount > 0 && (
              <div
                className={`text-[10px] font-bold px-2 py-1 min-w-[20px] text-center rounded-full text-white shadow-md ${GRADIENT_BG}`}
              >
                {user.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          users={users as any}
          currentUserId={"u1"}
          onCancel={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
