"use client";

import React, { useState, useMemo } from "react";
import { User } from "../types/chat";
import { X } from "lucide-react";

type MessageWithReactions = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  status: string;
  attachments?: { name: string; type: string; url: string }[];
  location?: string;
  reactions?: { emoji: string; count: number }[];
  replyTo?: MessageWithReactions | null;
};

type Props = {
  users: User[];
  currentUserId: string;
  forwardMessages: MessageWithReactions[];
  onCancel: () => void;
  onForward: (userIds: string[]) => void;
};

export default function ForwardUserSelector({
  users,
  currentUserId,
  forwardMessages,
  onCancel,
  onForward,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUserId)
      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, currentUserId, search]);

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const handleForwardClick = () => {
    if (selectedUserIds.size > 0) {
      onForward(Array.from(selectedUserIds));
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#161b22] px-4 py-3 rounded-t-md max-w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
          Forward message to...
        </h3>
        <button
          onClick={onCancel}
          aria-label="Cancel forward"
          className="text-gray-600 dark:text-gray-400 hover:text-red-500"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-white"
      />
      <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
        {filteredUsers.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            No contacts found
          </p>
        )}
        {filteredUsers.map((user) => (
          <label
            key={user.id}
            className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 rounded px-2 select-none"
          >
            <input
              type="checkbox"
              checked={selectedUserIds.has(user.id)}
              onChange={() => toggleUserSelection(user.id)}
              className="cursor-pointer"
            />
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600 dark:text-gray-300"
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
            <span className="text-sm">{user.name}</span>
          </label>
        ))}
      </div>
      <button
        disabled={selectedUserIds.size === 0}
        onClick={handleForwardClick}
        className={`mt-3 w-full px-3 py-2 rounded-md font-semibold text-white ${
          selectedUserIds.size === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-emerald-500 hover:bg-emerald-600"
        }`}
        type="button"
      >
        Forward ({selectedUserIds.size})
      </button>
    </div>
  );
}
