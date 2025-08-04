"use client";

import { useState } from "react";
import { Paperclip, CheckCheck } from "lucide-react";
import clsx from "clsx";
import { User } from "../types/chat";

type Props = {
  users: User[];
  setUsers: (users: User[]) => void;
  onSelectUser: (id: string) => void;
  selectedUserId: string;
};

export default function ChatList({ users, setUsers, onSelectUser, selectedUserId }: Props) {
  const [search, setSearch] = useState("");

  const filteredUsers = users
    .filter((u) => u.id !== "u1") 
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectUser = (userId: string) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, unreadCount: 0 } : u
    );
    setUsers(updatedUsers);
    onSelectUser(userId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white border-r dark:border-gray-700 w-80">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="font-semibold text-lg">Chats</h2>
        <input
          placeholder="Search For Contacts or Messages"
          className="w-full mt-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-[#1a1f2b] border border-gray-300 dark:border-gray-600 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
        <h3 className="text-xs text-gray-500 dark:text-gray-400 px-1">ALL CHATS</h3>

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
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
              <div className="truncate">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                  {user.isTyping ? (
                    <>
                      is typing<span className="animate-pulse">...</span>
                    </>
                  ) : (
                    <>
                      <Paperclip className="w-3 h-3 inline-block mr-1" />
                      Document
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
              <span>02:40 PM</span>
              <div className="flex items-center gap-1 mt-1">
                <CheckCheck className="w-4 h-4 text-green-500" />
                {(user.unreadCount ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1">
                    {user.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
