"use client";

import React, { useState, useMemo } from "react";
import { User } from "../types/chat";
import { X } from "lucide-react";

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

// ... (Type definitions remain same) ...
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
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22] px-4 py-4 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-w-full z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">
          Forward to...
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
      />

      <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent space-y-1">
        {filteredUsers.map((user) => (
          <label
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 select-none transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedUserIds.has(user.id)}
              onChange={() => toggleUserSelection(user.id)}
              className="w-4 h-4 accent-blue-500"
            />
            {user.avatar ? (
              <img
                src={user.avatar}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
            )}
            <span className="text-sm font-medium">{user.name}</span>
          </label>
        ))}
      </div>

      <button
        disabled={selectedUserIds.size === 0}
        onClick={() => {
          if (selectedUserIds.size > 0) onForward(Array.from(selectedUserIds));
        }}
        className={`mt-4 w-full py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
          selectedUserIds.size === 0
            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
            : GRADIENT_BG
        }`}
      >
        Forward ({selectedUserIds.size})
      </button>
    </div>
  );
}
