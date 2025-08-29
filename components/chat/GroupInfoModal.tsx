"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Info,
  Bell,
  BellOff,
  Image,
  Video,
  FileText,
  Headphones,
  Link,
  Mic,
  Users,
  Search,
  Moon,
} from "lucide-react";
import clsx from "clsx";
import { User, Message } from "../types/chat";

type MessageWithReactions = Message & {
  reactions?: { emoji: string; count: number }[];
  replyTo?: MessageWithReactions | null;
};

type CategoryKey =
  | "photos"
  | "videos"
  | "files"
  | "audioFiles"
  | "sharedLinks"
  | "voiceMessages"
  | "gifs";

const iconMap: Record<CategoryKey, JSX.Element> = {
  photos: <Image className="w-5 h-5" />,
  videos: <Video className="w-5 h-5" />,
  files: <FileText className="w-5 h-5" />,
  audioFiles: <Headphones className="w-5 h-5" />,
  sharedLinks: <Link className="w-5 h-5" />,
  voiceMessages: <Mic className="w-5 h-5" />,
  gifs: (
    <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-gray-700 dark:border-white/20 rounded">
      GIF
    </div>
  ),
};

type MemberWithRole = User & {
  role?: string;
};

type Props = {
  group: {
    id: string;
    name: string;
    avatar?: string | null;
    isOnline?: boolean;
    description?: string;
    members: MemberWithRole[];
  };
  messages: MessageWithReactions[];
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  onClose: () => void;
  onSendMessageClick: () => void;
};

export default function GroupInfoModal({
  group,
  messages,
  notificationsEnabled: externalNotificationsEnabled,
  setNotificationsEnabled: externalSetNotificationsEnabled,
  onClose,
  onSendMessageClick,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(
    externalNotificationsEnabled
  );
  const [mutedForever, setMutedForever] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showMuteDurationDialog, setShowMuteDurationDialog] =
    React.useState(false);
  const [muteDuration, setMuteDuration] = React.useState<number | null>(null);
  const [muteTimeoutId, setMuteTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setNotificationsEnabled(externalNotificationsEnabled);
    if (externalNotificationsEnabled) {
      setMutedForever(false);
      setShowMenu(false);
      setShowMuteDurationDialog(false);
      setMuteDuration(null);
    }
  }, [externalNotificationsEnabled]);

  React.useEffect(() => {
    return () => {
      if (muteTimeoutId) clearTimeout(muteTimeoutId);
    };
  }, [muteTimeoutId]);

  React.useEffect(() => {
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

  const counts = {
    photos: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter(
          (a) =>
            a.type.startsWith("image") && !a.type.toLowerCase().includes("gif")
        ).length || 0),
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
          (a) =>
            !a.type.startsWith("image") &&
            !a.type.startsWith("video") &&
            !a.type.startsWith("audio")
        ).length || 0),
      0
    ),
    audioFiles: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter((a) => a.type.startsWith("audio")).length ||
          0),
      0
    ),
    sharedLinks: messages.reduce((acc, msg) => acc + (msg.location ? 1 : 0), 0),
    voiceMessages: 0,
    gifs: messages.reduce(
      (acc, msg) =>
        acc +
        (msg.attachments?.filter((a) => a.type.toLowerCase().includes("gif"))
          .length || 0),
      0
    ),
  };

  const categories: { key: CategoryKey; label: string }[] = [
    { key: "photos", label: "photos" },
    { key: "videos", label: "videos" },
    { key: "files", label: "files" },
    { key: "audioFiles", label: "audio files" },
    { key: "sharedLinks", label: "shared links" },
    { key: "voiceMessages", label: "voice messages" },
    { key: "gifs", label: "GIFs" },
  ];

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

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return group.members;
    return group.members.filter((m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, group.members]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full max-w-md max-h-[80vh] overflow-y-auto
          rounded-2xl border border-gray-200 bg-white
          shadow-[0_16px_40px_rgba(2,6,23,0.08)]
          dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          p-6 flex flex-col gap-6
        "
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          {group.avatar ? (
            <img
              src={group.avatar}
              alt={group.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-600 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-2xl select-none">
              {group.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{group.name}</h3>
            <p className="text-sm text-gray-500">
              {group.members.length} members
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm border-b border-gray-200 dark:border-white/10 pb-3">
          <Info className="w-5 h-5 mt-1 text-gray-700 dark:text-gray-300" />
          <div className="flex flex-wrap gap-1 text-gray-700 dark:text-gray-300">
            <span>Вопросы</span>|<span>Общение</span>|<span>Знакомства</span>|
            <span>Помощь</span>|<span>Мероприятия</span>|
            <span className="text-gray-400 italic">Description</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="w-5 h-5" />
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
              notificationsEnabled ? "bg-emerald-500" : "bg-gray-700"
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
        </div>

        {showMenu && (
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={handleMuteFor}
              type="button"
            >
              Mute for…
            </button>
            <button
              className="px-3 py-2 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleMuteForever}
              type="button"
            >
              Mute forever
            </button>
          </div>
        )}

        <ul className="space-y-1 border-b border-gray-200 dark:border-white/10 pb-4">
          {categories.map(({ key, label }) => (
            <li key={key}>
              <button
                className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10"
                type="button"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {iconMap[key]}
                </span>
                <span className="capitalize">
                  {counts[key]} {label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 uppercase">
              <Users className="w-5 h-5" />
              {group.members.length} members
            </h4>
            <button
              type="button"
              aria-label="Search members"
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-3">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-500">No members found.</p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-white font-semibold">
                        {member.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.lastSeen
                          ? `last seen ${member.lastSeen}`
                          : member.isOnline
                          ? "Online"
                          : "Offline"}
                      </div>
                    </div>
                  </div>
                  {member.role && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      {member.role}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {showMuteDurationDialog && (
          <div className="mt-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <div className="text-sm mb-2">
              Mute notifications for (minutes):
            </div>
            <input
              type="number"
              min={1}
              value={muteDuration ?? ""}
              onChange={(e) =>
                setMuteDuration(e.target.value ? Number(e.target.value) : null)
              }
              className="w-28 px-2 py-1 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5"
            />
            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
                onClick={handleCancelMuteDuration}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 rounded-lg text-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-60"
                onClick={handleConfirmMuteDuration}
                disabled={!muteDuration}
                type="button"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
