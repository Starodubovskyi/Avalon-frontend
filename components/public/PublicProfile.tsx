"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconShieldCheck,
  IconUserPlus,
  IconMessageCircle2,
  IconShare3,
  IconClock,
  IconWorld,
  IconBuildingSkyscraper,
  IconMapPin,
  IconUsers,
  IconChevronRight,
  IconLink,
} from "@tabler/icons-react";

export type PublicFriend = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  profileUrl?: string;
};

export type PublicEndorsement = {
  id: string;
  author: PublicFriend;
  text: string;
  dateISO: string;
  skillTags?: string[];
};

export type PublicHighlight = {
  id: string;
  title: string;
  caption?: string;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  company?: string;
  city?: string;
  country?: string;
  timezone?: string;
  workingHours?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  website?: string;
  about?: string;
  languages?: string[];
  verified?: boolean;
  online?: boolean;
  stats?: {
    friends?: number;
    mutual?: number;
    endorsements?: number;
    responseTimeHours?: number;
  };
  mutualFriends?: PublicFriend[];
  highlights?: PublicHighlight[];
  endorsements?: PublicEndorsement[];
  activity?: { id: string; title: string; meta?: string; dateISO: string }[];
};

function initials(first?: string, last?: string) {
  const i1 = (first || "").trim().charAt(0).toUpperCase();
  const i2 = (last || "").trim().charAt(0).toUpperCase();
  return i1 || i2 ? `${i1}${i2}` : "•";
}

const card =
  "rounded-2xl border border-gray-200 bg-white/80 shadow-[0_8px_30px_rgba(2,6,23,0.06)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_8px_30px_rgba(255,255,255,0.05)]";

const chipBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs whitespace-nowrap";
const chipBlue =
  chipBase +
  " border-blue-200/80 text-blue-700 bg-blue-50/80 dark:border-blue-900/50 dark:text-blue-300 dark:bg-blue-900/30";
const chipGray =
  chipBase +
  " border-gray-200 text-gray-700 bg-white/70 dark:border-white/10 dark:text-gray-200 dark:bg-white/5";

