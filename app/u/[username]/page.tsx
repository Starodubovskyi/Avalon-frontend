import MainLayout from "@/components/layout/MainLayout";
import PublicProfileClient from "@/components/public/PublicProfileClient";
import type {
  PublicUser,
  PublicFriend,
} from "@/components/public/PublicProfile";
import { notFound } from "next/navigation";

import { MOCK_USERS } from "@/components/companyprofile/CompaniRegistation/data/mockUsers";

type Props = { params: { username: string } };

const CURRENT_USER_ID = "u9";

const SOCIAL_GRAPH: Record<string, string[]> = {
  u1: ["u3", "u4", "u9"],
  u2: ["u5"],
  u3: ["u1", "u7", "u9"],
  u4: ["u1"],
  u5: ["u2", "u10"],
  u6: [],
  u7: ["u3", "u9"],
  u8: [],
  u9: ["u1", "u3", "u7", "u11"],
  u10: ["u5"],
  u11: ["u9", "u12"],
  u12: ["u11"],
  u13: [],
  u14: ["u15"],
  u15: ["u14"],
  u16: [],
};

function getById(id: string) {
  return MOCK_USERS.find((u) => u.id === id) || null;
}

function getByUsernameOrId(usernameOrId: string) {
  return (
    MOCK_USERS.find(
      (u) => u.username === usernameOrId || u.id === usernameOrId
    ) || null
  );
}

function getFriendsOf(userId: string): string[] {
  return Array.from(new Set(SOCIAL_GRAPH[userId] || []));
}

function isFriend(aId: string, bId: string): boolean {
  return getFriendsOf(aId).includes(bId);
}

function getMutualFriends(aId: string, bId: string): PublicFriend[] {
  const a = new Set(getFriendsOf(aId));
  const b = new Set(getFriendsOf(bId));
  const mutualIds = Array.from(a).filter((id) => b.has(id));
  return mutualIds
    .map((id) => getById(id))
    .filter(Boolean)
    .map((u) => ({
      id: u!.id,
      firstName: u!.firstName,
      lastName: u!.lastName,
      avatarUrl: u!.avatarUrl,
      profileUrl: `/u/${u!.username}`,
    }));
}

export default function PublicUserPage({ params }: Props) {
  const directory = getByUsernameOrId(params.username);
  if (!directory) return notFound();

  const initialIsFriend = isFriend(CURRENT_USER_ID, directory.id);
  const mutual = getMutualFriends(CURRENT_USER_ID, directory.id);
  const friendsOfProfile = getFriendsOf(directory.id);

  const user: PublicUser = {
    id: directory.id,
    firstName: directory.firstName,
    lastName: directory.lastName,
    role: directory.role,
    company: "Avalon Maritime",
    city: "Constanța",
    country: "RO",
    timezone: "Europe/Bucharest (UTC+2/+3)",
    workingHours: "09:00–17:00",
    avatarUrl: directory.avatarUrl,
    website: directory.profileUrl,
    about:
      "Port operations lead focused on fast turnarounds, transparent communication and safety.",
    languages: ["EN"],
    verified: true,
    online: initialIsFriend,
    stats: {
      friends: friendsOfProfile.length,
      mutual: mutual.length,
      endorsements: 12,
      responseTimeHours: 1,
    },
    mutualFriends: mutual,
    highlights: [
      { id: "h1", title: "Handled 120+ port calls", caption: "Last 12 months" },
      { id: "h2", title: "Top agent in Constanța", caption: "2024 ranking" },
    ],
    endorsements: [],
    activity: [],
  };

  return (
    <MainLayout>
      <div className="min-h-[100dvh] bg-gray-100 dark:bg-black">
        <div className="px-1 sm:px-2 lg:px-2 py-1">
          <div className="w-full rounded-3xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-4 sm:p-6 lg:p-8">
            <PublicProfileClient user={user} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
