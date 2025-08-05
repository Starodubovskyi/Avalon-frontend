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
  onLogout,
}: ProfileHeaderProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");

  const openFileDialog = () => {
    avatarInputRef.current?.click();
  };

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-6xl text-gray-500 dark:text-gray-300 overflow-hidden relative">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUserCircle />
        )}
      </div>

      {editMode && (
        <>
          <button
            type="button"
            onClick={openFileDialog}
            className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload Avatar
          </button>
          {profileImage && (
            <button
              type="button"
              onClick={onDeleteAvatar}
              className="mt-3 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Avatar
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </>
      )}

      <h2 className="text-xl font-semibold mt-4 text-gray-900 dark:text-white">
        {name} {lastName}
      </h2>
      {bio && <p className="text-gray-500 text-sm mt-1">{bio}</p>}

      <div className="mt-3 flex flex-wrap justify-center gap-2 items-center">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            {editMode && (
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                aria-label={`Remove tag ${tag}`}
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <div className="flex items-center border rounded-full px-3 py-1 text-sm bg-white dark:bg-gray-700">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              placeholder="Add tag"
              className="outline-none bg-transparent w-20 dark:text-white"
            />
            <button
              onClick={addTag}
              className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              aria-label="Add tag"
              type="button"
            >
              <FaPlus />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
