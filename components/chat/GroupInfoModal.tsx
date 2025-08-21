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
    <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-gray-700 rounded">
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

  React.useEffect(() => {
    externalSetNotificationsEnabled(notificationsEnabled);
  }, [notificationsEnabled, externalSetNotificationsEnabled]);

  const counts = {
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
    gifs: 1008, 
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {group.members.length} members
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-gray-700 dark:text-gray-400 text-sm border-b border-gray-300 dark:border-gray-700 pb-3">
          <Info className="w-5 h-5 mt-1" />
          <div className="flex flex-wrap gap-1">
            <span>Вопросы</span>|<span>Общение</span>|<span>Знакомства</span>|
            <span>Помощь</span>|<span>Мероприятия</span>|
            <span className="text-gray-400 italic">Description</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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

        <ul className="space-y-1 border-b border-gray-300 dark:border-gray-700 pb-4">
          {categories.map(({ key, label }) => (
            <li key={key}>
              <button
                className="flex items-center gap-3 w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                type="button"
              >
                <span className="text-gray-500">{iconMap[key]}</span>
                <span className="capitalize">
                  {counts[key]} {label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 uppercase">
              <Users className="w-5 h-5" />
              {group.members.length} members
            </h4>
            <button
              type="button"
              aria-label="Search members"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => {
              }}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="max-h-64 overflow-y-auto space-y-3">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No members found.
              </p>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 cursor-default select-none"
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
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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

      </div>
    </div>
  );
}
