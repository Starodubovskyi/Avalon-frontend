"use client";

import { MOCK_USERS } from "@/components/companyprofile/CompaniRegistation/data/mockUsers";

export const CURRENT_USER_ID = "u9";

const STORAGE_KEY = (id: string) => `avalon:friends:${id}`;

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

function readLocalFriends(userId: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocalFriends(userId: string, list: string[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(list));
}

export function getUserByUsername(usernameOrId: string) {
  return (
    MOCK_USERS.find(
      (u) => u.username === usernameOrId || u.id === usernameOrId
    ) || null
  );
}

export function getFriendsOf(userId: string): string[] {
  const base = SOCIAL_GRAPH[userId] || [];
  const local = readLocalFriends(userId);
  return Array.from(new Set([...base, ...local]));
}

export function isFriend(aId: string, bId: string): boolean {
  return getFriendsOf(aId).includes(bId);
}

export function addFriend(aId: string, bId: string): string[] {
  const current = new Set(readLocalFriends(aId));
  current.add(bId);
  writeLocalFriends(aId, Array.from(current));
  return getFriendsOf(aId);
}

export function getMutualFriends(aId: string, bId: string) {
  const a = new Set(getFriendsOf(aId));
  const b = new Set(getFriendsOf(bId));
  const mutualIds = Array.from(a).filter((id) => b.has(id));
  return mutualIds
    .map((id) => MOCK_USERS.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => ({
      id: u!.id,
      firstName: u!.firstName,
      lastName: u!.lastName,
      avatarUrl: u!.avatarUrl,
      profileUrl: u!.profileUrl,
    }));
}
