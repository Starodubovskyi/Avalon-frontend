"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Paperclip, CheckCheck } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

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
        "flex flex-col h-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white border-r dark:border-gray-700",
        
        selectedUserId ? "hidden md:flex md:w-80" : "flex w-full md:w-80"
      )}
    >
      <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Chats</h2>
          <button
            onClick={() => setShowCreateGroup(true)}
            title="New Group"
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Create new group chat"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-emerald-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <path d="M16 3.128a4 4 0 0 1 0 7.744" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </button>
        </div>
        <input
          placeholder="Search For Contacts or Messages"
          className="w-full mt-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-[#1a1f2b] border border-gray-300 dark:border-gray-600 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
        <h3 className="text-xs text-gray-500 dark:text-gray-400 px-1">
          ALL CHATS
        </h3>

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => handleSelectUser(user.id)}
            className={clsx(
              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition",
              user.id === selectedUserId
                ? "bg-emerald-100 dark:bg-emerald-800/40"
                : "bg-gray-100 dark:bg-[#1a1f2b] hover:bg-gray-200 dark:hover:bg-[#1f2733]"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : user.isGroup ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500 dark:bg-emerald-700 flex items-center justify-center text-white font-semibold text-lg select-none">
                  {user.name
                    .split(", ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{user.name}</p>
                  {user.isOnline && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {user.isTyping ? (
                    <span className="italic">typing…</span>
                  ) : user.unreadCount > 0 ? (
                    <span>{user.unreadCount} new</span>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>
            </div>

            {user.unreadCount > 0 && (
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white">
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