export default function PublicProfile({
  user,
  onShare,
  onMessage,
  onAddFriend,
  initialFriendState = "none",
}: {
  user: PublicUser;
  onShare?: () => void;
  onMessage?: () => void;
  onAddFriend?: (userId: string) => Promise<void> | void;
  initialFriendState?: "none" | "pending" | "friends";
}) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [friendState, setFriendState] = useState<
    "none" | "pending" | "friends"
  >(initialFriendState);

  useEffect(() => {
    setFriendState(initialFriendState);
  }, [initialFriendState, user.id]);

  const safeAbout = user.about?.trim() || "No bio yet.";
  const aboutShort =
    safeAbout.length > 240 && !aboutOpen
      ? safeAbout.slice(0, 240) + "…"
      : safeAbout;

  const mutual = user.mutualFriends || [];
  const mutualPreview = mutual.slice(0, 8);

  const languagesLabel = (user.languages || []).join(" · ");
  const stats = {
    friends: user.stats?.friends ?? 0,
    mutual: user.stats?.mutual ?? mutual.length,
    endorsements: user.stats?.endorsements ?? (user.endorsements?.length || 0),
    responseTimeHours: user.stats?.responseTimeHours ?? 1,
  };

  const highlights = user.highlights || [];
  const endorsements = user.endorsements || [];
  const activity = user.activity || [];

  const handleAddFriend = async () => {
    if (friendState !== "none") return;
    setFriendState("pending");
    try {
      await onAddFriend?.(user.id);
      setFriendState("friends");
    } catch {
      setFriendState("none");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className={clsx(card, "p-4 sm:p-6")}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-gray-200 bg-white overflow-hidden dark:bg-black dark:border-white/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-200">
                  {initials(user.firstName, user.lastName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {fullName}
                </h1>
                {user.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                    <IconShieldCheck size={14} />
                    Verified
                  </span>
                )}
                {user.online && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-gray-800 px-2 py-0.5 text-[11px] dark:bg-white/10 dark:text-gray-100">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {[user.role, user.company].filter(Boolean).join(" @ ")}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {[user.city, user.country].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleAddFriend}
              disabled={friendState !== "none"}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-semibold transition",
                friendState === "none" &&
                  "bg-blue-600 text-white hover:bg-blue-700",
                friendState === "pending" &&
                  "bg-blue-600/50 text-white cursor-not-allowed",
                friendState === "friends" &&
                  "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              <IconUserPlus size={18} />
              {friendState === "none" && "Add Friend"}
              {friendState === "pending" && "Request Sent"}
              {friendState === "friends" && "Friends"}
            </button>
            <button
              onClick={onMessage}
              className="inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-semibold border border-gray-200 bg-white/90 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <IconMessageCircle2 size={18} />
              Message
            </button>
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-xl px-4 h-10 text-sm font-semibold border border-gray-200 bg-white/90 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <IconShare3 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className={clsx(card, "p-4 sm:p-5")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={chipBlue}>
                <IconUsers size={14} className="mr-1" />
                Friends: {stats.friends}
              </span>
              <span className={chipBlue}>Mutual: {stats.mutual}</span>
              <span className={chipBlue}>
                Endorsements: {stats.endorsements}
              </span>
              <span className={chipGray}>
                <IconClock size={14} className="mr-1" />
                Avg response ~{stats.responseTimeHours}h
              </span>
              {languagesLabel && (
                <span className={chipGray}>
                  <IconWorld size={14} className="mr-1" />
                  {languagesLabel}
                </span>
              )}
              {user.website && (
                <Link
                  href={user.website}
                  target="_blank"
                  className={
                    chipGray + " hover:bg-white dark:hover:bg-white/10"
                  }
                >
                  <IconLink size={14} className="mr-1" />
                  Website
                </Link>
              )}
            </div>
          </div>

          <div className={clsx(card, "p-4 sm:p-6")}>
            <h3 className="text-sm font-semibold mb-2">About</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {aboutShort}
            </p>
            {safeAbout.length > 240 && (
              <button
                className="mt-2 text-xs font-medium text-blue-700 hover:underline dark:text-blue-300"
                onClick={() => setAboutOpen((v) => !v)}
              >
                {aboutOpen ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          <div className={clsx(card, "p-4 sm:p-6")}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Highlights</h3>
            </div>
            {highlights.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No highlights yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {highlights.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-xl border border-gray-200 bg-white/70 px-3 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {h.title}
                    </div>
                    {h.caption && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {h.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={clsx(card, "p-4 sm:p-6")}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Endorsements</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {endorsements.length}
              </span>
            </div>
            {endorsements.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No endorsements yet.
              </div>
            ) : (
              <div className="space-y-3">
                {endorsements.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-xl border border-gray-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-neutral-800 shrink-0">
                        {e.author.avatarUrl ? (
                          <img
                            src={e.author.avatarUrl}
                            alt={`${e.author.firstName} ${e.author.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-gray-500 dark:text-gray-300">
                            {initials(e.author.firstName, e.author.lastName)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {e.author.firstName} {e.author.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(e.dateISO).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {e.text}
                        </p>
                        {e.skillTags && e.skillTags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {e.skillTags.map((t) => (
                              <span key={t} className={chipGray}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={clsx(card, "p-4 sm:p-6")}>
            <h3 className="text-sm font-semibold mb-3">Contact & Info</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {user.company && (
                <div className="flex items-center gap-2">
                  <IconBuildingSkyscraper size={16} />
                  <span>{user.company}</span>
                </div>
              )}
              {(user.city || user.country) && (
                <div className="flex items-center gap-2">
                  <IconMapPin size={16} />
                  <span>
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {user.timezone && (
                <div className="flex items-center gap-2">
                  <IconWorld size={16} />
                  <span>{user.timezone}</span>
                </div>
              )}
              {user.workingHours && (
                <div className="flex items-center gap-2">
                  <IconClock size={16} />
                  <span>{user.workingHours}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onMessage}
                className="inline-flex items-center gap-2 rounded-xl px-3 h-10 text-sm font-semibold border border-gray-200 bg-white/90 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <IconMessageCircle2 size={18} />
                Message
              </button>
              <button
                onClick={handleAddFriend}
                disabled={friendState !== "none"}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-xl px-3 h-10 text-sm font-semibold transition",
                  friendState === "none" &&
                    "bg-blue-600 text-white hover:bg-blue-700",
                  friendState === "pending" &&
                    "bg-blue-600/50 text-white cursor-not-allowed",
                  friendState === "friends" &&
                    "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                <IconUserPlus size={18} />
                {friendState === "none" && "Add Friend"}
                {friendState === "pending" && "Request Sent"}
                {friendState === "friends" && "Friends"}
              </button>
            </div>
          </div>

          <div className={clsx(card, "p-4 sm:p-6")}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Mutual Friends</h3>
              <Link
                href={`/friends/${user.id}`}
                className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                See all
                <IconChevronRight size={14} />
              </Link>
            </div>
            {mutualPreview.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No mutual friends yet.
              </div>
            ) : (
              <div className="flex -space-x-2">
                {mutualPreview.map((f) => (
                  <Link
                    key={f.id}
                    href={f.profileUrl || "#"}
                    className="inline-block rounded-full ring-2 ring-white dark:ring-black"
                    title={`${f.firstName} ${f.lastName}`}
                  >
                    <img
                      src={
                        f.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          f.firstName + " " + f.lastName
                        )}`
                      }
                      alt={`${f.firstName} ${f.lastName}`}
                      className="h-9 w-9 rounded-full object-cover bg-gray-100 dark:bg-neutral-800"
                    />
                  </Link>
                ))}
                {stats.mutual > mutualPreview.length && (
                  <div className="h-9 w-9 rounded-full grid place-items-center text-[11px] font-semibold bg-gray-100 text-gray-700 ring-2 ring-white dark:bg-white/10 dark:text-gray-200 dark:ring-black">
                    +{stats.mutual - mutualPreview.length}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={clsx(card, "p-4 sm:p-6")}>
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            {activity.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-2">
                {activity.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-gray-200 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {a.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {a.meta ? a.meta + " • " : ""}
                      {new Date(a.dateISO).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sm:hidden sticky bottom-3 z-20">
        <div className="mx-auto max-w-xl">
          <div className="flex gap-2 p-2 rounded-2xl backdrop-blur bg-white/90 border border-gray-200 shadow-lg dark:bg-black/60 dark:border-white/10">
            <button
              onClick={handleAddFriend}
              disabled={friendState !== "none"}
              className={clsx(
                "flex-1 h-10 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition",
                friendState === "none" &&
                  "bg-blue-600 text-white hover:bg-blue-700",
                friendState === "pending" &&
                  "bg-blue-600/50 text-white cursor-not-allowed",
                friendState === "friends" &&
                  "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              <IconUserPlus size={18} />
              {friendState === "none" && "Add Friend"}
              {friendState === "pending" && "Sent"}
              {friendState === "friends" && "Friends"}
            </button>
            <button
              onClick={onMessage}
              className="flex-1 h-10 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 border border-gray-200 bg-white/90 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <IconMessageCircle2 size={18} />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
