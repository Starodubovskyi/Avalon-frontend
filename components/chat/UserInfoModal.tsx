"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  Bell,
  BellOff,
  Info,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  Image,
  Video,
  FileText,
  Headphones,
  Link,
  Mic,
  Users,
  Moon,
} from "lucide-react";
import clsx from "clsx";
import { User, Message } from "../types/chat";

type MessageWithReactions = Message & {
  reactions?: { emoji: string; count: number }[];
  replyTo?: MessageWithReactions | null;
};

type Props = {
  user: User;
  messages: MessageWithReactions[];
  pinnedMessages: MessageWithReactions[];
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  onClose: () => void;
  onSendMessageClick: () => void;
};

type CategoryKey =
  | "savedMessages"
  | "photos"
  | "videos"
  | "files"
  | "audioFiles"
  | "sharedLinks"
  | "voiceMessages"
  | "groupsInCommon";

const iconMap: Record<CategoryKey, JSX.Element> = {
  savedMessages: <Bookmark className="w-5 h-5" />,
  photos: <Image className="w-5 h-5" />,
  videos: <Video className="w-5 h-5" />,
  files: <FileText className="w-5 h-5" />,
  audioFiles: <Headphones className="w-5 h-5" />,
  sharedLinks: <Link className="w-5 h-5" />,
  voiceMessages: <Mic className="w-5 h-5" />,
  groupsInCommon: <Users className="w-5 h-5" />,
};

