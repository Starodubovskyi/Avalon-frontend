import React, { useRef, useState } from "react";
import { FaUserCircle, FaPlus, FaTimes } from "react-icons/fa";

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
    <div className="text-left">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-5xl text-gray-600 dark:text-gray-400 overflow-hidden relative">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <FaUserCircle />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {name} {lastName}
          </h2>
          {bio && (
            <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
              {bio}
            </p>
          )}
        </div>
      </div>

      {editMode && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={openFileDialog}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-full text-sm transition"
            type="button"
          >
            Upload Avatar
          </button>
          {profileImage && (
            <button
              onClick={onDeleteAvatar}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-full text-sm transition"
              type="button"
            >
              Delete
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full px-3 py-1 text-xs"
          >
            {tag}
            {editMode && (
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-2 text-blue-600 dark:text-blue-300"
                type="button"
                aria-label={`remove ${tag}`}
              >
                <FaTimes />
              </button>
            )}
          </span>
        ))}
        {editMode && (
          <span className="inline-flex items-center border border-dashed border-gray-300 dark:border-white/20 rounded-full px-3 py-1 text-xs">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add tag"
              className="outline-none bg-transparent w-24 text-gray-900 dark:text-gray-200"
            />
            <button
              onClick={addTag}
              className="ml-2 text-blue-700 dark:text-blue-300"
              type="button"
            >
              <FaPlus />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
