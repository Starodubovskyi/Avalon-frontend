"use client";

import { useCallback, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/useAuth";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { NetworkApi } from "@/lib/network/api";
import { PROFILE_ERRORS, ProfilesApi } from "./api";
import type { PersonProfile, ProfileInput } from "./types";

type ProfileKey = readonly ["profile", number];

export function profileKey(userId: number): ProfileKey {
  return ["profile", userId];
}

export function isProfileKey(key: unknown): boolean {
  return Array.isArray(key) && key[0] === "profile";
}

export function useProfile(userId: number | null) {
  const { isAuthed } = useAuth();
  const key = isAuthed && userId !== null && Number.isInteger(userId) ? profileKey(userId) : null;
  return useSWR<PersonProfile>(key, ([, id]: ProfileKey) => ProfilesApi.get(id), { shouldRetryOnError: false });
}

/** PATCH /profiles/me; the caller words the toast (account namespace) */
export function useUpdateMyProfile() {
  const { mutate } = useSWRConfig();
  return useCallback(
    async (input: ProfileInput) => {
      const saved = await ProfilesApi.updateMe(input);
      await mutate(profileKey(saved.user.id), saved, { revalidate: false });
      return saved;
    },
    [mutate],
  );
}

/** Optimistic follow / unfollow on the personal page; the people lists refresh after the server answers */
export function useProfileFollow() {
  const { mutate } = useSWRConfig();
  const errorText = useApiErrorText("profiles", PROFILE_ERRORS);
  const busy = useRef(false);
  return useCallback(
    async (profile: PersonProfile) => {
      if (busy.current) return;
      busy.current = true;
      const key = profileKey(profile.user.id);
      const follow = !profile.isFollowing;
      const delta = follow ? 1 : -1;
      await mutate(
        key,
        { ...profile, isFollowing: follow, stats: { ...profile.stats, followers: Math.max(0, profile.stats.followers + delta) } },
        { revalidate: false },
      );
      try {
        if (follow) await NetworkApi.follow(profile.user.id);
        else await NetworkApi.unfollow(profile.user.id);
        void mutate(key);
        void mutate((k: unknown) => Array.isArray(k) && k[0] === "people");
      } catch (e) {
        await mutate(key, profile, { revalidate: false });
        toast.error(errorText(e));
      } finally {
        busy.current = false;
      }
    },
    [mutate, errorText],
  );
}
