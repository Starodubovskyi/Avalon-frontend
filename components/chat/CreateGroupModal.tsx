"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { User } from "../types/chat";
import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const newGroupId = "group_" + uuidv4();

type Props = {
  users: User[];
  currentUserId: string;
  onCancel: () => void;
  onCreate: (
    groupName: string,
    avatarUrl: string | null,
    memberIds: string[]
  ) => void;
};

export default function CreateGroupModal({
  users,
  currentUserId,
  onCancel,
  onCreate,
}: Props) {
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) => !u.isGroup && u.id !== currentUserId
  );

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleCreateClick = () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one member");
      return;
    }
    const members = selectedUserIds.includes(currentUserId)
      ? selectedUserIds
      : [currentUserId, ...selectedUserIds];

    onCreate(groupName.trim(), avatarPreview, members);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel} 
    >
      <div
        className="bg-white dark:bg-[#0d1117] rounded-lg w-full max-w-md p-6 flex flex-col gap-6 relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">
          <label
            htmlFor="group-avatar-upload"
            className="cursor-pointer rounded-full bg-emerald-500 dark:bg-emerald-700 w-16 h-16 flex items-center justify-center text-white text-3xl select-none relative overflow-hidden"
            title="Upload group photo"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Group avatar"
                className="w-full h-full object-cover"
              />
            ) : (
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
                className="w-8 h-8"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            )}

            <input
              id="group-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <input
            type="text"
            className="flex-1 border-b border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white px-2 py-1 text-lg focus:outline-none"
            placeholder="Group name (optional)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto max-h-60 border border-gray-300 dark:border-gray-700 rounded-md p-2 scrollbar-thin scrollbar-thumb-gray-400/30 scrollbar-track-transparent">
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              No users found
            </p>
          )}
          {filteredUsers.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-3 py-2 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
            >
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="cursor-pointer"
              />
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
                  {user.name[0]}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreateClick}
            disabled={selectedUserIds.length === 0}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
