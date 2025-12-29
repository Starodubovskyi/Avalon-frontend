"use client";

import React, { useRef, useState } from "react";
import { User, Plus, X, Upload, Trash2 } from "lucide-react";
import clsx from "clsx";

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

interface ProfileHeaderProps {
  name: string;
  lastName: string;
  bio?: string;
  profileImage?: string;
  tags?: string[];
  editMode: boolean;
  onUploadAvatar: (file: File) => void;
  onDeleteAvatar: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onLogout: () => void;
}

export default function ProfileHeader({
  name,
  lastName,
  bio,
  profileImage,
  tags = [],
  editMode,
  onUploadAvatar,
  onDeleteAvatar,
  onAddTag,
  onRemoveTag,
}: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");

  const openFileDialog = () => avatarInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadAvatar(file);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed) {
      onAddTag(trimmed);
      setNewTag("");
    }
  };

  return (
    <div className="text-left w-full">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-[#161b22] shadow-xl overflow-hidden">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div
                className={clsx(
                  "w-full h-full rounded-full flex items-center justify-center text-white",
                  GRADIENT_BG
                )}
              >
                <User size={40} />
              </div>
            )}
          </div>
          {editMode && (
            <button
              onClick={openFileDialog}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
              title="Upload Avatar"
            >
              <Upload size={14} />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {name} {lastName}
          </h2>
          {bio ? (
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              {bio}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No bio provided</p>
          )}

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-500/20"
              >
                {tag}
                {editMode && (
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}

            {editMode && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Add tag"
                    className="w-24 px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/10 border-transparent focus:bg-white dark:focus:bg-[#0d1117] focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                  <button
                    onClick={addTag}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Plus size={10} />
                  </button>
                </div>
                {profileImage && (
                  <button
                    onClick={onDeleteAvatar}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Remove photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        className="hidden"
      />
    </div>
  );
}
