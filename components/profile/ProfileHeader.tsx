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
    <div className="bg-white/10 border border-gray-400 shadow-lg rounded-xl p-6 text-center flex flex-col items-center dark:bg-black/20 dark:border-white/30 dark:shadow-white/20 backdrop-blur-md">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-6xl text-gray-600 dark:text-gray-400 overflow-hidden relative">
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
            onClick={openFileDialog}
            className="mt-3 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition"
            type="button"
          >
            Upload Avatar
          </button>
          {profileImage && (
            <button
              onClick={onDeleteAvatar}
              className="mt-3 px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-full transition"
              type="button"
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

      <h2 className="text-xl font-semibold mt-4 text-gray-900 dark:text-gray-200">
        {name} {lastName}
      </h2>
      {bio && (
        <p className="text-gray-700 dark:text-gray-400 text-sm mt-1">{bio}</p>
      )}

      <div className="mt-3 flex flex-wrap justify-center gap-2 items-center">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm dark:bg-blue-900 dark:bg-opacity-50 dark:text-blue-300"
          >
            {tag}
            {editMode && (
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                type="button"
              >
                <FaTimes />
              </button>
            )}
          </div>
        ))}
        {editMode && (
          <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 text-sm bg-white dark:bg-white/10 dark:border-white/30">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              placeholder="Add tag"
              className="outline-none bg-transparent w-20 text-gray-900 dark:text-gray-200"
            />
            <button
              onClick={addTag}
              className="ml-2 text-blue-700 hover:text-blue-800 dark:text-blue-400"
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