export default function UserInfoModal({
  user,
  messages,
  pinnedMessages,
  notificationsEnabled: externalNotificationsEnabled,
  setNotificationsEnabled: externalSetNotificationsEnabled,
  onClose,
  onSendMessageClick,
}: Props) {
  const contactInfo = {
    phone: "+1 (555) 123-4567",
    phoneType: "Mobile",
    username: "@sarahjohnson",
    birthdate: "March 10, 1990 (33 years old)",
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    externalNotificationsEnabled
  );
  const [mutedForever, setMutedForever] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMuteDurationDialog, setShowMuteDurationDialog] = useState(false);
  const [muteDuration, setMuteDuration] = useState<number | null>(null);
  const [muteTimeoutId, setMuteTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
    null
  );

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setNotificationsEnabled(externalNotificationsEnabled);
    if (externalNotificationsEnabled) {
      setMutedForever(false);
      setShowMenu(false);
      setShowMuteDurationDialog(false);
      setMuteDuration(null);
    }
  }, [externalNotificationsEnabled]);

  useEffect(() => {
    return () => {
      if (muteTimeoutId) clearTimeout(muteTimeoutId);
    };
  }, [muteTimeoutId]);

  useEffect(() => {
    if (muteDuration !== null) {
      if (muteTimeoutId) clearTimeout(muteTimeoutId);
      const timeout = setTimeout(() => {
        setNotificationsEnabled(true);
        setMutedForever(false);
        externalSetNotificationsEnabled(true);
        setMuteDuration(null);
        setShowMuteDurationDialog(false);
      }, muteDuration * 60 * 1000);
      setMuteTimeoutId(timeout);
    }
  }, [muteDuration, externalSetNotificationsEnabled]);

  useEffect(() => {
    externalSetNotificationsEnabled(notificationsEnabled);
  }, [notificationsEnabled, externalSetNotificationsEnabled]);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notificationsEnabled) {
      setShowMenu((v) => !v);
    } else {
      setNotificationsEnabled(true);
      setMutedForever(false);
      setShowMenu(false);
    }
  };

  const handleMuteForever = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedForever(true);
    setNotificationsEnabled(false);
    setShowMenu(false);
    setShowMuteDurationDialog(false);
    setMuteDuration(null);
    if (muteTimeoutId) clearTimeout(muteTimeoutId);
  };

  const handleMuteFor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMuteDurationDialog(true);
    setShowMenu(false);
  };

  const handleConfirmMuteDuration = () => {
    if (muteDuration !== null) {
      setMutedForever(false);
      setNotificationsEnabled(false);
      setShowMuteDurationDialog(false);
    }
  };

  const handleCancelMuteDuration = () => {
    setShowMuteDurationDialog(false);
    setMuteDuration(null);
  };

  const openCategoryModal = (key: CategoryKey) => {
    setActiveCategory(key);
  };
  const closeCategoryModal = () => {
    setActiveCategory(null);
  };

  const openPreviewImage = (url: string) => {
    setPreviewImage(url);
  };

  const counts = {
    savedMessages: pinnedMessages.length,
    photos: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter((a) => a.type.startsWith("image")).length ||
          0),
      0
    ),
    videos: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter((a) => a.type.startsWith("video")).length ||
          0),
      0
    ),
    files: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter(
          (a) => !a.type.startsWith("image") && !a.type.startsWith("video")
        ).length || 0),
      0
    ),
    audioFiles: 0,
    sharedLinks: messages.reduce((acc, msg) => acc + (msg.location ? 1 : 0), 0),
    voiceMessages: 0,
    groupsInCommon: 0,
  };

  const categories: { key: CategoryKey; label: string }[] = [
    { key: "savedMessages", label: "saved messages" },
    { key: "photos", label: "photos" },
    { key: "videos", label: "videos" },
    { key: "files", label: "files" },
    { key: "audioFiles", label: "audio files" },
    { key: "sharedLinks", label: "shared links" },
    { key: "voiceMessages", label: "voice messages" },
    { key: "groupsInCommon", label: "groups in common" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#0d1117] rounded-lg w-full max-w-md p-6 flex flex-col gap-6 relative max-h-[80vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-red-500"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-2xl select-none">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text:white">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.isOnline ? "Online" : "Last seen recently"}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-b border-gray-300 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-400 text-sm">
              <Info className="w-5 h-5" />
              <div>
                <div>{contactInfo.phone}</div>
                <div className="text-xs">{contactInfo.phoneType}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-blue-500 cursor-pointer text-sm">
              {contactInfo.username}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {contactInfo.birthdate}
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between relative">
            <h4 className="text-sm font-semibold text-gray-900 dark:text:white flex items-center gap-2">
              {notificationsEnabled ? (
                <Bell className="w-5 h-5" />
              ) : mutedForever ? (
                <BellOff className="w-5 h-5 text-red-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              Notifications
            </h4>

            <button
              onClick={toggleNotifications}
              aria-label="Toggle notifications"
              className={clsx(
                "inline-flex items-center w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none",
                notificationsEnabled
                  ? "bg-emerald-500"
                  : mutedForever
                  ? "bg-red-600"
                  : "bg-gray-700"
              )}
              type="button"
            >
              <span
                className={clsx(
                  "inline-block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300",
                  notificationsEnabled ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>

            {showMenu && notificationsEnabled && (
              <div
                className="absolute top-10 right-0 w-48 bg-[#0d1117] border border-gray-700 rounded shadow-lg z-50 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-700"
                  onClick={handleMuteForever}
                  type="button"
                >
                  <BellOff className="w-4 h-4 text-red-400" />
                  Mute forever
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-700"
                  onClick={handleMuteFor}
                  type="button"
                >
                  <Moon className="w-4 h-4 text-gray-300" />
                  Mute for...
                </button>
              </div>
            )}
          </div>

          {showMuteDurationDialog && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-[#0d1117] rounded-lg p-6 w-72 max-w-full text:white">
                <h3 className="text-lg font-semibold mb-4">
                  Mute notifications for...
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "15 minutes", value: 15 },
                    { label: "30 minutes", value: 30 },
                    { label: "1 hour", value: 60 },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setMuteDuration(value)}
                      type="button"
                      className={clsx(
                        "w-full py-2 rounded",
                        muteDuration === value
                          ? "bg-emerald-500"
                          : "hover:bg-gray-700"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={handleCancelMuteDuration}
                    type="button"
                    className="text-blue-500 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmMuteDuration}
                    type="button"
                    disabled={muteDuration === null}
                    className="px-4 py-2 rounded bg-emerald-500 text:white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mute
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="text-blue-500 hover:underline mb-6"
            onClick={() => {
              onSendMessageClick();
              onClose();
            }}
          >
            SEND MESSAGE
          </button>

          <div>
            <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text:white flex items:center gap-2">
              Media, Links and Docs
            </h4>
            <ul className="space-y-1">
              {categories.map(({ key, label }) => (
                <li key={key}>
                  <button
                    onClick={() => openCategoryModal(key)}
                    className="flex items-center gap-3 w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <span className="text-gray-500">{iconMap[key]}</span>
                    <span className="capitalize">
                      {counts[key]} {label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {activeCategory && (
            <CategoryModal
              category={activeCategory}
              onClose={closeCategoryModal}
              messages={messages}
              pinnedMessages={pinnedMessages}
              onPreviewImage={openPreviewImage}
            />
          )}

          <div className="border-t border-gray-300 dark:border-gray-700 mt-4 pt-4 flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
            >
              <Share2 className="w-5 h-5" />
              Share this contact
            </button>
            <button
              type="button"
              className="flex items:center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
            >
              <Edit className="w-5 h-5" />
              Edit contact
            </button>
            <button
              type="button"
              className="flex items:center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
              Delete contact
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg:black bg-opacity-80 flex items:center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewImage(null);
            }}
            aria-label="Close preview"
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition z-60"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="max-h:[90vh] max-w:[90vw] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

type CategoryModalProps = {
  category: CategoryKey;
  onClose: () => void;
  messages: MessageWithReactions[];
  pinnedMessages: MessageWithReactions[];
  onPreviewImage: (url: string) => void;
};

function CategoryModal({
  category,
  onClose,
  messages,
  pinnedMessages,
  onPreviewImage,
}: CategoryModalProps) {
  let items: { url?: string; name: string; type?: string; text?: string }[] =
    [];

  switch (category) {
    case "savedMessages":
      items = pinnedMessages.map((msg) => ({
        name: msg.text || "Pinned message",
        text: msg.text || "",
      }));
      break;

    case "photos":
      items = messages.flatMap(
        (msg) =>
          msg.attachments
            ?.filter((a) => a.type.startsWith("image"))
            .map((a) => ({
              url: a.url,
              name: a.name,
            })) || []
      );
      break;

    case "videos":
      items = messages.flatMap(
        (msg) =>
          msg.attachments
            ?.filter((a) => a.type.startsWith("video"))
            .map((a) => ({
              url: a.url,
              name: a.name,
            })) || []
      );
      break;

    case "files":
      items = messages.flatMap(
        (msg) =>
          msg.attachments
            ?.filter(
              (a) => !a.type.startsWith("image") && !a.type.startsWith("video")
            )
            .map((a) => ({
              url: a.url,
              name: a.name,
              type: a.type,
            })) || []
      );
      break;

    case "sharedLinks":
      items = messages
        .filter((msg) => msg.location)
        .map((msg) => ({ url: msg.location!, name: "Location" }));
      break;

    default:
      items = [];
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items:center justify-center z-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0d1117] rounded-lg w-full max-w-3xl p-6 flex flex-col gap-4 relative max-h:[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 dark:text:white mb-4 capitalize">
          {category}
        </h3>

        {items.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No items available.
          </p>
        )}

        <div className="overflow-y-auto max-h:[60vh]">
          {category === "savedMessages" ? (
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 border border-gray-300 dark:border-gray-700 rounded-md cursor-default whitespace-pre-wrap break-words"
                  title={item.text}
                >
                  {item.text}
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {items.map((item, idx) => {
                if (!item.url) return null;

                if (category === "photos")
                  return (
                    <img
                      key={idx}
                      src={item.url}
                      alt={item.name || "Image"}
                      className="w-full h-28 object-cover rounded-md cursor-pointer"
                      onClick={() => item.url && onPreviewImage(item.url)}
                    />
                  );
                if (category === "videos")
                  return (
                    <video
                      key={idx}
                      src={item.url}
                      className="w-full h-28 object-cover rounded-md cursor:pointer"
                      controls
                    />
                  );
                if (category === "files")
                  return (
                    <div
                      key={idx}
                      className="p-2 border border-gray-300 dark:border-gray-700 rounded-md cursor-pointer text-xs truncate"
                      title={item.name}
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      {item.name || "File"}
                    </div>
                  );
                if (category === "sharedLinks")
                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-20 flex items:center justify-center bg-gray-200 dark:bg-gray-800 text-xs text-blue-500 dark:text-blue-400 rounded-md underline truncate px-2"
                      title={item.name || item.url}
                    >
                      {item.name || item.url}
                    </a>
                  );
                return null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
