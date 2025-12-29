"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { User } from "../types/chat";
import { X, Camera, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

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
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#161b22] rounded-3xl w-full max-w-md p-6 flex flex-col gap-6 relative shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Create New Group
        </h2>

        <div className="flex items-center gap-4">
          <label
            className={`cursor-pointer rounded-full w-16 h-16 flex items-center justify-center text-white text-3xl shadow-lg hover:opacity-90 transition-opacity overflow-hidden ${GRADIENT_BG}`}
          >
            {avatarPreview ? (
              <img src={avatarPreview} className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <input
            type="text"
            className="flex-1 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white px-2 py-2 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto max-h-60 border border-gray-100 dark:border-white/10 rounded-xl p-2 space-y-1">
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-4">No users found</p>
          )}
          {filteredUsers.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors select-none"
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedUserIds.includes(user.id)
                    ? "bg-blue-500 border-transparent"
                    : "border-gray-300"
                }`}
              >
                {selectedUserIds.includes(user.id) && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="hidden"
              />
              {user.avatar ? (
                <img
                  src={user.avatar}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">
                  {user.name[0]}
                </div>
              )}
              <div>
                <span className="font-semibold block text-sm">{user.name}</span>
                <span className="text-xs text-gray-500">
                  {user.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-6 py-2.5 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${GRADIENT_BG}`}
            onClick={handleCreateClick}
            disabled={selectedUserIds.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
