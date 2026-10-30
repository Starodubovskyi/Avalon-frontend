"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { ensureAccessToken } from "@/lib/api/client";
import {
  ProfileApi,
  type ProfileResponseDto,
} from "@/lib/api/profile";

async function fetcher(): Promise<ProfileResponseDto | null> {
  const token = await ensureAccessToken();
  if (!token) return null;
  return ProfileApi.getMyProfile();
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR("profile/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    revalidateIfStale: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    const onAuth = () => {
      void mutate();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "auth:ts") void mutate();
    };
    window.addEventListener("authchange", onAuth);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("authchange", onAuth);
      window.removeEventListener("storage", onStorage);
    };
  }, [mutate]);

  const user = data?.user;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    (user?.email ?? "").split("@")[0] ||
    "User";

  return {
    profile: data,
    user,
    isLoading,
    error,
    refresh: () => mutate(),
    name: displayName,
    email: user?.email ?? "",
    photoUrl: user?.photoUrl ?? null,
    isAuthenticated: Boolean(user?.id || user?.email),
  };
}
